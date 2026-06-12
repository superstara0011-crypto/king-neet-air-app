import os
import time
import uuid
import subprocess
import pytest
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://neet-xp-rank.preview.emergentagent.com").rstrip("/")
DB_NAME = os.environ.get("DB_NAME", "test_database")


def _mongosh(script: str) -> str:
    """Run a mongosh JS snippet inside use('test_database') and return stdout."""
    cmd = ["mongosh", "--quiet", "--eval", f"use('{DB_NAME}');\n{script}"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        raise RuntimeError(f"mongosh failed: {r.stderr}")
    return r.stdout.strip()


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _seed_user(prefix="TEST", total_xp=0):
    user_id = f"{prefix}-{uuid.uuid4().hex[:10]}"
    session_token = f"{prefix}-tok-{uuid.uuid4().hex[:16]}"
    uname = f"test_{uuid.uuid4().hex[:8]}"
    email = f"{uname}@example.com"
    name = f"Test {uname}"
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    created_at = datetime.now(timezone.utc).isoformat()
    js = f"""
db.users.insertOne({{
  user_id: "{user_id}",
  email: "{email}",
  name: "{name}",
  username: "{uname}",
  picture: "",
  total_xp: {total_xp},
  questions_answered: 0,
  correct_answers: 0,
  chapters_completed: [],
  daily_challenges_completed: [],
  created_at: "{created_at}"
}});
db.user_sessions.insertOne({{
  user_id: "{user_id}",
  session_token: "{session_token}",
  expires_at: "{expires_at}",
  created_at: "{created_at}"
}});
print("OK");
"""
    _mongosh(js)
    return {"user_id": user_id, "session_token": session_token, "username": uname, "email": email, "name": name}


@pytest.fixture
def seeded_user():
    info = _seed_user()
    yield info
    # cleanup
    try:
        _mongosh(f"db.users.deleteOne({{user_id:'{info['user_id']}'}}); db.user_sessions.deleteOne({{session_token:'{info['session_token']}'}}); db.quiz_attempts.deleteMany({{user_id:'{info['user_id']}'}});")
    except Exception:
        pass


@pytest.fixture
def auth_client(api_client, seeded_user):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {seeded_user['session_token']}"})
    s.seeded_user = seeded_user  # attach for tests
    return s


@pytest.fixture
def seed_user_factory():
    created = []

    def _make(total_xp=0):
        info = _seed_user(total_xp=total_xp)
        created.append(info)
        return info

    yield _make
    for info in created:
        try:
            _mongosh(f"db.users.deleteOne({{user_id:'{info['user_id']}'}}); db.user_sessions.deleteOne({{session_token:'{info['session_token']}'}}); db.quiz_attempts.deleteMany({{user_id:'{info['user_id']}'}});")
        except Exception:
            pass
