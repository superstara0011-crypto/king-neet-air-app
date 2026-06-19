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
    xp_earned = base_xp(correct_count, wrong_count, mode=payload.mode)

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

    # ── Per-chapter breakdown (for Subject Progress / Weak Chapters analytics) ──
    chapter_breakdown = {}  # chapter -> {subject, correct, total}
    for doc in qdocs:
        ch = doc.get("chapter", "")
        subj = doc.get("subject", "")
        if ch not in chapter_breakdown:
            chapter_breakdown[ch] = {"subject": subj, "correct": 0, "total": 0}
        chapter_breakdown[ch]["total"] += 1
    for ch, cnt in chapter_correct.items():
        if ch in chapter_breakdown:
            chapter_breakdown[ch]["correct"] = cnt

    await db.quiz_attempts.insert_one({
        "attempt_id": f"a_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "mode": payload.mode,
        "subject": payload.subject,
        "correct": correct_count,
        "total": len(payload.answers),
        "xp_earned": xp_earned,
        "chapter_breakdown": chapter_breakdown,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # ── Auto-save wrong answers to Mistake Notebook ──────────────────────────
    wrong_details = [d for d in details if not d["is_correct"]]
    if wrong_details:
        qid_to_doc = {d["question_id"]: qmap.get(d["question_id"], {}) for d in wrong_details}
        mistake_docs = []
        for d in wrong_details:
            doc = qid_to_doc.get(d["question_id"], {})
            mistake_docs.append({
                "mistake_id": f"m_{uuid.uuid4().hex[:12]}",
                "user_id": user.user_id,
                "question_id": d["question_id"],
                "subject": doc.get("subject", payload.subject or ""),
                "chapter": doc.get("chapter", ""),
                "question": d["question"],
                "options": d["options"],
                "selected": d["selected"],
                "correct": d["correct"],
                "explanation": d["explanation"],
                "image_url": d.get("image_url", ""),
                "resolved": False,   # becomes True once student retries correctly
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        if mistake_docs:
            await db.mistakes.insert_many(mistake_docs)

    # ── Mark mistakes as resolved if this attempt got them right (retry flow) ──
    correct_qids = [d["question_id"] for d in details if d["is_correct"]]
    if correct_qids:
        await db.mistakes.update_many(
            {"user_id": user.user_id, "question_id": {"$in": correct_qids}, "resolved": False},
            {"$set": {"resolved": True}}
        )

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


# ════════════════════════════════════════════════════════════════════════════
# MISTAKE NOTEBOOK
# ════════════════════════════════════════════════════════════════════════════
@router.get("/quiz/mistakes")
async def get_mistakes(request: Request, subject: str = None, limit: int = 100):
    """List unresolved mistakes for the Mistake Notebook page."""
    user = await require_user(request)
    q = {"user_id": user.user_id, "resolved": False}
    if subject and subject != "all":
        q["subject"] = subject
    rows = await db.mistakes.find(q, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)

    by_subject = {"biology": 0, "physics": 0, "chemistry": 0}
    all_unresolved = await db.mistakes.find({"user_id": user.user_id, "resolved": False}, {"_id": 0, "subject": 1}).to_list(2000)
    for m in all_unresolved:
        s = m.get("subject", "")
        if s in by_subject:
            by_subject[s] += 1

    return {"mistakes": rows, "counts": by_subject, "total": len(all_unresolved)}


@router.delete("/quiz/mistakes/{mistake_id}")
async def dismiss_mistake(mistake_id: str, request: Request):
    """Manually dismiss a mistake from the notebook (mark resolved without retrying)."""
    user = await require_user(request)
    res = await db.mistakes.update_one(
        {"mistake_id": mistake_id, "user_id": user.user_id},
        {"$set": {"resolved": True}}
    )
    return {"ok": res.matched_count > 0}
