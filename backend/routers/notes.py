"""
backend/routers/notes.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Study Notes Library — King NEET AIR
PW-style: admins upload notes (PDF/images via Cloudinary),
students browse and download.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import uuid
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional

from database import db
from deps import require_user

router = APIRouter(prefix="/notes", tags=["notes"])


class NoteCreate(BaseModel):
    title: str
    subject: str            # biology | physics | chemistry
    chapter: Optional[str] = ""
    note_type: str = "notes"  # notes | formula_sheet | revision
    file_url: str            # Cloudinary URL, uploaded by the frontend before calling this
    file_type: str = "pdf"    # pdf | image


@router.get("")
async def list_notes(request: Request, subject: str = None, note_type: str = None):
    await require_user(request)  # any logged-in user can browse
    q = {}
    if subject and subject != "all":
        q["subject"] = subject
    if note_type and note_type != "all":
        q["note_type"] = note_type
    rows = await db.study_notes.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"notes": rows}


@router.post("")
async def upload_note(payload: NoteCreate, request: Request):
    user = await require_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    doc = {
        "note_id": f"n_{uuid.uuid4().hex[:12]}",
        "title": payload.title,
        "subject": payload.subject,
        "chapter": payload.chapter,
        "note_type": payload.note_type,
        "file_url": payload.file_url,
        "file_type": payload.file_type,
        "uploaded_by": user.user_id,
        "download_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.study_notes.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.delete("/{note_id}")
async def delete_note(note_id: str, request: Request):
    user = await require_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    res = await db.study_notes.delete_one({"note_id": note_id})
    return {"ok": res.deleted_count > 0}


@router.post("/{note_id}/download")
async def track_download(note_id: str, request: Request):
    """Called right before the browser opens the file — just increments a counter."""
    await require_user(request)
    await db.study_notes.update_one({"note_id": note_id}, {"$inc": {"download_count": 1}})
    return {"ok": True}
