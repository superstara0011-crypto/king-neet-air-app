"""
KING NEET AIR backend regression tests.
Covers root, levels, questions, auth, username, quiz submit (XP/level/chapter/daily bonus),
profile, and leaderboard (all_time + period-based).
"""
import os
import subprocess
import uuid
import json
import pytest
import requests
from datetime import datetime, timezone


# ------ root / levels ------
class TestRootAndLevels:
    def test_root_welcome(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        assert "KING NEET" in r.json().get("message", "")

    def test_levels(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/levels")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 7
        names = [d["name"] for d in data]
        assert names == ["Seed", "Aspirant", "Scholar", "Warrior", "Champion", "KING NEET", "AIR LEGEND"]
        for d in data:
            assert {"min", "max", "name", "emoji"} <= set(d.keys())


# ------ questions ------
class TestQuestions:
    def test_pyq_no_leak(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/questions", params={"mode": "pyq", "limit": 5})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for q in items:
            assert q["is_pyq"] is True
            assert "correct" not in q
            assert "explanation" not in q
            assert isinstance(q["options"], list) and len(q["options"]) == 4

    def test_filter_by_subject(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/questions", params={"subject": "biology", "mode": "pyq", "limit": 5})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for q in items:
            assert q["subject"] == "biology"


# ------ leaderboard shape ------
class TestLeaderboardShape:
    @pytest.mark.parametrize("period", ["daily", "weekly", "monthly", "all_time"])
    def test_periods_return_list(self, api_client, base_url, period):
        r = api_client.get(f"{base_url}/api/leaderboard", params={"period": period})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ------ auth ------
class TestAuth:
    def test_me_unauthenticated(self, api_client, base_url):
        # use a bare session w/o auth header
        r = requests.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, base_url, seeded_user):
        r = requests.get(f"{base_url}/api/auth/me",
                         headers={"Authorization": f"Bearer {seeded_user['session_token']}"})
        assert r.status_code == 200
        data = r.json()
        assert data["user_id"] == seeded_user["user_id"]
        assert data["email"] == seeded_user["email"]
        assert "level" in data and data["level"]["name"] == "Seed"


# ------ username ------
class TestUsername:
    def test_invalid_chars(self, auth_client, base_url):
        r = auth_client.put(f"{base_url}/api/auth/username", json={"username": "ab!c"})
        assert r.status_code == 400

    def test_too_short(self, auth_client, base_url):
        r = auth_client.put(f"{base_url}/api/auth/username", json={"username": "ab"})
        assert r.status_code == 400

    def test_valid_set(self, auth_client, base_url):
        new_name = f"valid_{uuid.uuid4().hex[:6]}"
        r = auth_client.put(f"{base_url}/api/auth/username", json={"username": new_name})
        assert r.status_code == 200
        assert r.json()["username"] == new_name
        # Verify persisted via /auth/me
        me = auth_client.get(f"{base_url}/api/auth/me")
        assert me.status_code == 200
        assert me.json()["username"] == new_name

    def test_duplicate(self, auth_client, base_url, seed_user_factory):
        other = seed_user_factory()
        # try to take their username
        r = auth_client.put(f"{base_url}/api/auth/username", json={"username": other["username"]})
        assert r.status_code == 400


# ------ quiz submit ------
def _fetch_chapter_questions_full(chapter_subject_filter=None):
    """Use mongosh to pull questions with correct answers for deterministic submit."""
    cmd = ["mongosh", "--quiet", "--eval",
           "use('test_database'); printjson(db.questions.find({}, {_id:0}).toArray());"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    raw = r.stdout
    # mongosh outputs JS-y objects; parse with json.loads after small normalization
    # Easier: use --json output flag
    return raw


def _get_questions_full_via_mongo():
    cmd = ["mongosh", "--quiet", "--eval",
           "use('test_database'); print(JSON.stringify(db.questions.find({}, {_id:0}).toArray()));"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    out = r.stdout.strip()
    # Find the JSON array
    start = out.find("[")
    end = out.rfind("]")
    if start == -1 or end == -1:
        return []
    try:
        return json.loads(out[start:end + 1])
    except Exception:
        return []


class TestQuizSubmit:
    def test_xp_award_basic(self, auth_client, base_url):
        # Get a real question via API to know its id, but we need correct answer.
        # Fetch via mongo for correctness.
        all_q = _get_questions_full_via_mongo()
        assert all_q, "Seed questions missing"
        # Pick one biology pyq
        bio = [q for q in all_q if q["subject"] == "biology" and q.get("is_pyq")]
        assert bio
        q = bio[0]
        payload = {
            "mode": "pyq",
            "subject": "biology",
            "answers": [{"question_id": q["question_id"], "selected_option": q["correct"]}],
        }
        r = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["correct"] == 1
        assert data["total"] == 1
        # New rules: +4 base per correct; chapter bonus +10 if chapter complete in this batch;
        # daily bonus +10 first time of day (any mode, pass>=half). For 1/1 correct on first call: 4+10+10=24,
        # but chapter bonus only fires if no other Qs in that chapter were submitted; safest lower bound is 4.
        assert data["xp_earned"] >= 4
        assert data["new_total_xp"] == data["xp_earned"]
        assert data["level"]["name"] == "Seed"

    def test_wrong_answer_no_xp(self, auth_client, base_url):
        all_q = _get_questions_full_via_mongo()
        q = [x for x in all_q if x["subject"] == "physics"][0]
        wrong = (q["correct"] + 1) % 4
        payload = {
            "mode": "pyq",
            "subject": "physics",
            "answers": [{"question_id": q["question_id"], "selected_option": wrong}],
        }
        r = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["correct"] == 0
        assert data["xp_earned"] == 0

    def test_chapter_completion_bonus(self, auth_client, base_url):
        """If a chapter has multiple questions and all are answered correctly in one batch,
        +10 chapter completion bonus should fire (one-time)."""
        all_q = _get_questions_full_via_mongo()
        # group by chapter
        by_chap = {}
        for q in all_q:
            by_chap.setdefault(q["chapter"], []).append(q)
        # pick a chapter with at least 2 questions
        multi = [(c, qs) for c, qs in by_chap.items() if len(qs) >= 2]
        if not multi:
            pytest.skip("No chapter with >=2 questions in seed")
        chapter, qs = multi[0]
        answers = [{"question_id": q["question_id"], "selected_option": q["correct"]} for q in qs]
        payload = {"mode": "pyq", "subject": qs[0]["subject"], "answers": answers}
        r = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        # base xp = 4 * len(qs); chapter bonus = 10; daily bonus +10 likely (first pass of day)
        expected_min = 4 * len(qs) + 10
        assert data["xp_earned"] >= expected_min, f"Expected >= {expected_min}, got {data['xp_earned']}"

    def test_daily_quiz_bonus_once(self, auth_client, base_url):
        all_q = _get_questions_full_via_mongo()
        # Pick 2 chemistry questions so >=half can be correct
        chem = [q for q in all_q if q["subject"] == "chemistry"][:2]
        if len(chem) < 2:
            pytest.skip("Need 2 chemistry seed questions")
        answers = [{"question_id": q["question_id"], "selected_option": q["correct"]} for q in chem]
        payload = {"mode": "daily_quiz", "subject": "chemistry", "answers": answers}
        r1 = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r1.status_code == 200
        d1 = r1.json()
        # base 4*2 + 10 daily (+ chapter bonus if both same chapter)
        assert d1["xp_earned"] >= 8 + 10, f"Expected >=18, got {d1['xp_earned']}"

        # Second submit same day: NO daily bonus
        r2 = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r2.status_code == 200
        d2 = r2.json()
        # second attempt: no daily bonus, no chapter bonus (already completed) -> base 4*2 = 8
        assert d2["xp_earned"] == 8, f"Daily bonus should not re-fire same day, got {d2['xp_earned']}"


# ------ profile ------
class TestProfile:
    def test_profile_found(self, api_client, base_url, seeded_user):
        r = api_client.get(f"{base_url}/api/profile/{seeded_user['username']}")
        assert r.status_code == 200
        data = r.json()
        assert data["username"] == seeded_user["username"]
        assert data["total_xp"] == 0
        assert "rank" in data
        assert data["level"]["name"] == "Seed"
        # email should NOT leak
        assert "email" not in data

    def test_profile_not_found(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/profile/nope_{uuid.uuid4().hex[:6]}")
        assert r.status_code == 404


# ------ period leaderboard with attempt ------
class TestLeaderboardWithAttempt:
    def test_daily_period_includes_user_after_submit(self, auth_client, base_url):
        all_q = _get_questions_full_via_mongo()
        q = all_q[0]
        payload = {
            "mode": "pyq",
            "subject": q["subject"],
            "answers": [{"question_id": q["question_id"], "selected_option": q["correct"]}],
        }
        r = auth_client.post(f"{base_url}/api/quiz/submit", json=payload)
        assert r.status_code == 200
        uid = auth_client.seeded_user["user_id"]
        lb = requests.get(f"{base_url}/api/leaderboard", params={"period": "daily", "limit": 100})
        assert lb.status_code == 200
        rows = lb.json()
        found = [r for r in rows if r["user_id"] == uid]
        assert found, "Seeded user not found in daily leaderboard after submitting"
        assert found[0]["xp"] >= 4
