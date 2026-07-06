"""
Daily Study Tracker router — King NEET AIR
No premium restriction: any logged-in user can use this.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from database import db
from deps import require_user

router = APIRouter(prefix="/tracker", tags=["tracker"])

DEFAULT_TASKS = [
    {"id": "study_2hr", "label": "Studied at least 2 hours", "category": "study", "start_time": "06:00", "duration_minutes": 120},
    {"id": "revise", "label": "Revised previous day's topics", "category": "revision", "start_time": "18:00", "duration_minutes": 45},
    {"id": "pyq", "label": "Solved PYQs / practice questions", "category": "practice", "start_time": "19:00", "duration_minutes": 60},
    {"id": "mistake_notebook", "label": "Updated Mistake Notebook", "category": "revision", "start_time": "20:30", "duration_minutes": 30},
    {"id": "sleep_7hr", "label": "Slept 7+ hours", "category": "other", "start_time": None, "duration_minutes": None},
]

VALID_CATEGORIES = {"study", "practice", "revision", "test", "other"}

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
    category: Optional[str] = "study"
    start_time: Optional[str] = None      # "HH:MM" 24-hour, local wall-clock time
    duration_minutes: Optional[int] = None

class TasksUpdate(BaseModel):
    tasks: List[TaskItem]

class ToggleRequest(BaseModel):
    task_id: str


# ─── Helpers ──────────────────────────────────────────────
async def get_user_tasks(user_id: str):
    doc = await db.tracker_tasks.find_one({"user_id": user_id})
    if doc and doc.get("tasks"):
        tasks = doc["tasks"]
        for t in tasks:
            if t.get("category") not in VALID_CATEGORIES:
                t["category"] = "study"
            t.setdefault("start_time", None)
            t.setdefault("duration_minutes", None)
        return tasks
    return DEFAULT_TASKS


def sort_by_time(tasks):
    # Timed tasks first, in chronological order; untimed tasks after, unchanged order
    timed = [t for t in tasks if t.get("start_time")]
    untimed = [t for t in tasks if not t.get("start_time")]
    timed.sort(key=lambda t: t["start_time"])
    return timed + untimed


# ─── Routes ───────────────────────────────────────────────

@router.get("/tasks")
async def list_tasks(request: Request):
    user = await require_user(request)
    tasks = await get_user_tasks(user.user_id)
    return {"tasks": tasks}


@router.put("/tasks")
async def update_tasks(body: TasksUpdate, request: Request):
    user = await require_user(request)
    if len(body.tasks) == 0:
        raise HTTPException(status_code=400, detail="Add at least one task")

    tasks = [t.dict() for t in body.tasks]
    await db.tracker_tasks.update_one(
        {"user_id": user.user_id},
        {"$set": {"tasks": tasks}},
        upsert=True,
    )
    return {"ok": True, "tasks": tasks}


@router.get("/today")
async def get_today(request: Request):
    user = await require_user(request)
    user_id = user.user_id
    date = today_str()
    tasks = await get_user_tasks(user_id)

    entry = await db.tracker_daily.find_one({"user_id": user_id, "date": date})
    done_ids = set(entry["done_ids"]) if entry else set()

    result_tasks = sort_by_time([{**t, "done": t["id"] in done_ids} for t in tasks])
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
async def toggle_task(body: ToggleRequest, request: Request):
    user = await require_user(request)
    user_id = user.user_id
    date = today_str()
    tasks = await get_user_tasks(user_id)
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
async def get_week(request: Request):
    user = await require_user(request)
    user_id = user.user_id
    tasks = await get_user_tasks(user_id)
    total = len(tasks)

    today = datetime.now(timezone.utc).date()
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
            "is_today": d == today,
            "is_past": d < today,
            "is_future": d > today,
            "is_sunday": d.weekday() == 6,
            "score": score,
            "total": total,
            "label": label_for_score(score, total),
        })

    return {"days": days}


@router.get("/calendar")
async def get_calendar(request: Request, year: int, month: int):
    """Month view for the Progress tab — daily completion + streaks."""
    import calendar as cal

    user = await require_user(request)
    user_id = user.user_id
    tasks = await get_user_tasks(user_id)
    total = len(tasks)

    _, days_in_month = cal.monthrange(year, month)
    today = datetime.now(timezone.utc).date()

    entries = await db.tracker_daily.find({"user_id": user_id}).to_list(3000)
    score_by_date = {e["date"]: len(e.get("done_ids", [])) for e in entries}

    days = []
    for d in range(1, days_in_month + 1):
        date_obj = datetime(year, month, d).date()
        date_str = date_obj.strftime("%Y-%m-%d")
        score = score_by_date.get(date_str, 0)
        days.append({
            "date": date_str,
            "day": d,
            "score": score,
            "total": total,
            "is_today": date_obj == today,
            "is_future": date_obj > today,
            "is_past": date_obj < today,
            "weekday": date_obj.weekday(),  # Monday=0 ... Sunday=6
        })

    # ── Streaks: scan all recorded days chronologically ──
    all_dates = sorted(score_by_date.keys())
    best_streak = 0
    if all_dates and total > 0:
        run = 0
        d = datetime.strptime(all_dates[0], "%Y-%m-%d").date()
        while d <= today:
            ds = d.strftime("%Y-%m-%d")
            s = score_by_date.get(ds, 0)
            if s == total:
                run += 1
                best_streak = max(best_streak, run)
            else:
                run = 0
            d += timedelta(days=1)

    current_streak = 0
    if total > 0:
        d = today
        while True:
            ds = d.strftime("%Y-%m-%d")
            s = score_by_date.get(ds, 0)
            if s == total:
                current_streak += 1
                d -= timedelta(days=1)
            else:
                break

    # ── Month-to-date completion ──
    mtd_days = [x for x in days if not x["is_future"]]
    month_total = sum(x["total"] for x in mtd_days)
    month_score = sum(x["score"] for x in mtd_days)

    return {
        "year": year,
        "month": month,
        "days": days,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "month_completed": month_score,
        "month_total": month_total,
    }
