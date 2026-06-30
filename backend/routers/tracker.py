"""
backend/routers/tracker.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
King NEET AIR — Daily Study Tracker (Premium feature)

A customizable daily checklist (wake-up time, DPPs, NCERT reading,
backlog, etc.) with auto-scoring and a weekly view. Each user can
edit their own task list and target score.

Endpoints:
  GET    /tracker/tasks              → get user's task list (creates defaults on first use)
  PUT    /tracker/tasks              → replace the task list (add/remove/edit/reorder)
  GET    /tracker/today              → get today's checklist + completion state
  POST   /tracker/today/toggle       → toggle one task done/undone for today
  GET    /tracker/week               → last 7 days' scores (for the weekly tracker view)
  GET    /tracker/history?days=30    → longer history for review

Premium gate: every endpoint requires the user to be premium (top N on
leaderboard) OR an admin (so admins can always test it).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from database import db
from deps import require_user
from services.premium import get_top_user_ids

router = APIRouter(prefix="/tracker")

# ── Default task list — seeded the first time a user opens the tracker ──────
DEFAULT_TASKS = [
    {"id": "wake_up", "label": "Wake up before 5:45 AM"},
    {"id": "bio_revision", "label": "Morning Biology NCERT Revision (30 min)"},
    {"id": "class_1", "label": "Class 1 Attended"},
    {"id": "class_2", "label": "Class 2 Attended"},
    {"id": "class_3", "label": "Class 3 Attended"},
    {"id": "notes", "label": "Class Notes Completed"},
    {"id": "physics_dpp", "label": "Physics DPP Completed"},
    {"id": "chem_dpp", "label": "Chemistry DPP Completed"},
    {"id": "bio_dpp", "label": "Biology DPP Completed"},
    {"id": "physics_q", "label": "Physics Questions (50+)"},
    {"id": "chem_q", "label": "Chemistry Questions (50+)"},
    {"id": "bio_q", "label": "Biology Questions (100+)"},
    {"id": "ncert_reading", "label": "NCERT Biology Reading"},
    {"id": "formula_rev", "label": "Formula Revision"},
    {"id": "backlog", "label": "Backlog Cleared"},
    {"id": "error_notebook", "label": "Error Notebook Updated"},
    {"id": "website_work", "label": "Website Work (Max 1 hr)"},
    {"id": "no_social", "label": "No Social Media Wastage"},
    {"id": "sleep", "label": "Sleep Before 11 PM"},
]


# ── Models ────────────────────────────────────────────────────────────────────
class TaskItem(BaseModel):
    id: str
    label: str


class TaskListUpdate(BaseModel):
    tasks: List[TaskItem]


class ToggleTask(BaseModel):
    task_id: str
    date: Optional[str] = None  # defaults to today (UTC) if not given


# ── Helpers ───────────────────────────────────────────────────────────────────
async def _ensure_premium(request: Request):
    user = await require_user(request)
    if user.is_admin:
        return user
    top_ids = await get_top_user_ids()
    if user.user_id not in top_ids:
        raise HTTPException(status_code=403, detail="Daily Tracker is a Premium feature")
    return user


def _today_str():
    return datetime.now(timezone.utc).date().isoformat()


def _score_label(score, total):
    if total == 0:
        return "—"
    pct = score / total
    if pct >= (16 / 18):   # roughly matches the 16-18 "Excellent" band, scaled
        return "🔥 Excellent"
    if pct >= (13 / 18):
        return "✅ Good"
    if pct >= (10 / 18):
        return "⚠️ Average"
    return "❌ Improve"


async def _get_or_create_tasks(user_id: str):
    doc = await db.tracker_tasks.find_one({"user_id": user_id})
    if doc:
        return doc["tasks"]
    tasks = [dict(t) for t in DEFAULT_TASKS]
    await db.tracker_tasks.insert_one({"user_id": user_id, "tasks": tasks})
    return tasks


# ════════════════════════════════════════════════════════════════════════════
# TASK LIST (customization)
# ════════════════════════════════════════════════════════════════════════════
@router.get("/tasks")
async def get_tasks(request: Request):
    user = await _ensure_premium(request)
    tasks = await _get_or_create_tasks(user.user_id)
    return {"tasks": tasks}


@router.put("/tasks")
async def update_tasks(payload: TaskListUpdate, request: Request):
    user = await _ensure_premium(request)
    if len(payload.tasks) == 0:
        raise HTTPException(status_code=400, detail="Add at least one task")
    if len(payload.tasks) > 40:
        raise HTTPException(status_code=400, detail="Max 40 tasks allowed")

    tasks = [t.model_dump() for t in payload.tasks]
    await db.tracker_tasks.update_one(
        {"user_id": user.user_id},
        {"$set": {"tasks": tasks}},
        upsert=True,
    )
    return {"tasks": tasks}


# ════════════════════════════════════════════════════════════════════════════
# TODAY'S CHECKLIST
# ════════════════════════════════════════════════════════════════════════════
@router.get("/today")
async def get_today(request: Request):
    user = await _ensure_premium(request)
    today = _today_str()
    tasks = await _get_or_create_tasks(user.user_id)

    entry = await db.tracker_entries.find_one({"user_id": user.user_id, "date": today})
    completed_ids = set(entry.get("completed", [])) if entry else set()

    checklist = [{"id": t["id"], "label": t["label"], "done": t["id"] in completed_ids} for t in tasks]
    score = len(completed_ids)
    total = len(tasks)

    return {
        "date": today,
        "tasks": checklist,
        "score": score,
        "total": total,
        "label": _score_label(score, total),
    }


@router.post("/today/toggle")
async def toggle_task(payload: ToggleTask, request: Request):
    user = await _ensure_premium(request)
    target_date = payload.date or _today_str()

    entry = await db.tracker_entries.find_one({"user_id": user.user_id, "date": target_date})
    completed = set(entry.get("completed", [])) if entry else set()

    if payload.task_id in completed:
        completed.discard(payload.task_id)
    else:
        completed.add(payload.task_id)

    await db.tracker_entries.update_one(
        {"user_id": user.user_id, "date": target_date},
        {"$set": {"completed": list(completed), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )

    tasks = await _get_or_create_tasks(user.user_id)
    return {
        "date": target_date,
        "score": len(completed),
        "total": len(tasks),
        "label": _score_label(len(completed), len(tasks)),
        "completed": list(completed),
    }


# ════════════════════════════════════════════════════════════════════════════
# WEEKLY / HISTORY VIEW
# ════════════════════════════════════════════════════════════════════════════
@router.get("/week")
async def get_week(request: Request):
    """Last 7 days (including today), Monday-aligned-ish — simple rolling 7 days."""
    user = await _ensure_premium(request)
    tasks = await _get_or_create_tasks(user.user_id)
    total = len(tasks)

    today_date = datetime.now(timezone.utc).date()
    days = []
    for i in range(6, -1, -1):
        d = today_date - timedelta(days=i)
        d_str = d.isoformat()
        entry = await db.tracker_entries.find_one({"user_id": user.user_id, "date": d_str})
        score = len(entry.get("completed", [])) if entry else 0
        days.append({
            "date": d_str,
            "weekday": d.strftime("%A"),
            "score": score,
            "total": total,
            "label": _score_label(score, total),
            "is_today": d_str == today_date.isoformat(),
            "is_sunday": d.weekday() == 6,
        })
    return {"days": days}


@router.get("/history")
async def get_history(request: Request, days: int = 30):
    user = await _ensure_premium(request)
    tasks = await _get_or_create_tasks(user.user_id)
    total = len(tasks)
    days = max(1, min(90, days))

    today_date = datetime.now(timezone.utc).date()
    result = []
    for i in range(days - 1, -1, -1):
        d = today_date - timedelta(days=i)
        d_str = d.isoformat()
        entry = await db.tracker_entries.find_one({"user_id": user.user_id, "date": d_str})
        score = len(entry.get("completed", [])) if entry else 0
        result.append({"date": d_str, "score": score, "total": total})
    return {"history": result}
