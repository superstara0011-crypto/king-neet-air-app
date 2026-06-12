# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  username: 'testuser' + Date.now(),
  picture: 'https://via.placeholder.com/150',
  total_xp: 0,
  questions_answered: 0,
  correct_answers: 0,
  chapters_completed: [],
  daily_challenges_completed: [],
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
curl -X GET "$BASE/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$BASE/api/questions?mode=pyq&limit=3"
curl -X GET "$BASE/api/leaderboard?period=all_time"
```

## Step 3: Browser Testing
Set cookie `session_token` with `httpOnly=true, secure=true, sameSite=None` for app domain, then navigate.

## Checklist
- [x] users.user_id is custom UUID
- [x] user_sessions.user_id matches user.user_id
- [x] All queries use {"_id": 0} projection
- [x] /api/auth/me returns user with level info
- [x] Cookie session works as well as Authorization header
