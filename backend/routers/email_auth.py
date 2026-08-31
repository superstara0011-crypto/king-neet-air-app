"""
backend/routers/email_auth.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
King NEET AIR — Email + OTP (signup only) + Password (login) auth.

This is a SEPARATE, parallel path alongside Google login (auth.py) —
it does NOT replace it. Uses the exact same database, User model, and
session mechanism as auth.py, so accounts created here work identically
everywhere else in the app (Dashboard, Tracker, Quiz, Profile, etc.)

Flow:
  1. POST /auth/register/send-otp   → emails a 6-digit code
  2. POST /auth/register/complete   → verify code + set password + create account
  3. POST /auth/login               → email + password, no OTP needed again

.env needed:
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

requirements.txt needs: bcrypt (already present)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import os
import re
import uuid
import random
import string
import requests
import bcrypt
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import db

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "King NEET AIR <onboarding@resend.dev>")
OTP_EXPIRE_MINUTES = 10


class SendOtpReq(BaseModel):
    email: EmailStr


class RegisterCompleteReq(BaseModel):
    email: EmailStr
    otp: str
    name: str
    password: str


class LoginReq(BaseModel):
    email: EmailStr
    password: str


def gen_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(to_email: str, otp: str):
    """Returns (success: bool, reason: str). reason is only meaningful when
    success is False — it's the ACTUAL cause, straight from Resend, instead
    of a generic message, so failures are self-explanatory going forward."""
    if not RESEND_API_KEY:
        return False, "RESEND_API_KEY is not set on the server"

    html = f"""<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0b14;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="460" style="background:#0f1128;border-radius:20px;border:1px solid rgba(124,58,237,0.3);">
<tr><td style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:28px;text-align:center;border-radius:20px 20px 0 0;">
<div style="font-size:36px;">👑</div>
<div style="font-size:22px;font-weight:900;color:#fff;">KING NEET AIR</div>
</td></tr>
<tr><td style="padding:36px 32px;text-align:center;">
<div style="font-size:15px;color:#9ca3af;margin-bottom:6px;">Your signup code:</div>
<div style="background:rgba(124,58,237,0.12);border:2px solid rgba(124,58,237,0.5);border-radius:16px;padding:28px 20px;margin:16px auto;display:inline-block;">
<div style="font-size:48px;font-weight:900;letter-spacing:16px;color:#a78bfa;font-family:monospace;">{otp}</div>
</div>
<div style="font-size:13px;color:#9ca3af;margin-top:16px;">Valid for {OTP_EXPIRE_MINUTES} minutes only</div>
</td></tr>
</table></td></tr></table></body></html>"""

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": RESEND_FROM_EMAIL, "to": [to_email], "subject": f"👑 {otp} — King NEET AIR Signup Code", "html": html},
            timeout=15,
        )
        if resp.status_code in (200, 201):
            return True, ""
        try:
            err_data = resp.json()
            reason = err_data.get("message") or resp.text[:200]
        except Exception:
            reason = resp.text[:200]
        return False, reason
    except Exception as e:
        return False, str(e)


async def create_session_and_respond(user_id: str, response: Response):
    """Exact same session pattern as auth.py's Google login, so /auth/me and
    everything else that reads the session_token cookie works identically."""
    session_token = uuid.uuid4().hex + uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token", value=session_token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}


@router.post("/auth/register/send-otp")
@limiter.limit("3/minute")
async def register_send_otp(payload: SendOtpReq, request: Request):
    email = payload.email.lower().strip()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists — try logging in instead.")

    recent = await db.registration_otps.find_one({"email": email})
    if recent:
        elapsed = (datetime.now(timezone.utc) - datetime.fromisoformat(recent["created_at"])).total_seconds()
        if elapsed < 60:
            raise HTTPException(status_code=429, detail=f"Wait {int(60 - elapsed)}s before requesting another code")

    otp = gen_otp()
    await db.registration_otps.delete_many({"email": email})
    await db.registration_otps.insert_one({
        "email": email,
        "otp": otp,
        "attempts": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    sent, reason = send_otp_email(email, otp)
    if not sent:
        await db.registration_otps.delete_many({"email": email})
        raise HTTPException(status_code=500, detail=f"Couldn't send the email: {reason}")

    return {"success": True, "message": f"Code sent to {email}"}


@router.post("/auth/register/complete")
async def register_complete(payload: RegisterCompleteReq, request: Request, response: Response):
    email = payload.email.lower().strip()
    name = payload.name.strip()
    password = payload.password

    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Please enter your name")

    record = await db.registration_otps.find_one({"email": email})
    if not record:
        raise HTTPException(status_code=400, detail="Code expired or not found — request a new one")
    if record["attempts"] >= 5:
        await db.registration_otps.delete_many({"email": email})
        raise HTTPException(status_code=400, detail="Too many wrong attempts — request a new code")
    if record["otp"] != payload.otp.strip():
        await db.registration_otps.update_one({"email": email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail=f"Wrong code — {4 - record['attempts']} attempts left")

    await db.registration_otps.delete_many({"email": email})

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists — try logging in instead.")

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    base_username = re.sub(r"[^a-z0-9_]", "", email.split("@")[0].lower())[:15] or f"user{uuid.uuid4().hex[:6]}"
    username = base_username
    i = 1
    while await db.users.find_one({"username": username}):
        username = f"{base_username}{i}"
        i += 1

    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": "",
        "username": username,
        "password_hash": password_hash,
        "total_xp": 0,
        "questions_answered": 0,
        "correct_answers": 0,
        "chapters_completed": [],
        "daily_challenges_completed": [],
        "is_admin": False,
        "admin_role": "",
        "streak": 0,
        "longest_streak": 0,
        "last_active_date": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)

    return await create_session_and_respond(user_id, response)


@router.post("/auth/login")
@limiter.limit("10/minute")
async def login(payload: LoginReq, request: Request, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})

    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    if not bcrypt.checkpw(payload.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    return await create_session_and_respond(user["user_id"], response)
