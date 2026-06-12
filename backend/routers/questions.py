import random
from typing import Optional
from fastapi import APIRouter

from database import db
from models import QuestionOut
from services.questions import ai_generate_questions

router = APIRouter()


@router.get("/chapters")
async def list_chapters(subject: Optional[str] = None):
    """Return chapters (with question counts) for a subject for chapter-wise practice."""
    match = {}
    if subject and subject != "all":
        match["subject"] = subject
    pipeline = [
        {"$match": match},
        {"$group": {"_id": "$chapter", "count": {"$sum": 1}, "subject": {"$first": "$subject"}}},
        {"$sort": {"_id": 1}},
    ]
    rows = await db.questions.aggregate(pipeline).to_list(500)
    return [{"chapter": r["_id"], "count": r["count"], "subject": r["subject"]} for r in rows]


@router.get("/questions")
async def get_questions(
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    mode: str = "pyq",
    limit: int = 10,
):
    """Fetch questions for a quiz session."""
    q: dict = {}
    if subject and subject != "all":
        q["subject"] = subject
    if chapter:
        q["chapter"] = chapter
    if mode == "pyq":
        q["is_pyq"] = True

    docs = await db.questions.find(q, {"_id": 0, "correct": 0, "explanation": 0}).to_list(500)

    # Top up via AI if too few (not for PYQ mode and not chapter-restricted)
    if len(docs) < limit and subject and subject != "all" and mode not in ("pyq", "chapter"):
        gen = await ai_generate_questions(subject, count=max(5, limit - len(docs)))
        for d in gen:
            docs.append({k: v for k, v in d.items() if k not in ("correct", "explanation", "_id")})

    random.shuffle(docs)
    docs = docs[:limit]
    return [QuestionOut(id=d["question_id"], subject=d["subject"], chapter=d["chapter"],
                        question=d["question"], options=d["options"],
                        is_pyq=d.get("is_pyq", False), year=d.get("year")) for d in docs]
