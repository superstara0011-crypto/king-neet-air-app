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

GOOGLE_CLIENT_ID = None  # Set via env var GOOGLE_CLIENT_ID

@router.get("/auth/google/url")
async def google_auth_url(request: Request):
    """Return Google OAuth URL for frontend to redirect to."""
    import os
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    if not client_id:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "")
    scope = "openid email profile"
    state = uuid.uuid4().hex
    
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&state={state}"
        f"&access_type=offline"
    )
    return {"url": url, "state": state}


@router.post("/auth/google/callback")
async def google_callback(request: Request, response: Response):
    """Exchange Google auth code for user session."""
    import os
    body = await request.json()
    code = body.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "")

    # Exchange code for tokens
    async with httpx.AsyncClient() as http:
        token_resp = await http.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            }
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to exchange code")
        
        tokens = token_resp.json()
        access_token = tokens.get("access_token")
        
        # Get user info from Google
        userinfo_resp = await http.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to get user info")
        
        google_user = userinfo_resp.json()

    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0])
    picture = google_user.get("picture", "")

    if not email:
        raise HTTPException(status_code=401, detail="No email from Google")

    is_admin = email.lower() in ADMIN_EMAILS
    existing = await db.users.find_one({"email": email}, {"_id": 0})

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

    # Create session token
    session_token = uuid.uuid4().hex + uuid.uuid4().hex
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
