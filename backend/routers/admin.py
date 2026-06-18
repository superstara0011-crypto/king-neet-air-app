import uuid
import os
import io
import pandas as pd
import cloudinary
import cloudinary.uploader
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime, timezone
from pydantic import BaseModel

from database import db
from models import User, QuestionIn, AIGenerateRequest
from deps import require_admin
from services.levels import get_level
from services.questions import ai_generate_questions, ai_daily_remaining, ai_generated_today

router = APIRouter(prefix="/admin")

# ── Cloudinary config (for note image/PDF uploads) ───────────────────────────
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
    secure=True,
)


# ─── MODELS ─────────────────────────────────────────────────────────
class NoteIn(BaseModel):
    subject: str
    chapter: str
    title: str
    content: str = ""
    type: str = "text"  # text, mindmap, diagram, formula, ncert
    image_url: str = ""
    file_url: str = ""   # PDF attachment URL
    file_name: str = ""  # original PDF filename (for display)

class AdminUserIn(BaseModel):
    email: str
    role: str = "content_admin"


# ─── STATS ──────────────────────────────────────────────────────────
@router.get("/stats")
async def admin_stats(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_questions = await db.questions.count_documents({})
    total_pyq = await db.questions.count_documents({"is_pyq": True})
    total_ai = await db.questions.count_documents({"source": "ai"})
    total_attempts = await db.quiz_attempts.count_documents({})
    total_notes = await db.notes.count_documents({})
    by_subject = {}
    for subj in ("biology", "physics", "chemistry"):
        by_subject[subj] = await db.questions.count_documents({"subject": subj})
    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "total_pyq": total_pyq,
        "total_ai": total_ai,
        "total_attempts": total_attempts,
        "total_notes": total_notes,
        "questions_by_subject": by_subject,
        "ai_generated_today": await ai_generated_today(),
        "ai_daily_remaining": await ai_daily_remaining(),
    }


# ─── USERS ──────────────────────────────────────────────────────────
@router.get("/users")
async def admin_list_users(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0}).sort("total_xp", -1).to_list(2000)
    out = []
    for u in users:
        qa = u.get("questions_answered", 0)
        acc = round((u.get("correct_answers", 0) / qa) * 100, 1) if qa > 0 else 0.0
        attempts = await db.quiz_attempts.count_documents({"user_id": u["user_id"]})
        out.append({
            "user_id": u["user_id"],
            "email": u.get("email"),
            "name": u.get("name"),
            "username": u.get("username"),
            "picture": u.get("picture", ""),
            "total_xp": u.get("total_xp", 0),
            "questions_answered": qa,
            "correct_answers": u.get("correct_answers", 0),
            "accuracy": acc,
            "attempts": attempts,
            "streak": u.get("streak", 0),
            "is_admin": u.get("is_admin", False),
            "admin_role": u.get("admin_role", ""),
            "level": get_level(u.get("total_xp", 0)),
            "created_at": u.get("created_at"),
        })
    return out


# ─── ADMIN USERS MANAGEMENT ─────────────────────────────────────────
@router.get("/admin-users")
async def list_admin_users(admin: User = Depends(require_admin)):
    admins = await db.users.find({"is_admin": True}, {"_id": 0}).to_list(100)
    return [{
        "user_id": a["user_id"],
        "email": a.get("email"),
        "name": a.get("name"),
        "picture": a.get("picture", ""),
        "admin_role": a.get("admin_role", "content_admin"),
    } for a in admins]


@router.post("/admin-users")
async def add_admin_user(payload: AdminUserIn, admin: User = Depends(require_admin)):
    # Only super admin can add admins
    if admin.email not in ["supersara0011@gmail.com"] and admin.admin_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can add admins")

    valid_roles = ["content_admin", "analytics_admin", "test_admin"]
    if payload.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Valid: {valid_roles}")

    user = await db.users.find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found. They must sign up first.")

    await db.users.update_one(
        {"email": payload.email.lower()},
        {"$set": {"is_admin": True, "admin_role": payload.role}}
    )
    return {"ok": True, "message": f"Admin access granted with role: {payload.role}"}


@router.delete("/admin-users/{user_id}")
async def remove_admin_user(user_id: str, admin: User = Depends(require_admin)):
    if admin.email not in ["supersara0011@gmail.com"] and admin.admin_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can remove admins")

    target = await db.users.find_one({"user_id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.get("admin_role") == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot remove Super Admin")

    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_admin": False, "admin_role": ""}}
    )
    return {"ok": True}


# ─── QUESTIONS ──────────────────────────────────────────────────────
@router.get("/questions")
async def admin_list_questions(subject: Optional[str] = None, admin: User = Depends(require_admin)):
    q = {}
    if subject and subject != "all":
        q["subject"] = subject
    docs = await db.questions.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [{
        "id": d["question_id"],
        "subject": d["subject"],
        "chapter": d["chapter"],
        "question": d["question"],
        "options": d["options"],
        "correct": d["correct"],
        "explanation": d.get("explanation", ""),
        "is_pyq": d.get("is_pyq", False),
        "year": d.get("year"),
        "source": d.get("source", "seed"),
        "image_url": d.get("image_url", ""),
    } for d in docs]


@router.post("/questions")
async def admin_create_question(payload: QuestionIn, admin: User = Depends(require_admin)):
    if len(payload.options) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 options required")
    if not (0 <= payload.correct <= 3):
        raise HTTPException(status_code=400, detail="correct must be index 0-3")
    doc = {
        "question_id": f"q_{uuid.uuid4().hex[:12]}",
        "subject": payload.subject,
        "chapter": payload.chapter,
        "question": payload.question,
        "options": payload.options,
        "correct": payload.correct,
        "explanation": payload.explanation,
        "is_pyq": payload.is_pyq,
        "year": payload.year,
        "image_url": getattr(payload, 'image_url', ''),
        "source": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.questions.insert_one(doc)
    return {"id": doc["question_id"]}


@router.put("/questions/{question_id}")
async def admin_update_question(question_id: str, payload: QuestionIn, admin: User = Depends(require_admin)):
    if len(payload.options) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 options required")
    if not (0 <= payload.correct <= 3):
        raise HTTPException(status_code=400, detail="correct must be index 0-3")
    res = await db.questions.update_one(
        {"question_id": question_id},
        {"$set": {
            "subject": payload.subject,
            "chapter": payload.chapter,
            "question": payload.question,
            "options": payload.options,
            "correct": payload.correct,
            "explanation": payload.explanation,
            "is_pyq": payload.is_pyq,
            "year": payload.year,
            "image_url": getattr(payload, 'image_url', ''),
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"ok": True}


@router.delete("/questions/{question_id}")
async def admin_delete_question(question_id: str, admin: User = Depends(require_admin)):
    res = await db.questions.delete_one({"question_id": question_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"ok": True}


@router.post("/questions/ai-generate")
async def admin_ai_generate(payload: AIGenerateRequest, admin: User = Depends(require_admin)):
    remaining = await ai_daily_remaining()
    if remaining <= 0:
        raise HTTPException(status_code=429, detail="Daily AI generation limit reached.")
    count = max(1, min(20, payload.count))
    docs = await ai_generate_questions(payload.subject, count=count)
    return {"generated": len(docs), "ai_daily_remaining": await ai_daily_remaining()}


# ─── NOTES ──────────────────────────────────────────────────────────
@router.get("/notes")
async def admin_list_notes(subject: Optional[str] = None, admin: User = Depends(require_admin)):
    q = {}
    if subject and subject != "all":
        q["subject"] = subject
    docs = await db.notes.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [{
        "id": d["note_id"],
        "subject": d["subject"],
        "chapter": d["chapter"],
        "title": d["title"],
        "content": d.get("content", ""),
        "type": d.get("type", "text"),
        "image_url": d.get("image_url", ""),
        "file_url": d.get("file_url", ""),
        "file_name": d.get("file_name", ""),
        "created_at": d.get("created_at"),
    } for d in docs]


@router.post("/notes")
async def admin_create_note(payload: NoteIn, admin: User = Depends(require_admin)):
    doc = {
        "note_id": f"note_{uuid.uuid4().hex[:12]}",
        "subject": payload.subject,
        "chapter": payload.chapter,
        "title": payload.title,
        "content": payload.content,
        "type": payload.type,
        "image_url": payload.image_url,
        "file_url": payload.file_url,
        "file_name": payload.file_name,
        "created_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.notes.insert_one(doc)
    return {"id": doc["note_id"]}


@router.put("/notes/{note_id}")
async def admin_update_note(note_id: str, payload: NoteIn, admin: User = Depends(require_admin)):
    res = await db.notes.update_one(
        {"note_id": note_id},
        {"$set": {
            "subject": payload.subject,
            "chapter": payload.chapter,
            "title": payload.title,
            "content": payload.content,
            "type": payload.type,
            "image_url": payload.image_url,
            "file_url": payload.file_url,
            "file_name": payload.file_name,
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"ok": True}


@router.delete("/notes/{note_id}")
async def admin_delete_note(note_id: str, admin: User = Depends(require_admin)):
    res = await db.notes.delete_one({"note_id": note_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"ok": True}


# ════════════════════════════════════════════════════════════════════════════
# NOTE FILE UPLOAD — Image or PDF (via Cloudinary)
# ════════════════════════════════════════════════════════════════════════════
@router.post("/notes/upload")
async def admin_upload_note_file(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    allowed_images = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    allowed_pdf = {"application/pdf"}

    if file.content_type not in allowed_images and file.content_type not in allowed_pdf:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, GIF, or PDF allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File must be under 10MB")

    is_pdf = file.content_type in allowed_pdf

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="king_neet_air/notes",
            resource_type="image" if not is_pdf else "image",  # Cloudinary treats PDF as "image" resource for delivery
            public_id=f"note_{uuid.uuid4().hex[:12]}",
            **({} if is_pdf else {
                "transformation": [{"quality": "auto"}],
            }),
        )
        url = result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    return {
        "url": url,
        "is_pdf": is_pdf,
        "file_name": file.filename,
    }


# ════════════════════════════════════════════════════════════════════════════
# BULK UPLOAD QUESTIONS — via CSV/Excel file
# ════════════════════════════════════════════════════════════════════════════
@router.post("/questions/bulk-upload")
async def admin_bulk_upload_questions(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    filename = (file.filename or "").lower()
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel (.xlsx/.xls) files allowed")

    contents = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    required_cols = {"subject", "chapter", "question", "option_a", "option_b", "option_c", "option_d", "correct_answer"}
    missing = required_cols - set(c.strip().lower() for c in df.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

    # Normalize column names (case-insensitive, strip spaces)
    df.columns = [c.strip().lower() for c in df.columns]

    inserted = 0
    skipped = []
    answer_map = {"a": 0, "b": 1, "c": 2, "d": 3}

    for idx, row in df.iterrows():
        try:
            subject = str(row.get("subject", "")).strip().lower()
            chapter = str(row.get("chapter", "")).strip()
            question_text = str(row.get("question", "")).strip()
            options = [
                str(row.get("option_a", "")).strip(),
                str(row.get("option_b", "")).strip(),
                str(row.get("option_c", "")).strip(),
                str(row.get("option_d", "")).strip(),
            ]
            correct_raw = str(row.get("correct_answer", "")).strip().lower()
            correct = answer_map.get(correct_raw)

            if not subject or not chapter or not question_text or correct is None or any(not o for o in options):
                skipped.append({"row": int(idx) + 2, "reason": "Missing required field or invalid correct_answer"})
                continue

            explanation = str(row.get("explanation", "")).strip()
            if explanation.lower() == "nan":
                explanation = ""

            is_pyq_raw = str(row.get("is_pyq", "")).strip().lower()
            is_pyq = is_pyq_raw in ("yes", "true", "1")

            year_raw = row.get("year")
            year = None
            if pd.notna(year_raw) and str(year_raw).strip() not in ("", "nan"):
                try:
                    year = int(float(year_raw))
                except Exception:
                    year = None

            image_url = str(row.get("image_url", "")).strip()
            if image_url.lower() == "nan":
                image_url = ""

            doc = {
                "question_id": f"q_{uuid.uuid4().hex[:12]}",
                "subject": subject,
                "chapter": chapter,
                "question": question_text,
                "options": options,
                "correct": correct,
                "explanation": explanation,
                "is_pyq": is_pyq,
                "year": year,
                "image_url": image_url,
                "source": "bulk_upload",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.questions.insert_one(doc)
            inserted += 1

        except Exception as e:
            skipped.append({"row": int(idx) + 2, "reason": str(e)})

    return {
        "inserted": inserted,
        "skipped_count": len(skipped),
        "skipped": skipped[:20],  # only show first 20 errors to avoid huge response
    }
