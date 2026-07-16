"""
backend/routers/doubt.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI Doubt Solving — King NEET AIR
Students ask NEET (Bio/Physics/Chem) doubts, Gemini answers
in a tutor-style voice. Calls Gemini's REST API directly via
httpx (no extra package needed — same GEMINI_API_KEY already
configured for admin question-generation). Daily per-user cap
keeps API costs predictable.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import os
import uuid
import httpx
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

from database import db
from deps import require_user

router = APIRouter(prefix="/doubt", tags=["doubt"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash-lite"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

SYSTEM_PROMPT = """You are a friendly, expert NEET tutor helping an Indian medical entrance
exam aspirant with Biology, Physics, or Chemistry doubts.

- Explain clearly and concisely, in language an 11th/12th grade student understands.
- Use NCERT terminology where relevant, since that's the exam's primary syllabus reference.
- Keep answers focused and exam-relevant — no unnecessary tangents.
- If a question is unclear or unrelated to NEET subjects, politely redirect the student
  back to Biology, Physics, or Chemistry topics.
"""

DAILY_DOUBT_CAP = 20  # per-user daily limit


class AskRequest(BaseModel):
    question: str


async def call_gemini(question: str) -> str:
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": question}]}],
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


@router.post("/ask")
async def ask_doubt(payload: AskRequest, request: Request):
    user = await require_user(request)
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question can't be empty")

    today = datetime.now(timezone.utc).date().isoformat()
    used_today = await db.doubt_history.count_documents({"user_id": user.user_id, "date": today})
    if used_today >= DAILY_DOUBT_CAP:
        raise HTTPException(
            status_code=429,
            detail=f"Daily limit reached ({DAILY_DOUBT_CAP} questions/day). Try again tomorrow!",
        )

    try:
        answer = await call_gemini(question)
    except Exception:
        raise HTTPException(status_code=503, detail="AI is unavailable right now — try again in a bit")

    doc = {
        "doubt_id": f"d_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "question": question,
        "answer": answer,
        "date": today,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.doubt_history.insert_one(doc)

    return {"answer": answer, "remaining_today": DAILY_DOUBT_CAP - used_today - 1}


@router.get("/history")
async def get_history(request: Request, limit: int = 50):
    user = await require_user(request)
    rows = await db.doubt_history.find({"user_id": user.user_id}, {"_id": 0}) \
        .sort("created_at", 1).limit(limit).to_list(limit)
    return {"history": rows}
