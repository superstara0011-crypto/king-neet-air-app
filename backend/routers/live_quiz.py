"""
backend/routers/live_quiz.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
King NEET AIR — Live Quiz System

Admin endpoints (require admin):
  GET    /admin/live-quiz                  → list all live quizzes
  POST   /admin/live-quiz                  → create new live quiz
  PUT    /admin/live-quiz/{quiz_id}         → update a live quiz
  DELETE /admin/live-quiz/{quiz_id}         → delete a live quiz
  POST   /admin/live-quiz/{quiz_id}/go-live → instantly activate now
  POST   /admin/live-quiz/{quiz_id}/end     → end it now (lock immediately)

Student endpoints:
  GET  /live-quiz                  → list quizzes that are live or upcoming
  GET  /live-quiz/{quiz_id}        → get one quiz with its questions (no answers)
  POST /live-quiz/{quiz_id}/submit → submit answers, get score + XP

A "live quiz" is just a named bundle of custom questions with a time window.
Students can attempt it any time inside [starts_at, ends_at] (or always, if
"go_live" was pressed manually with no end time set).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel

from database import db
from models import User
from deps import require_user, require_admin
from services.levels import get_level

router = APIRouter()


# ── Models ────────────────────────────────────────────────────────────────────
class LiveQuestionIn(BaseModel):
    question: str
    options: List[str]
    correct: int
    explanation: str = ""
    image_url: str = ""
    subject: str = "biology"


class LiveQuizCreate(BaseModel):
    title: str
    description: str = ""
    subject: str = "mixed"          # biology / physics / chemistry / mixed
    duration_minutes: int = 30      # how long a student gets once they start
    starts_at: Optional[str] = None  # ISO datetime string, None = manual go-live only
    ends_at: Optional[str] = None    # ISO datetime string, None = no end (open until manually ended)
    xp_per_correct: int = 4
    xp_penalty_wrong: int = 1
    questions: List[LiveQuestionIn] = []


class LiveQuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    duration_minutes: Optional[int] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    xp_per_correct: Optional[int] = None
    xp_penalty_wrong: Optional[int] = None
    questions: Optional[List[LiveQuestionIn]] = None


class SubmitAnswers(BaseModel):
    answers: List[int]   # index per question, -1 if skipped


# ── Helpers ───────────────────────────────────────────────────────────────────
def _now():
    return datetime.now(timezone.utc)

def _parse(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None

def _status(quiz):
    """Compute live/upcoming/ended status from timestamps + manual flags."""
    now = _now()
    if quiz.get("manually_ended"):
        return "ended"
    if quiz.get("manually_live"):
        ends = _parse(quiz.get("ends_at"))
        if ends and now > ends:
            return "ended"
        return "live"
    starts = _parse(quiz.get("starts_at"))
    ends = _parse(quiz.get("ends_at"))
    if starts and now < starts:
        return "upcoming"
    if ends and now > ends:
        return "ended"
    if starts and (not ends or now <= ends):
        return "live"
    return "draft"


def _public_quiz(quiz):
    """Strip answers/explanations for student-facing list view."""
    return {
        "id": quiz["quiz_id"],
        "title": quiz["title"],
        "description": quiz.get("description", ""),
        "subject": quiz.get("subject", "mixed"),
        "duration_minutes": quiz.get("duration_minutes", 30),
        "starts_at": quiz.get("starts_at"),
        "ends_at": quiz.get("ends_at"),
        "question_count": len(quiz.get("questions", [])),
        "status": _status(quiz),
    }


# ════════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@router.get("/admin/live-quiz")
async def admin_list_live_quizzes(admin: User = Depends(require_admin)):
    docs = await db.live_quizzes.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    for d in docs:
        d["status"] = _status(d)
        d["question_count"] = len(d.get("questions", []))
    return docs


@router.post("/admin/live-quiz")
async def admin_create_live_quiz(payload: LiveQuizCreate, admin: User = Depends(require_admin)):
    user = admin

    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if len(payload.questions) == 0:
        raise HTTPException(status_code=400, detail="Add at least one question")

    quiz_id = f"lq_{uuid.uuid4().hex[:12]}"
    doc = {
        "quiz_id": quiz_id,
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "subject": payload.subject,
        "duration_minutes": payload.duration_minutes,
        "starts_at": payload.starts_at,
        "ends_at": payload.ends_at,
        "xp_per_correct": payload.xp_per_correct,
        "xp_penalty_wrong": payload.xp_penalty_wrong,
        "questions": [q.model_dump() for q in payload.questions],
        "manually_live": False,
        "manually_ended": False,
        "created_by": user.user_id,
        "created_at": _now().isoformat(),
    }
    await db.live_quizzes.insert_one(doc)
    doc.pop("_id", None)
    doc["status"] = _status(doc)
    return doc


@router.put("/admin/live-quiz/{quiz_id}")
async def admin_update_live_quiz(quiz_id: str, payload: LiveQuizUpdate, admin: User = Depends(require_admin)):
    existing = await db.live_quizzes.find_one({"quiz_id": quiz_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Quiz not found")

    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "questions" in update:
        update["questions"] = [q if isinstance(q, dict) else q.model_dump() for q in update["questions"]]

    if update:
        await db.live_quizzes.update_one({"quiz_id": quiz_id}, {"$set": update})

    doc = await db.live_quizzes.find_one({"quiz_id": quiz_id}, {"_id": 0})
    doc["status"] = _status(doc)
    return doc


@router.delete("/admin/live-quiz/{quiz_id}")
async def admin_delete_live_quiz(quiz_id: str, admin: User = Depends(require_admin)):
    result = await db.live_quizzes.delete_one({"quiz_id": quiz_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"ok": True}


@router.post("/admin/live-quiz/{quiz_id}/go-live")
async def admin_go_live(quiz_id: str, admin: User = Depends(require_admin)):
    result = await db.live_quizzes.update_one(
        {"quiz_id": quiz_id},
        {"$set": {"manually_live": True, "manually_ended": False, "starts_at": _now().isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"ok": True, "status": "live"}


@router.post("/admin/live-quiz/{quiz_id}/end")
async def admin_end_quiz(quiz_id: str, admin: User = Depends(require_admin)):
    result = await db.live_quizzes.update_one(
        {"quiz_id": quiz_id},
        {"$set": {"manually_ended": True, "manually_live": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"ok": True, "status": "ended"}


# ════════════════════════════════════════════════════════════════════════════
# STUDENT ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@router.get("/live-quiz")
async def list_live_quizzes(request: Request):
    """Show quizzes that are currently live or upcoming (hide ended + draft)."""
    docs = await db.live_quizzes.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    visible = []
    for d in docs:
        status = _status(d)
        if status in ("live", "upcoming"):
            pub = _public_quiz(d)
            visible.append(pub)
    return visible


@router.get("/live-quiz/{quiz_id}")
async def get_live_quiz(quiz_id: str, request: Request):
    await require_user(request)
    doc = await db.live_quizzes.find_one({"quiz_id": quiz_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Quiz not found")

    status = _status(doc)
    if status == "upcoming":
        raise HTTPException(status_code=403, detail="This quiz hasn't started yet")
    if status == "ended":
        raise HTTPException(status_code=403, detail="This quiz has ended")

    # Strip correct answers + explanations before sending to student
    safe_questions = [
        {
            "question": q["question"],
            "options": q["options"],
            "image_url": q.get("image_url", ""),
            "subject": q.get("subject", doc.get("subject", "mixed")),
        }
        for q in doc.get("questions", [])
    ]

    return {
        "id": doc["quiz_id"],
        "title": doc["title"],
        "description": doc.get("description", ""),
        "duration_minutes": doc.get("duration_minutes", 30),
        "questions": safe_questions,
    }


@router.post("/live-quiz/{quiz_id}/submit")
async def submit_live_quiz(quiz_id: str, payload: SubmitAnswers, request: Request):
    user = await require_user(request)
    doc = await db.live_quizzes.find_one({"quiz_id": quiz_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Quiz not found")

    status = _status(doc)
    if status == "upcoming":
        raise HTTPException(status_code=403, detail="This quiz hasn't started yet")
    if status == "ended":
        raise HTTPException(status_code=403, detail="This quiz has ended")

    # Prevent double-attempt
    already = await db.live_quiz_attempts.find_one({"quiz_id": quiz_id, "user_id": user.user_id})
    if already:
        raise HTTPException(status_code=400, detail="You've already attempted this quiz")

    questions = doc.get("questions", [])
    xp_correct = doc.get("xp_per_correct", 4)
    xp_wrong = doc.get("xp_penalty_wrong", 1)

    correct_count = 0
    wrong_count = 0
    xp_earned = 0
    results = []

    for i, q in enumerate(questions):
        given = payload.answers[i] if i < len(payload.answers) else -1
        is_correct = given == q["correct"]
        if given == -1:
            pass  # skipped, no penalty
        elif is_correct:
            correct_count += 1
            xp_earned += xp_correct
        else:
            wrong_count += 1
            xp_earned -= xp_wrong
        results.append({
            "question": q["question"],
            "correct_answer": q["correct"],
            "given_answer": given,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    xp_earned = max(0, xp_earned)  # never go negative total

    # Save attempt
    await db.live_quiz_attempts.insert_one({
        "quiz_id": quiz_id,
        "user_id": user.user_id,
        "correct": correct_count,
        "wrong": wrong_count,
        "total": len(questions),
        "xp_earned": xp_earned,
        "submitted_at": _now().isoformat(),
    })

    # Update user XP
    await db.users.update_one(
        {"user_id": user.user_id},
        {
            "$inc": {
                "total_xp": xp_earned,
                "questions_answered": len(questions),
                "correct_answers": correct_count,
            }
        },
    )

    return {
        "correct": correct_count,
        "wrong": wrong_count,
        "total": len(questions),
        "xp_earned": xp_earned,
        "results": results,
    }
