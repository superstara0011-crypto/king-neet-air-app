"""
backend/routers/dashboard.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
King NEET AIR — Dashboard Analytics

Provides everything the redesigned Dashboard needs in as few
calls as possible, all computed from REAL quiz_attempts data
(no fake numbers):

  GET /dashboard/stats
      → subject_progress   (Biology/Physics/Chemistry % accuracy)
      → weak_chapters      (lowest-accuracy chapters, min attempts)
      → strong_chapters    (highest-accuracy chapters)
      → today_mission      (today's questions done / goal)
      → week_heatmap       (last 7 days: solved? + intensity)
      → mistake_counts     (per-subject unresolved mistake counts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from fastapi import APIRouter, Request
from datetime import datetime, timezone, timedelta, date

from database import db
from deps import require_user

router = APIRouter()

DAILY_GOAL_QUESTIONS = 20  # used for "Today's Mission" progress bar


@router.get("/dashboard/stats")
async def dashboard_stats(request: Request):
    user = await require_user(request)
    user_id = user.user_id

    # Pull all attempts once — cheap enough at this stage, can be optimized later
    attempts = await db.quiz_attempts.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(5000)

    # ── 1) Subject Progress (accuracy per subject, from chapter_breakdown) ──
    subject_totals = {"biology": {"correct": 0, "total": 0}, "physics": {"correct": 0, "total": 0}, "chemistry": {"correct": 0, "total": 0}}
    chapter_totals = {}  # chapter -> {subject, correct, total}

    for a in attempts:
        breakdown = a.get("chapter_breakdown") or {}
        for chapter, stats in breakdown.items():
            subj = stats.get("subject", "")
            correct = stats.get("correct", 0)
            total = stats.get("total", 0)
            if subj in subject_totals:
                subject_totals[subj]["correct"] += correct
                subject_totals[subj]["total"] += total
            if chapter not in chapter_totals:
                chapter_totals[chapter] = {"subject": subj, "correct": 0, "total": 0}
            chapter_totals[chapter]["correct"] += correct
            chapter_totals[chapter]["total"] += total

    subject_progress = {}
    for subj, vals in subject_totals.items():
        pct = round((vals["correct"] / vals["total"]) * 100) if vals["total"] > 0 else 0
        subject_progress[subj] = {"accuracy": pct, "attempted": vals["total"]}

    overall_correct = sum(v["correct"] for v in subject_totals.values())
    overall_total = sum(v["total"] for v in subject_totals.values())
    overall_accuracy = round((overall_correct / overall_total) * 100) if overall_total > 0 else 0

    # ── 2) Weak / Strong Chapters (need at least 4 attempts to be meaningful) ──
    MIN_ATTEMPTS_FOR_RANKING = 4
    chapter_list = []
    for ch, vals in chapter_totals.items():
        if vals["total"] >= MIN_ATTEMPTS_FOR_RANKING:
            pct = round((vals["correct"] / vals["total"]) * 100)
            chapter_list.append({"chapter": ch, "subject": vals["subject"], "accuracy": pct, "attempted": vals["total"]})

    weak_chapters = sorted(chapter_list, key=lambda x: x["accuracy"])[:5]
    strong_chapters = sorted(chapter_list, key=lambda x: -x["accuracy"])[:5]

    # ── 3) Today's Mission (questions answered today vs goal) ──
    today_str = datetime.now(timezone.utc).date().isoformat()
    today_answered = sum(a.get("total", 0) for a in attempts if (a.get("created_at") or "")[:10] == today_str)
    today_pct = min(100, round((today_answered / DAILY_GOAL_QUESTIONS) * 100)) if DAILY_GOAL_QUESTIONS > 0 else 0

    # ── 4) Week Heatmap (last 7 days, Mon-Sun aligned to "today") ──
    week_heatmap = []
    today_date = datetime.now(timezone.utc).date()
    # Build a quick lookup: date string -> total questions that day
    daily_counts = {}
    for a in attempts:
        d = (a.get("created_at") or "")[:10]
        if d:
            daily_counts[d] = daily_counts.get(d, 0) + a.get("total", 0)

    for i in range(6, -1, -1):
        day = today_date - timedelta(days=i)
        day_str = day.isoformat()
        count = daily_counts.get(day_str, 0)
        if count == 0:
            level = "none"
        elif count < 10:
            level = "partial"
        else:
            level = "completed"
        week_heatmap.append({
            "date": day_str,
            "label": day.strftime("%a")[0],  # M, T, W...
            "count": count,
            "level": level,
            "is_today": day_str == today_str,
        })

    # ── 5) Mistake counts (for the Mistake Notebook preview card) ──
    mistake_counts = {"biology": 0, "physics": 0, "chemistry": 0}
    unresolved = await db.mistakes.find(
        {"user_id": user_id, "resolved": False}, {"_id": 0, "subject": 1}
    ).to_list(2000)
    for m in unresolved:
        s = m.get("subject", "")
        if s in mistake_counts:
            mistake_counts[s] += 1

    return {
        "subject_progress": subject_progress,
        "overall_accuracy": overall_accuracy,
        "weak_chapters": weak_chapters,
        "strong_chapters": strong_chapters,
        "today_mission": {
            "answered": today_answered,
            "goal": DAILY_GOAL_QUESTIONS,
            "percent": today_pct,
            "completed": today_answered >= DAILY_GOAL_QUESTIONS,
        },
        "week_heatmap": week_heatmap,
        "mistake_counts": mistake_counts,
        "total_mistakes": sum(mistake_counts.values()),
    }
