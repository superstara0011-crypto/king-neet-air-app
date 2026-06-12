from fastapi import APIRouter, HTTPException

from database import db
from services.levels import get_level, LEVELS
from services.premium import get_top_user_ids, compute_rank

router = APIRouter()


@router.get("/profile/{username}")
async def get_profile(username: str):
    uname = username.lstrip("@").lower()
    u = await db.users.find_one({"username": uname}, {"_id": 0, "email": 0})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    rank = await compute_rank(u["user_id"], u.get("total_xp", 0), u.get("created_at"))
    top_ids = await get_top_user_ids()
    accuracy = 0.0
    if u.get("questions_answered", 0) > 0:
        accuracy = round((u.get("correct_answers", 0) / u["questions_answered"]) * 100, 1)

    return {
        "user_id": u["user_id"],
        "username": u.get("username"),
        "name": u["name"],
        "picture": u.get("picture", ""),
        "total_xp": u.get("total_xp", 0),
        "questions_answered": u.get("questions_answered", 0),
        "correct_answers": u.get("correct_answers", 0),
        "accuracy": accuracy,
        "chapters_completed": u.get("chapters_completed", []),
        "level": get_level(u.get("total_xp", 0)),
        "rank": rank,
        "is_premium": u["user_id"] in top_ids,
        "streak": u.get("streak", 0),
        "longest_streak": u.get("longest_streak", 0),
    }


@router.get("/levels")
async def list_levels():
    return [{"min": low, "max": high, "name": name, "emoji": emoji}
            for low, high, name, emoji in LEVELS]
