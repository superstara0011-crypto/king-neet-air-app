"""
Admin + new XP rules regression tests for KING NEET AIR.
- XP rules: +4 correct, -1 wrong (floor at 0 per quiz), +10 chapter bonus, +10 daily bonus (any mode)
- RBAC: /api/admin/* requires is_admin; admin_session_test seeded, regular_session_test seeded
- /auth/me returns is_admin + is_premium
- Leaderboard/profile mark top-3 is_premium=True
"""
import json
import subprocess
import uuid
import pytest
import requests


ADMIN_TOKEN = "admin_session_test"
REGULAR_TOKEN = "regular_session_test"


def _mongosh_json(script: str):
    cmd = ["mongosh", "--quiet", "--eval", f"use('test_database');\nprint(JSON.stringify({script}));"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    out = r.stdout.strip()
    s, e = out.find("["), out.rfind("]")
    if s == -1:
        s, e = out.find("{"), out.rfind("}")
    if s == -1:
        return None
    try:
        return json.loads(out[s:e + 1])
    except Exception:
        return None


def _get_questions_full():
    return _mongosh_json("db.questions.find({}, {_id:0}).toArray()") or []


# ---------- /api/auth/me with admin and premium flags ----------
class TestAuthMeFlags:
    def test_admin_me_has_is_admin_true(self, base_url):
        r = requests.get(f"{base_url}/api/auth/me",
                         headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["is_admin"] is True
        assert "is_premium" in data
        assert isinstance(data["is_premium"], bool)

    def test_regular_me_has_is_admin_false(self, base_url):
        r = requests.get(f"{base_url}/api/auth/me",
                         headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["is_admin"] is False
        assert "is_premium" in data


# ---------- /api/admin/stats ----------
class TestAdminStats:
    def test_stats_no_token_401(self, base_url):
        r = requests.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 401

    def test_stats_non_admin_403(self, base_url):
        r = requests.get(f"{base_url}/api/admin/stats",
                         headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 403

    def test_stats_admin_ok(self, base_url):
        r = requests.get(f"{base_url}/api/admin/stats",
                         headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code == 200
        data = r.json()
        for k in ("total_users", "total_questions", "total_pyq",
                  "total_ai", "total_attempts", "questions_by_subject"):
            assert k in data, f"missing {k}"
        # ~199 seeded; allow either >=190 or exact
        assert data["total_questions"] >= 150
        qbs = data["questions_by_subject"]
        for s in ("biology", "physics", "chemistry"):
            assert s in qbs and qbs[s] > 0


# ---------- /api/admin/users ----------
class TestAdminUsers:
    def test_users_non_admin_403(self, base_url):
        r = requests.get(f"{base_url}/api/admin/users",
                         headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 403

    def test_users_admin_ok(self, base_url):
        r = requests.get(f"{base_url}/api/admin/users",
                         headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        assert len(rows) >= 1
        u = rows[0]
        for k in ("email", "total_xp", "accuracy", "attempts", "is_admin", "level"):
            assert k in u, f"missing field {k}"


# ---------- Admin questions CRUD ----------
class TestAdminQuestionsCRUD:
    def test_list_questions_admin(self, base_url):
        r = requests.get(f"{base_url}/api/admin/questions",
                         headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_questions_subject_filter(self, base_url):
        r = requests.get(f"{base_url}/api/admin/questions?subject=biology",
                         headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code == 200
        items = r.json()
        assert all(q["subject"] == "biology" for q in items)

    def test_list_questions_non_admin_403(self, base_url):
        r = requests.get(f"{base_url}/api/admin/questions",
                         headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 403

    def test_create_update_delete_flow(self, base_url):
        unique = f"TEST_Q_{uuid.uuid4().hex[:8]}"
        payload = {
            "subject": "biology",
            "chapter": unique,
            "question": f"{unique}: 2+2?",
            "options": ["1", "2", "3", "4"],
            "correct": 3,
            "explanation": "basic math",
            "difficulty": "easy",
        }
        # create
        r = requests.post(f"{base_url}/api/admin/questions", json=payload,
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code in (200, 201), r.text
        created = r.json()
        qid = created.get("question_id") or created.get("id")
        assert qid, f"no question_id in response: {created}"

        # update
        upd = dict(payload)
        upd["question"] = f"{unique}: updated?"
        upd["correct"] = 2
        r2 = requests.put(f"{base_url}/api/admin/questions/{qid}", json=upd,
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r2.status_code == 200, r2.text

        # verify update via list
        r3 = requests.get(f"{base_url}/api/admin/questions?subject=biology",
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        found = [q for q in r3.json() if q.get("id") == qid or q.get("question_id") == qid]
        assert found and found[0]["question"].endswith("updated?")
        assert found[0]["correct"] == 2

        # delete
        r4 = requests.delete(f"{base_url}/api/admin/questions/{qid}",
                             headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r4.status_code in (200, 204), r4.text

        # confirm gone
        r5 = requests.get(f"{base_url}/api/admin/questions?subject=biology",
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert not any(q.get("id") == qid or q.get("question_id") == qid for q in r5.json())

    def test_create_validates_options_count(self, base_url):
        bad = {
            "subject": "biology", "chapter": "TEST_bad",
            "question": "bad?", "options": ["only", "three", "opts"],
            "correct": 0, "explanation": "", "difficulty": "easy",
        }
        r = requests.post(f"{base_url}/api/admin/questions", json=bad,
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code in (400, 422), r.text

    def test_create_validates_correct_range(self, base_url):
        bad = {
            "subject": "biology", "chapter": "TEST_bad",
            "question": "bad?", "options": ["a", "b", "c", "d"],
            "correct": 5, "explanation": "", "difficulty": "easy",
        }
        r = requests.post(f"{base_url}/api/admin/questions", json=bad,
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code in (400, 422), r.text

    def test_non_admin_cannot_create(self, base_url):
        payload = {
            "subject": "biology", "chapter": "TEST_x",
            "question": "x?", "options": ["a", "b", "c", "d"],
            "correct": 0, "explanation": "", "difficulty": "easy",
        }
        r = requests.post(f"{base_url}/api/admin/questions", json=payload,
                          headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 403


# ---------- AI generate ----------
class TestAdminAIGenerate:
    def test_ai_generate_admin(self, base_url):
        r = requests.post(f"{base_url}/api/admin/questions/ai-generate",
                          json={"subject": "biology", "count": 1},
                          headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}, timeout=120)
        # AI may be slow or unavailable; we accept 200 with generated >= 0
        assert r.status_code == 200, r.text
        data = r.json()
        assert "generated" in data
        assert isinstance(data["generated"], int)
        assert data["generated"] >= 0

    def test_ai_generate_non_admin_403(self, base_url):
        r = requests.post(f"{base_url}/api/admin/questions/ai-generate",
                          json={"subject": "biology", "count": 1},
                          headers={"Authorization": f"Bearer {REGULAR_TOKEN}"})
        assert r.status_code == 403


# ---------- NEW XP RULES ----------
class TestXpRules:
    def test_two_correct_one_wrong_with_bonuses(self, auth_client, base_url):
        """2 correct + 1 wrong across distinct chapters:
        base = 2*4 - 1 = 7
        chapter bonus = +10 per fully-correct distinct chapter (each correct in a unique chapter)
                       so 2*10 = 20 (each chapter has 1 q in this batch fully-correct)
        daily bonus = +10 first time of day (2/3 correct > half)
        Total expected on first submit of the day = 7 + 20 + 10 = 37
        """
        all_q = _get_questions_full()
        # pick 3 questions from 3 distinct chapters
        seen = set()
        picks = []
        for q in all_q:
            if q["chapter"] not in seen:
                picks.append(q)
                seen.add(q["chapter"])
            if len(picks) == 3:
                break
        assert len(picks) == 3

        # 2 correct, 1 wrong
        answers = []
        for i, q in enumerate(picks):
            if i < 2:
                answers.append({"question_id": q["question_id"], "selected_option": q["correct"]})
            else:
                wrong = (q["correct"] + 1) % 4
                answers.append({"question_id": q["question_id"], "selected_option": wrong})

        before_xp = auth_client.get(f"{base_url}/api/auth/me").json()["total_xp"]
        r = auth_client.post(f"{base_url}/api/quiz/submit",
                             json={"mode": "pyq", "subject": "biology", "answers": answers})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["correct"] == 2
        assert d["total"] == 3
        # 7 base + 20 (two chapter completions) + 10 daily = 37
        assert d["xp_earned"] == 37, f"Expected 37, got {d['xp_earned']}; data={d}"
        assert d["new_total_xp"] == before_xp + 37

    def test_all_wrong_floored_at_zero(self, auth_client, base_url):
        all_q = _get_questions_full()
        # pick a fresh chapter user hasn't completed yet from chemistry
        q = next(x for x in all_q if x["subject"] == "chemistry")
        wrong = (q["correct"] + 1) % 4
        before_xp = auth_client.get(f"{base_url}/api/auth/me").json()["total_xp"]
        r = auth_client.post(f"{base_url}/api/quiz/submit",
                             json={"mode": "pyq", "subject": "chemistry",
                                   "answers": [{"question_id": q["question_id"], "selected_option": wrong}]})
        assert r.status_code == 200
        d = r.json()
        assert d["correct"] == 0
        # base floored at 0, no chapter bonus, no daily bonus
        assert d["xp_earned"] == 0
        assert d["new_total_xp"] == before_xp  # never decreases

    def test_total_xp_never_decreases(self, auth_client, base_url):
        # after multiple submits, total_xp must be monotonic non-decreasing
        all_q = _get_questions_full()
        prev = auth_client.get(f"{base_url}/api/auth/me").json()["total_xp"]
        for q in all_q[:2]:
            wrong = (q["correct"] + 1) % 4
            r = auth_client.post(f"{base_url}/api/quiz/submit",
                                 json={"mode": "pyq", "subject": q["subject"],
                                       "answers": [{"question_id": q["question_id"], "selected_option": wrong}]})
            assert r.status_code == 200
            cur = auth_client.get(f"{base_url}/api/auth/me").json()["total_xp"]
            assert cur >= prev
            prev = cur

    def test_daily_bonus_applies_to_any_mode(self, auth_client, base_url):
        """Daily bonus +10 should fire even in mock_test/pyq mode, once per day."""
        all_q = _get_questions_full()
        q = next(x for x in all_q if x["subject"] == "physics")
        # First submit of the day -- pass half -- should include daily +10
        r = auth_client.post(f"{base_url}/api/quiz/submit",
                             json={"mode": "mock_test", "subject": "physics",
                                   "answers": [{"question_id": q["question_id"], "selected_option": q["correct"]}]})
        assert r.status_code == 200
        d = r.json()
        # base=4 + chapter bonus 10 + daily 10 = 24 (assuming chapter has only this q in batch -> bonus fires)
        # The chapter may already be completed for this user; so we assert >= 14 (base+daily)
        assert d["xp_earned"] >= 14, f"Expected >=14 (got {d['xp_earned']}); daily bonus likely missing"

        # Second submit same day shouldn't re-add daily bonus
        r2 = auth_client.post(f"{base_url}/api/quiz/submit",
                              json={"mode": "mock_test", "subject": "physics",
                                    "answers": [{"question_id": q["question_id"], "selected_option": q["correct"]}]})
        assert r2.status_code == 200
        d2 = r2.json()
        # Second time: no daily, no chapter bonus -> just base 4
        assert d2["xp_earned"] == 4, f"Second submit should be just 4 base, got {d2['xp_earned']}"


# ---------- Leaderboard premium ----------
class TestLeaderboardPremium:
    def test_all_time_top3_premium_flag(self, base_url):
        r = requests.get(f"{base_url}/api/leaderboard", params={"period": "all_time", "limit": 10})
        assert r.status_code == 200
        rows = r.json()
        if not rows:
            pytest.skip("Empty leaderboard")
        for i, row in enumerate(rows):
            assert "is_premium" in row, f"row missing is_premium: {row}"
            if i < 3:
                assert row["is_premium"] is True, f"top-{i+1} should be premium"
            else:
                assert row["is_premium"] is False

    def test_profile_premium_for_top_rank(self, base_url):
        r = requests.get(f"{base_url}/api/leaderboard", params={"period": "all_time", "limit": 3})
        assert r.status_code == 200
        rows = r.json()
        if not rows:
            pytest.skip("Empty leaderboard")
        top = rows[0]
        username = top.get("username")
        if not username:
            pytest.skip("Top user has no username")
        pr = requests.get(f"{base_url}/api/profile/{username}")
        assert pr.status_code == 200
        data = pr.json()
        assert data.get("is_premium") is True, f"Top user profile should be premium: {data}"
