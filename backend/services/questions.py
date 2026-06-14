"""Question seeding, AI generation and AI cost-cap helpers."""
import json
import logging
import re
import uuid
import httpx
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
    today = date.today().isoformat()
    return await db.questions.count_documents({
        "source": "ai",
        "created_at": {"$gte": today},
    })


async def ai_daily_remaining() -> int:
    return max(0, AI_DAILY_CAP - await ai_generated_today())


async def ai_generate_questions(subject: str, count: int = 5) -> List[dict]:
    """Generate NEET MCQs using Claude API."""
    import os
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        logging.warning("ANTHROPIC_API_KEY not set")
        return []

    remaining = await ai_daily_remaining()
    if remaining <= 0:
        return []
    count = min(count, remaining)

    prompt = f"""Generate {count} high-quality NEET exam MCQs for {subject}.

Return ONLY a JSON array, no other text. Format:
[
  {{
    "chapter": "Chapter Name",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation"
  }}
]

Rules:
- correct is index 0-3
- All 4 options required
- NEET standard difficulty
- Based on NCERT syllabus
- Subject: {subject}"""

    try:
        async with httpx.AsyncClient(timeout=60) as http:
            resp = await http.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-6",
                    "max_tokens": 4000,
                    "messages": [{"role": "user", "content": prompt}],
                }
            )

        if resp.status_code != 200:
            logging.warning(f"Anthropic API error: {resp.status_code} {resp.text}")
            return []

        data = resp.json()
        text = data["content"][0]["text"].strip()

        # Extract JSON from response
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if not match:
            logging.warning("No JSON array found in AI response")
            return []

        items = json.loads(match.group())
        docs = []
        for item in items:
            if not isinstance(item.get("options"), list) or len(item["options"]) != 4:
                continue
            correct = int(item.get("correct", 0))
            if not (0 <= correct <= 3):
                continue
            docs.append({
                "question_id": f"q_{uuid.uuid4().hex[:12]}",
                "subject": subject,
                "chapter": item.get("chapter", "General"),
                "question": item["question"],
                "options": item["options"],
                "correct": correct,
                "explanation": item.get("explanation", ""),
                "is_pyq": False,
                "year": None,
                "source": "ai",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        if docs:
            await db.questions.insert_many(docs)
            logging.info(f"AI generated {len(docs)} questions for {subject}")
        return docs

    except Exception as e:
        logging.warning(f"AI generation failed: {e}")
        return []
