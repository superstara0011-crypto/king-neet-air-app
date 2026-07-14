"""
backend/routers/notes.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student-facing read access to the Notes library.
All writes (create/edit/delete/upload) happen through the
existing admin-only routes in admin.py — this file only adds
a non-admin-gated GET, reading the same `db.notes` collection.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
from fastapi import APIRouter, Request
from typing import Optional

from database import db
from deps import require_user

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("")
async def list_notes(request: Request, subject: Optional[str] = None):
    await require_user(request)  # any logged-in student can browse
    q = {}
    if subject and subject != "all":
        q["subject"] = subject
    docs = await db.notes.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [{
        "id": d["note_id"],
        "subject": d["subject"],
        "chapter": d.get("chapter", ""),
        "title": d["title"],
        "content": d.get("content", ""),
        "type": d.get("type", "text"),
        "image_url": d.get("image_url", ""),
        "file_url": d.get("file_url", ""),
        "file_name": d.get("file_name", ""),
        "created_at": d.get("created_at"),
    } for d in docs]
