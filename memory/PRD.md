# KING NEET AIR — PRD

## Original Problem Statement
Gamified NEET prep platform. Students log in with Google, practice NEET questions
(Biology/Physics/Chemistry), earn XP, climb levels and compete on leaderboards.
No coins/virtual currency — just learning and ranking. Dark green/black neon theme.

## User Choices
- Auth: **Emergent-managed Google Auth**
- Question Bank: **~200 curated NEET PYQs + AI (Claude Sonnet) top-up on demand**
- MVP Modes: **PYQ Practice · Daily Quiz · Mock Test**
- Ranking: **Total XP**
- Admin email: **supersara0011@gmail.com** (auto-granted admin on login)
- XP rules: **+4 correct / -1 wrong**, chapter bonus +10, daily bonus +10 (all modes)
- Premium: **Top-3 all-time leaderboard get a free gold "Premium" badge**

## Architecture
- **Backend**: FastAPI on :8001, MongoDB via MONGO_URL, all routes under /api.
  Emergent Auth + emergentintegrations Claude Sonnet 4.6 for AI question generation.
- **Frontend**: React (CRA+craco), React Router, Sonner, dark neon theme.
  Cookie-based session (HttpOnly, SameSite=None, Secure).

## XP Engine (current)
- Base per quiz: correct×4 + wrong×(−1), floored at 0 (a quiz never reduces total XP).
- Chapter bonus: +10 when every question of a chapter is correct (once per chapter).
- Daily bonus: +10 for any mode, once per day, if user passes ≥ half.
- Levels: Seed → Aspirant → Scholar → Warrior → Champion → KING NEET → AIR LEGEND.

## Implemented
- 2026-02: Auth, /questions, /quiz/submit, /leaderboard (4 periods), /profile/:username,
  /levels. Frontend: Landing, Dashboard, Play, ModeSelect, Quiz, Result, Leaderboard, Profile.
  35 seed questions + AI top-up.
- 2026-06 (this iteration):
  - NEW XP rules (+4/−1, +10 chapter, +10 daily for all modes, floor at 0).
  - Admin RBAC: ADMIN_EMAILS auto-grants is_admin; require_admin dependency.
  - Admin API: /api/admin/stats, /users, /questions (GET/POST/PUT/DELETE), /questions/ai-generate.
  - Admin UI (/admin): Overview stats, Questions CRUD (+ AI Generate modal), Users table.
  - ~200 curated PYQs (data/pyq_bank.py, idempotent seeding). DB ~199 questions.
  - Premium badge for top-3 all-time (leaderboard + profile + /auth/me is_premium).
  - Deterministic rank/premium ordering shared between leaderboard & profile (compute_rank).
  - Browser title → "King NEET AIR".
  - Tested: 43/43 backend pytest pass; all frontend admin/premium flows verified.

## Backlog (prioritized)
- P1: Chapter-wise practice mode (chapter dropdown per subject); persist quiz history page.
- P1: Daily streak tracking + streak XP bonus; per-question timer for mock tests.
- P2: Stripe-based paid premium tier (currently premium is a free top-3 perk).
- P2: Env-driven ADMIN_EMAILS; rate-limit/cost-cap on admin AI-generate.
- P2: Refactor server.py (754 lines) into routers/ + services/ before more features.
- P2: Bookmark/review-later; share-able profile cards; difficulty levels.

## Notes / Constraints
- Removing "Made with Emergent" watermark & custom domain = Emergent dashboard/billing action,
  not a code change.
- Preview URL: https://neet-xp-rank.preview.emergentagent.com (user has a separate deployed prod).
