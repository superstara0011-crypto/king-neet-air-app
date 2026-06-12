import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from database import db
from models import User, QuestionIn, AIGenerateRequest
from deps import require_admin
from services.levels import get_level
from services.questions import ai_generate_questions, ai_daily_remaining, ai_generated_today

router = APIRouter(prefix="/admin")


@router.get("/stats")
async def admin_stats(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_questions = await db.questions.count_documents({})
    total_pyq = await db.questions.count_documents({"is_pyq": True})
    total_ai = await db.questions.count_documents({"source": "ai"})
    total_attempts = await db.quiz_attempts.count_documents({})
    by_subject = {}
    for subj in ("biology", "physics", "chemistry"):
        by_subject[subj] = await db.questions.count_documents({"subject": subj})
    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "total_pyq": total_pyq,
        "total_ai": total_ai,
        "total_attempts": total_attempts,
        "questions_by_subject": by_subject,
        "ai_generated_today": await ai_generated_today(),
        "ai_daily_remaining": await ai_daily_remaining(),
    }


@router.get("/users")
async def admin_list_users(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0}).sort("total_xp", -1).to_list(2000)
    out = []
    for u in users:
        qa = u.get("questions_answered", 0)
        acc = round((u.get("correct_answers", 0) / qa) * 100, 1) if qa > 0 else 0.0
        attempts = await db.quiz_attempts.count_documents({"user_id": u["user_id"]})
        out.append({
            "user_id": u["user_id"],
            "email": u.get("email"),
            "name": u.get("name"),
            "username": u.get("username"),
            "picture": u.get("picture", ""),
            "total_xp": u.get("total_xp", 0),
            "questions_answered": qa,
            "correct_answers": u.get("correct_answers", 0),
            "accuracy": acc,
            "attempts": attempts,
            "streak": u.get("streak", 0),
            "is_admin": u.get("is_admin", False),
            "level": get_level(u.get("total_xp", 0)),
            "created_at": u.get("created_at"),
        })
    return out


@router.get("/questions")
async def admin_list_questions(subject: Optional[str] = None, admin: User = Depends(require_admin)):
    q = {}
    if subject and subject != "all":
        q["subject"] = subject
    docs = await db.questions.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [{
        "id": d["question_id"],
        "subject": d["subject"],
        "chapter": d["chapter"],
        "question": d["question"],
        "options": d["options"],
        "correct": d["correct"],
        "explanation": d.get("explanation", ""),
        "is_pyq": d.get("is_pyq", False),
        "year": d.get("year"),
        "source": d.get("source", "seed"),
    } for d in docs]


@router.post("/questions")
async def admin_create_question(payload: QuestionIn, admin: User = Depends(require_admin)):
    if len(payload.options) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 options required")
    if not (0 <= payload.correct <= 3):
        raise HTTPException(status_code=400, detail="correct must be index 0-3")
    doc = {
        "question_id": f"q_{uuid.uuid4().hex[:12]}",
        "subject": payload.subject,
        "chapter": payload.chapter,
        "question": payload.question,
        "options": payload.options,
        "correct": payload.correct,
        "explanation": payload.explanation,
        "is_pyq": payload.is_pyq,
        "year": payload.year,
        "source": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.questions.insert_one(doc)
    return {"id": doc["question_id"]}


@router.put("/questions/{question_id}")
async def admin_update_question(question_id: str, payload: QuestionIn, admin: User = Depends(require_admin)):
    if len(payload.options) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 options required")
    if not (0 <= payload.correct <= 3):
        raise HTTPException(status_code=400, detail="correct must be index 0-3")
    res = await db.questions.update_one(
        {"question_id": question_id},
        {"$set": {
            "subject": payload.subject,
            "chapter": payload.chapter,
            "question": payload.question,
            "options": payload.options,
            "correct": payload.correct,
            "explanation": payload.explanation,
            "is_pyq": payload.is_pyq,
            "year": payload.year,
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"ok": True}


@router.delete("/questions/{question_id}")
async def admin_delete_question(question_id: str, admin: User = Depends(require_admin)):
    res = await db.questions.delete_one({"question_id": question_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"ok": True}


@router.post("/questions/ai-generate")
async def admin_ai_generate(payload: AIGenerateRequest, admin: User = Depends(require_admin)):
    remaining = await ai_daily_remaining()
    if remaining <= 0:
        raise HTTPException(status_code=429, detail="Daily AI generation limit reached. Try again tomorrow.")
    count = max(1, min(20, payload.count))
    docs = await ai_generate_questions(payload.subject, count=count)
    return {"generated": len(docs), "ai_daily_remaining": await ai_daily_remaining()}
