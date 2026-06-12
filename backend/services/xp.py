"""Pure XP scoring helpers (no DB access)."""
from datetime import date, timedelta

from config import (
    XP_PER_CORRECT, XP_PER_WRONG, CHAPTER_BONUS, DAILY_BONUS,
)


def score_answers(answers: list, qmap: dict):
    """Return (correct_count, details, chapter_correct dict)."""
    correct_count = 0
    details: list = []
    chapter_correct: dict = {}
    for ans in answers:
        qd = qmap.get(ans.question_id)
        if not qd:
            continue
        is_correct = int(ans.selected_option) == int(qd["correct"])
        if is_correct:
            correct_count += 1
            chapter_correct[qd["chapter"]] = chapter_correct.get(qd["chapter"], 0) + 1
        details.append({
            "question_id": ans.question_id,
            "question": qd["question"],
            "options": qd["options"],
            "correct": qd["correct"],
            "selected": ans.selected_option,
            "is_correct": is_correct,
            "explanation": qd.get("explanation", ""),
        })
    return correct_count, details, chapter_correct


def base_xp(correct_count: int, wrong_count: int) -> int:
    """+4 per correct, -1 per wrong, never below 0 for a single quiz."""
    return max(0, correct_count * XP_PER_CORRECT + wrong_count * XP_PER_WRONG)


def compute_chapter_bonus(qdocs: list, chapter_correct: dict, already_completed: list):
    """Return (xp_bonus, newly_completed_chapters)."""
    chapter_total: dict = {}
    for qd in qdocs:
        chapter_total[qd["chapter"]] = chapter_total.get(qd["chapter"], 0) + 1
    newly_completed: list = []
    for ch, total in chapter_total.items():
        if chapter_correct.get(ch, 0) == total and ch not in already_completed:
            newly_completed.append(ch)
    return len(newly_completed) * CHAPTER_BONUS, newly_completed


def compute_daily_bonus(correct_count: int, total_answers: int,
                        already_done_dates: list, today: str):
    """Daily bonus applies to ANY mode: pass at least half, once per day."""
    if correct_count < max(1, total_answers // 2):
        return 0, False
    if today in already_done_dates:
        return 0, False
    return DAILY_BONUS, True


def compute_streak(last_active_date: str, current_streak: int, today: str) -> int:
    """Update streak count based on last active date (display-only, no XP)."""
    if last_active_date == today:
        return current_streak or 1
    yesterday = (date.fromisoformat(today) - timedelta(days=1)).isoformat()
    if last_active_date == yesterday:
        return (current_streak or 0) + 1
    return 1
