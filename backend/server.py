import os
import logging
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import client
from services.questions import ensure_seed_questions
from routers import auth, questions, quiz, leaderboard, profile, admin, live_quiz, dashboard, tracker

# ── Rate limiting — protects against spam/brute-force on all endpoints ──────
# Default: 100 requests/minute per IP across the whole API. Tighter limits
# can be added per-route later (e.g. login endpoints) if needed.
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(questions.router)
api_router.include_router(quiz.router)
api_router.include_router(leaderboard.router)
api_router.include_router(profile.router)
api_router.include_router(admin.router)
api_router.include_router(live_quiz.router)
api_router.include_router(dashboard.router)
api_router.include_router(tracker.router)


@api_router.get("/")
async def root():
    return {"message": "KING NEET AIR API"}


app.include_router(api_router)

# Fix: CORS_ORIGINS must be explicit (not *) when allow_credentials=True
cors_origins_raw = os.environ.get('CORS_ORIGINS', 'https://king-neet-air-app.vercel.app')
if cors_origins_raw.strip() == '*':
    cors_origins = [
        "https://king-neet-air-app.vercel.app",
        "http://localhost:3000",
    ]
else:
    cors_origins = [o.strip() for o in cors_origins_raw.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await ensure_seed_questions()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
