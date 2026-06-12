from database import db
from config import PREMIUM_TOP_N


async def get_top_user_ids(n: int = PREMIUM_TOP_N) -> set:
    """Top-N of the all-time leaderboard (deterministic: XP desc, then older first)."""
    top = await db.users.find({}, {"_id": 0, "user_id": 1}).sort(
        [("total_xp", -1), ("created_at", 1)]
    ).limit(n).to_list(n)
    return {u["user_id"] for u in top}


async def compute_rank(user_id: str, total_xp: int, created_at) -> int:
    """Rank using the same deterministic ordering as the leaderboard."""
    higher = await db.users.count_documents({"total_xp": {"$gt": total_xp}})
    tied_before = await db.users.count_documents({
        "total_xp": total_xp,
        "created_at": {"$lt": created_at},
        "user_id": {"$ne": user_id},
    })
    return higher + tied_before + 1
