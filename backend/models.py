from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = ""
    username: Optional[str] = None
    total_xp: int = 0
    questions_answered: int = 0
    correct_answers: int = 0
    chapters_completed: List[str] = []
    daily_challenges_completed: List[str] = []
    is_admin: bool = False
    admin_role: Optional[str] = ""  # super_admin, content_admin, analytics_admin, test_admin
    streak: int = 0
    longest_streak: int = 0
    last_active_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UsernameUpdate(BaseModel):
    username: str


class QuestionIn(BaseModel):
    subject: Literal["biology", "physics", "chemistry"]
    chapter: str
    question: str
    options: List[str]
    correct: int
    explanation: str = ""
    is_pyq: bool = False
    year: Optional[int] = None
    image_url: Optional[str] = ""  # ✅ Image/Diagram support


class AIGenerateRequest(BaseModel):
    subject: Literal["biology", "physics", "chemistry"]
    count: int = 5


class QuestionOut(BaseModel):
    id: str
    subject: str
    chapter: str
    question: str
    options: List[str]
    is_pyq: bool = False
    year: Optional[int] = None
    image_url: Optional[str] = ""  # ✅ Image support


class AnswerSubmit(BaseModel):
    question_id: str
    selected_option: int


class QuizSubmit(BaseModel):
    mode: Literal["pyq", "daily_quiz", "mock_test", "chapter"]
    subject: Optional[str] = None
    answers: List[AnswerSubmit]


class QuizResult(BaseModel):
    correct: int
    total: int
    xp_earned: int
    new_total_xp: int
    level: dict
    streak: int
    details: List[dict]


class NoteIn(BaseModel):
    subject: Literal["biology", "physics", "chemistry"]
    chapter: str
    title: str
    content: str = ""
    type: str = "text"  # text, mindmap, diagram, formula, ncert
    image_url: Optional[str] = ""  # ✅ Image support for notes


class AdminUserIn(BaseModel):
    email: str
    role: str = "content_admin"
