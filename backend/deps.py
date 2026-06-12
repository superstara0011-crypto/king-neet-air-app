from fastapi import Request, HTTPException
from typing import Optional
from datetime import datetime, timezone

from database import db
from models import User


async def get_current_user(request: Request) -> Optional[User]:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    return User(**user_doc)


async def require_user(request: Request) -> User:
    u = await get_current_user(request)
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return u


async def require_admin(request: Request) -> User:
    u = await require_user(request)
    if not u.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return u
