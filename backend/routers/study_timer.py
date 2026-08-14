"""
backend/routers/study_timer.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject Study Timer — King NEET AIR
Stopwatch-style per-subject time tracking (Physics/Chemistry/
Biology), separate from the checkbox-based Task Tracker.
Only one session can be "running" per user at a time — starting
a new subject auto-pauses whichever was running.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import uuid
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from database import db
from deps import require_user

router = APIRouter(prefix="/study", tags=["study_timer"])

VALID_SUBJECTS = {"physics", "chemistry", "biology", "other"}


class StartRequest(BaseModel):
    subject: str


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def _stop_active_session(user_id: str):
    """Internal: close out whatever session is currently running, if any."""
    active = await db.study_sessions.find_one({"user_id": user_id, "end_time": None})
    if active:
        end = datetime.now(timezone.utc)
        start = datetime.fromisoformat(active["start_time"])
        duration = int((end - start).total_seconds())
        await db.study_sessions.update_one(
            {"session_id": active["session_id"]},
            {"$set": {"end_time": end.isoformat(), "duration_seconds": duration}},
        )
    return active


@router.post("/start")
async def start_session(payload: StartRequest, request: Request):
    user = await require_user(request)
    subject = payload.subject.lower()
    if subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=400, detail="Unknown subject")

    await _stop_active_session(user.user_id)  # auto-pause whatever was running

    session = {
        "session_id": f"s_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "subject": subject,
        "start_time": now_iso(),
        "end_time": None,
        "duration_seconds": 0,
        "date": datetime.now(timezone.utc).date().isoformat(),
    }
    await db.study_sessions.insert_one(session)
    return {"session_id": session["session_id"], "subject": subject, "start_time": session["start_time"]}


@router.post("/pause")
async def pause_session(request: Request):
    user = await require_user(request)
    closed = await _stop_active_session(user.user_id)
    if not closed:
        raise HTTPException(status_code=400, detail="No active session to pause")
    return {"ok": True}


@router.get("/today")
async def today_totals(request: Request):
    user = await require_user(request)
    today = datetime.now(timezone.utc).date().isoformat()
    sessions = await db.study_sessions.find({"user_id": user.user_id, "date": today}, {"_id": 0}).to_list(500)

    totals = {"physics": 0, "chemistry": 0, "biology": 0, "other": 0}
    active_subject = None
    active_elapsed = 0

    for s in sessions:
        if s["end_time"] is None:
            active_subject = s["subject"]
            start = datetime.fromisoformat(s["start_time"])
            active_elapsed = int((datetime.now(timezone.utc) - start).total_seconds())
            totals[s["subject"]] = totals.get(s["subject"], 0) + active_elapsed
        else:
            totals[s["subject"]] = totals.get(s["subject"], 0) + s["duration_seconds"]

    return {
        "totals": totals,
        "total_seconds": sum(totals.values()),
        "active_subject": active_subject,
    }


@router.get("/stats")
async def get_stats(request: Request, date: str = None):
    """Detailed stats for a given day (defaults to today): total time, max focus
    session, start/end time, and an hourly timeline for the grid chart."""
    user = await require_user(request)
    target_date = date or datetime.now(timezone.utc).date().isoformat()
    sessions = await db.study_sessions.find(
        {"user_id": user.user_id, "date": target_date, "end_time": {"$ne": None}}, {"_id": 0}
    ).sort("start_time", 1).to_list(500)

    if not sessions:
        return {"date": target_date, "total_seconds": 0, "max_focus_seconds": 0,
                "start_time": None, "end_time": None, "by_subject": {}, "sessions": []}

    total = sum(s["duration_seconds"] for s in sessions)
    max_focus = max(s["duration_seconds"] for s in sessions)
    by_subject = {}
    for s in sessions:
        by_subject[s["subject"]] = by_subject.get(s["subject"], 0) + s["duration_seconds"]

    return {
        "date": target_date,
        "total_seconds": total,
        "max_focus_seconds": max_focus,
        "start_time": sessions[0]["start_time"],
        "end_time": sessions[-1]["end_time"],
        "by_subject": by_subject,
        "sessions": [{
            "subject": s["subject"],
            "start_time": s["start_time"],
            "end_time": s["end_time"],
            "duration_seconds": s["duration_seconds"],
        } for s in sessions],
    }


@router.get("/calendar")
async def calendar_heatmap(request: Request, year: int, month: int):
    """Per-day total study time for the given month — powers a heatmap."""
    user = await require_user(request)
    prefix = f"{year:04d}-{month:02d}"
    sessions = await db.study_sessions.find(
        {"user_id": user.user_id, "date": {"$regex": f"^{prefix}"}, "end_time": {"$ne": None}},
        {"_id": 0, "date": 1, "duration_seconds": 1},
    ).to_list(3000)

    by_day = {}
    for s in sessions:
        by_day[s["date"]] = by_day.get(s["date"], 0) + s["duration_seconds"]

    return {"year": year, "month": month, "days": [{"date": d, "seconds": sec} for d, sec in by_day.items()]}
