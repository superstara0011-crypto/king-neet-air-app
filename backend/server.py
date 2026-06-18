import os
import logging
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

from database import client
from services.questions import ensure_seed_questions
from routers import auth, questions, quiz, leaderboard, profile, admin, live_quiz

app = FastAPI()
api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(questions.router)
api_router.include_router(quiz.router)
api_router.include_router(leaderboard.router)
api_router.include_router(profile.router)
api_router.include_router(admin.router)
api_router.include_router(live_quiz.router)


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
