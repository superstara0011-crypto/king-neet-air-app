from fastapi import APIRouter
from datetime import datetime, timezone, timedelta

from database import db
from config import PREMIUM_TOP_N
from services.levels import get_level
from services.premium import get_top_user_ids

router = APIRouter()


@router.get("/leaderboard")
async def leaderboard(period: str = "all_time", limit: int = 50):
    now = datetime.now(timezone.utc)
    if period == "daily":
        since = now - timedelta(days=1)
    elif period == "weekly":
        since = now - timedelta(days=7)
    elif period == "monthly":
        since = now - timedelta(days=30)
    else:
        since = None

    if since is None:
        users = await db.users.find({}, {"_id": 0}).sort(
            [("total_xp", -1), ("created_at", 1)]
        ).limit(limit).to_list(limit)
        out = []
        for i, u in enumerate(users):
            out.append({
                "rank": i + 1,
                "user_id": u["user_id"],
                "username": u.get("username") or u["name"],
                "name": u["name"],
                "picture": u.get("picture", ""),
                "xp": u.get("total_xp", 0),
                "level": get_level(u.get("total_xp", 0)),
                "is_premium": i < PREMIUM_TOP_N,
            })
        return out

    pipeline = [
        {"$match": {"created_at": {"$gte": since.isoformat()}}},
        {"$group": {"_id": "$user_id", "period_xp": {"$sum": "$xp_earned"}}},
        {"$sort": {"period_xp": -1}},
        {"$limit": limit},
    ]
    rows = await db.quiz_attempts.aggregate(pipeline).to_list(limit)
    user_ids = [r["_id"] for r in rows]
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(limit)
    umap = {u["user_id"]: u for u in users}
    top_ids = await get_top_user_ids()
    out = []
    for i, r in enumerate(rows):
        u = umap.get(r["_id"])
        if not u:
            continue
        out.append({
            "rank": i + 1,
            "user_id": u["user_id"],
            "username": u.get("username") or u["name"],
            "name": u["name"],
            "picture": u.get("picture", ""),
            "xp": r["period_xp"],
            "level": get_level(u.get("total_xp", 0)),
            "is_premium": u["user_id"] in top_ids,
        })
    return out
