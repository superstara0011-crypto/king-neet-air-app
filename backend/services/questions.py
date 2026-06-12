"""Question seeding, AI generation and AI cost-cap helpers."""
import json
import logging
import re
import uuid
from datetime import datetime, timezone, date
from typing import List

from database import db
from config import EMERGENT_LLM_KEY, AI_DAILY_CAP
from data.seed_questions import SEED_QUESTIONS


async def ensure_seed_questions():
    """Insert any seed questions not already present (idempotent by question text)."""
    existing_texts = set(await db.questions.distinct("question"))
    docs = []
    for q in SEED_QUESTIONS:
        if q["question"] in existing_texts:
            continue
        docs.append({
            "question_id": f"q_{uuid.uuid4().hex[:12]}",
            "subject": q["subject"],
            "chapter": q["chapter"],
            "question": q["question"],
            "options": q["options"],
            "correct": q["correct"],
            "explanation": q["explanation"],
            "is_pyq": q.get("is_pyq", False),
            "year": q.get("year"),
            "source": "seed",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    if docs:
        await db.questions.insert_many(docs)
        logging.info(f"Seeded {len(docs)} new questions")


async def ai_generated_today() -> int:
    """Count AI-generated questions created today (UTC)."""
    today = date.today().isoformat()
    return await db.questions.count_documents({
        "source": "ai",
        "created_at": {"$gte": today},
    })


async def ai_daily_remaining() -> int:
    return max(0, AI_DAILY_CAP - await ai_generated_today())


async def ai_generate_questions(subject: str, count: int = 5) -> List[dict]:
    """Generate NEET MCQs using Claude via emergentintegrations, respecting the daily cap."""
    if not EMERGENT_LLM_KEY:
        return []
    remaining = await ai_daily_remaining()
    if remaining <= 0:
        return []
    count = min(count, remaining)
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"neet-gen-{uuid.uuid4().hex[:8]}",
            system_message=(
                "You are a NEET exam question generator. Output ONLY valid JSON array. "
                "Each item: {\"question\": str, \"options\": [4 strings], \"correct\": 0-3 index, \"explanation\": str, \"chapter\": str}. "
                "Questions must be NEET-syllabus level, accurate, single best answer."
            ),
        ).with_model("anthropic", "claude-sonnet-4-6")

        prompt = (
            f"Generate {count} unique NEET MCQ questions for subject: {subject.upper()}. "
            "Return ONLY the JSON array, no markdown, no preamble."
        )
        resp = await chat.send_message(UserMessage(text=prompt))
        text = resp if isinstance(resp, str) else str(resp)
        m = re.search(r"\[.*\]", text, re.DOTALL)
        if not m:
            return []
        items = json.loads(m.group(0))
        docs = []
        for item in items:
            if not isinstance(item.get("options"), list) or len(item["options"]) != 4:
                continue
            docs.append({
                "question_id": f"q_{uuid.uuid4().hex[:12]}",
                "subject": subject,
                "chapter": item.get("chapter", "General"),
                "question": item["question"],
                "options": item["options"],
                "correct": int(item["correct"]),
                "explanation": item.get("explanation", ""),
                "is_pyq": False,
                "year": None,
                "source": "ai",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        if docs:
            await db.questions.insert_many(docs)
        return docs
    except Exception as e:
        logging.warning(f"AI generation failed: {e}")
        return []
