import re
import uuid
import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from datetime import datetime, timezone, timedelta

from database import db
from config import ADMIN_EMAILS
from deps import require_user
from models import UsernameUpdate
from services.levels import get_level
from services.premium import get_top_user_ids

router = APIRouter()


@router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for our session_token."""
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    async with httpx.AsyncClient(timeout=15.0) as http:
        try:
            r = await http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
            )
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid session: {e}")

    email = data["email"]
    name = data.get("name", email.split("@")[0])
    picture = data.get("picture", "")
    session_token = data["session_token"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    is_admin = email.lower() in ADMIN_EMAILS
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "is_admin": is_admin}},
        )
    else:
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
            "picture": picture,
            "username": username,
            "total_xp": 0,
            "questions_answered": 0,
            "correct_answers": 0,
            "chapters_completed": [],
            "daily_challenges_completed": [],
            "is_admin": is_admin,
            "streak": 0,
            "longest_streak": 0,
            "last_active_date": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )

    user_doc_final = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc_final, "session_token": session_token}


@router.get("/auth/me")
async def auth_me(request: Request):
    user = await require_user(request)
    d = user.model_dump()
    d["level"] = get_level(user.total_xp)
    top_ids = await get_top_user_ids()
    d["is_premium"] = user.user_id in top_ids
    return d


@router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@router.put("/auth/username")
async def update_username(payload: UsernameUpdate, request: Request):
    user = await require_user(request)
    uname = payload.username.strip().lstrip("@").lower()
    if not re.fullmatch(r"[a-z0-9_]{3,20}", uname):
        raise HTTPException(status_code=400, detail="Username must be 3-20 chars: a-z, 0-9, underscore")
    existing = await db.users.find_one({"username": uname, "user_id": {"$ne": user.user_id}})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    await db.users.update_one({"user_id": user.user_id}, {"$set": {"username": uname}})
    return {"username": uname}
