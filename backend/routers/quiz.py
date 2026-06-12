import uuid
from fastapi import APIRouter, Request
from datetime import datetime, timezone

from database import db
from deps import require_user
from models import QuizSubmit, QuizResult
from services.levels import get_level
from services.xp import (
    score_answers, base_xp, compute_chapter_bonus, compute_daily_bonus, compute_streak,
)

router = APIRouter()


@router.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(payload: QuizSubmit, request: Request):
    user = await require_user(request)

    qids = [a.question_id for a in payload.answers]
    qdocs = await db.questions.find({"question_id": {"$in": qids}}, {"_id": 0}).to_list(500)
    qmap = {d["question_id"]: d for d in qdocs}

    correct_count, details, chapter_correct = score_answers(payload.answers, qmap)
    answered = len(qmap)
    wrong_count = max(0, answered - correct_count)
    xp_earned = base_xp(correct_count, wrong_count)

    chapter_xp, newly_completed_chapters = compute_chapter_bonus(
        qdocs, chapter_correct, user.chapters_completed
    )
    xp_earned += chapter_xp

    today = datetime.now(timezone.utc).date().isoformat()
    daily_xp, daily_bonus = compute_daily_bonus(
        correct_count, len(payload.answers),
        user.daily_challenges_completed, today
    )
    xp_earned += daily_xp

    # Streak (display only, no XP)
    new_streak = compute_streak(user.last_active_date, user.streak, today)
    new_longest = max(user.longest_streak, new_streak)

    new_total = user.total_xp + xp_earned
    update = {
        "$inc": {
            "total_xp": xp_earned,
            "questions_answered": len(payload.answers),
            "correct_answers": correct_count,
        },
        "$set": {
            "streak": new_streak,
            "longest_streak": new_longest,
            "last_active_date": today,
        },
    }
    add_to_set = {}
    if newly_completed_chapters:
        add_to_set["chapters_completed"] = {"$each": newly_completed_chapters}
    if daily_bonus:
        add_to_set["daily_challenges_completed"] = today
    if add_to_set:
        update["$addToSet"] = add_to_set
    await db.users.update_one({"user_id": user.user_id}, update)

    await db.quiz_attempts.insert_one({
        "attempt_id": f"a_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "mode": payload.mode,
        "subject": payload.subject,
        "correct": correct_count,
        "total": len(payload.answers),
        "xp_earned": xp_earned,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return QuizResult(
        correct=correct_count,
        total=len(payload.answers),
        xp_earned=xp_earned,
        new_total_xp=new_total,
        level=get_level(new_total),
        streak=new_streak,
        details=details,
    )


@router.get("/quiz/history")
async def quiz_history(request: Request, limit: int = 30):
    user = await require_user(request)
    rows = await db.quiz_attempts.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return [{
        "attempt_id": r.get("attempt_id"),
        "mode": r.get("mode"),
        "subject": r.get("subject"),
        "correct": r.get("correct", 0),
        "total": r.get("total", 0),
        "xp_earned": r.get("xp_earned", 0),
        "created_at": r.get("created_at"),
    } for r in rows]
