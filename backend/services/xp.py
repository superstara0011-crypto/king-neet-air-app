"""XP and scoring service — NEET style scoring"""
from datetime import date, datetime, timezone
from typing import List, Tuple


# ─── SCORING CONSTANTS ──────────────────────────────────────────────
XP_CORRECT_LIVE = 4   # Daily challenge / live quiz
XP_CORRECT_NORMAL = 2  # PYQ / chapter / mock test
XP_WRONG = -1          # Wrong answer (same as NEET)
XP_UNATTEMPTED = 0     # No negative for skipped
CHAPTER_BONUS = 10     # Complete a chapter
DAILY_BONUS = 10       # Complete daily challenge


def base_xp(correct: int, wrong: int, mode: str = "normal") -> int:
    """Calculate XP based on mode.
    - live/daily_quiz: +4 per correct, -1 per wrong
    - normal (pyq/chapter/mock): +2 per correct, -1 per wrong
    """
    per_correct = XP_CORRECT_LIVE if mode in ("daily_quiz", "live") else XP_CORRECT_NORMAL
    return max(0, (correct * per_correct) + (wrong * XP_WRONG))


def score_answers(answers, qmap: dict) -> Tuple[int, List[dict], dict]:
    """Score quiz answers. Returns (correct_count, details, chapter_correct_map)"""
    correct_count = 0
    details = []
    chapter_correct = {}

    for ans in answers:
        qid = ans.question_id
        sel = ans.selected_option
        doc = qmap.get(qid)
        if not doc:
            continue

        is_correct = sel == doc["correct"]
        if is_correct:
            correct_count += 1
            ch = doc.get("chapter", "")
            chapter_correct[ch] = chapter_correct.get(ch, 0) + 1

        details.append({
            "question_id": qid,
            "question": doc.get("question", ""),
            "selected": sel,
            "correct": doc["correct"],
            "is_correct": is_correct,
            "explanation": doc.get("explanation", ""),
            "options": doc.get("options", []),
            "image_url": doc.get("image_url", ""),
        })

    return correct_count, details, chapter_correct


def compute_chapter_bonus(qdocs: list, chapter_correct: dict, completed: list) -> Tuple[int, List[str]]:
    """Award bonus XP for newly completed chapters."""
    chapter_total = {}
    for doc in qdocs:
        ch = doc.get("chapter", "")
        chapter_total[ch] = chapter_total.get(ch, 0) + 1

    newly_completed = []
    bonus_xp = 0
    for ch, cnt in chapter_correct.items():
        total = chapter_total.get(ch, cnt)
        if ch and ch not in completed and cnt >= max(1, total * 0.7):
            newly_completed.append(ch)
            bonus_xp += CHAPTER_BONUS

    return bonus_xp, newly_completed


def compute_daily_bonus(correct: int, total: int, completed_dates: list, today: str) -> Tuple[int, bool]:
    """Award daily challenge bonus if not already completed today."""
    if today in completed_dates:
        return 0, False
    if correct >= max(1, total * 0.5):
        return DAILY_BONUS, True
    return 0, False


def compute_streak(last_active: str, current_streak: int, today: str) -> int:
    """Compute new streak value."""
    if not last_active:
        return 1
    try:
        last = datetime.fromisoformat(last_active).date() if "T" in last_active else date.fromisoformat(last_active)
        today_date = date.fromisoformat(today)
        diff = (today_date - last).days
        if diff == 0:
            return current_streak  # Same day
        elif diff == 1:
            return current_streak + 1  # Consecutive
        else:
            return 1  # Streak broken
    except Exception:
        return 1
