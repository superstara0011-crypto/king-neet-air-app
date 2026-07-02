"""
Daily Study Tracker router — King NEET AIR
No premium restriction: any logged-in user can use this.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from typing import List, Optional

# Adjust this import to match your actual deps.py
from deps import get_current_user
from database import db

router = APIRouter()

DEFAULT_TASKS = [
    {"id": "study_2hr", "label": "Studied at least 2 hours"},
    {"id": "revise", "label": "Revised previous day's topics"},
    {"id": "pyq", "label": "Solved PYQs / practice questions"},
    {"id": "mistake_notebook", "label": "Updated Mistake Notebook"},
    {"id": "sleep_7hr", "label": "Slept 7+ hours"},
]

def label_for_score(score: int, total: int) -> str:
    if total == 0:
        return "—"
    pct = score / total
    if pct >= 0.9:
        return "🔥 Excellent"
    if pct >= 0.7:
        return "✅ Good"
    if pct >= 0.4:
        return "⚠️ Average"
    return "❌ Improve"

def today_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ─── Schemas ──────────────────────────────────────────────
class TaskItem(BaseModel):
    id: str
    label: str

class TasksUpdate(BaseModel):
    tasks: List[TaskItem]

class ToggleRequest(BaseModel):
    task_id: str


# ─── Helpers ──────────────────────────────────────────────
async def get_user_tasks(db, user_id: str):
    doc = await db.tracker_tasks.find_one({"user_id": user_id})
    if doc and doc.get("tasks"):
        return doc["tasks"]
    return DEFAULT_TASKS


# ─── Routes ───────────────────────────────────────────────

@router.get("/tasks")
async def list_tasks(user=Depends(get_current_user)):
    tasks = await get_user_tasks(db, str(user["_id"]))
    return {"tasks": tasks}


@router.put("/tasks")
async def update_tasks(body: TasksUpdate, user=Depends(get_current_user)):
    if len(body.tasks) == 0:
        raise HTTPException(status_code=400, detail="Add at least one task")

    tasks = [t.dict() for t in body.tasks]
    await db.tracker_tasks.update_one(
        {"user_id": str(user["_id"])},
        {"$set": {"tasks": tasks}},
        upsert=True,
    )
    return {"ok": True, "tasks": tasks}


@router.get("/today")
async def get_today(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    date = today_str()
    tasks = await get_user_tasks(db, user_id)

    entry = await db.tracker_daily.find_one({"user_id": user_id, "date": date})
    done_ids = set(entry["done_ids"]) if entry else set()

    result_tasks = [{**t, "done": t["id"] in done_ids} for t in tasks]
    score = len(done_ids)
    total = len(tasks)

    return {
        "date": date,
        "tasks": result_tasks,
        "score": score,
        "total": total,
        "label": label_for_score(score, total),
    }


@router.post("/today/toggle")
async def toggle_task(body: ToggleRequest, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    date = today_str()
    tasks = await get_user_tasks(db, user_id)
    valid_ids = {t["id"] for t in tasks}

    if body.task_id not in valid_ids:
        raise HTTPException(status_code=400, detail="Unknown task")

    entry = await db.tracker_daily.find_one({"user_id": user_id, "date": date})
    done_ids = set(entry["done_ids"]) if entry else set()

    if body.task_id in done_ids:
        done_ids.remove(body.task_id)
    else:
        done_ids.add(body.task_id)

    await db.tracker_daily.update_one(
        {"user_id": user_id, "date": date},
        {"$set": {"done_ids": list(done_ids)}},
        upsert=True,
    )

    score = len(done_ids)
    total = len(tasks)
    return {"score": score, "total": total, "label": label_for_score(score, total)}


@router.get("/week")
async def get_week(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    tasks = await get_user_tasks(db, user_id)
    total = len(tasks)

    today = datetime.now(timezone.utc).date()
    # Monday of current week
    start = today - timedelta(days=today.weekday())

    days = []
    for i in range(7):
        d = start + timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        entry = await db.tracker_daily.find_one({"user_id": user_id, "date": date_str})
        score = len(entry["done_ids"]) if entry else 0
        days.append({
            "date": date_str,
            "weekday": d.strftime("%a"),
            "is_today": date_str == today_str(),
            "is_sunday": d.weekday() == 6,
            "score": score,
            "total": total,
            "label": label_for_score(score, total),
        })

    return {"days": days}
