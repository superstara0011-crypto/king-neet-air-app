"""
backend/routers/otp_auth.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
King NEET AIR — Email OTP Login + Max 2 Session System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /auth/send-otp      → Resend se OTP bhejo
POST /auth/verify-otp    → OTP verify + token
GET  /auth/me            → Token se user info
POST /auth/logout        → Session logout

Why Resend instead of Gmail SMTP?
  Render free tier blocks outbound SMTP ports (465/587).
  Resend uses HTTPS API — works everywhere, no port blocking.

.env mein add karo:
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
  JWT_SECRET=king-neet-air-secret-2024
  MONGO_URL=mongodb+srv://...

Setup (5 min):
  1. resend.com → Sign up (free, 3000 emails/month)
  2. Dashboard → API Keys → Create API Key → copy
  3. Paste in Render env vars as RESEND_API_KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os, random, string, secrets, requests
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
import jwt

router = APIRouter(prefix="/auth", tags=["OTP Auth"])

# ── Config ────────────────────────────────────────────────────────────────────
RESEND_API_KEY     = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL  = os.getenv("RESEND_FROM_EMAIL", "King NEET AIR <onboarding@resend.dev>")
JWT_SECRET         = os.getenv("JWT_SECRET", "king-neet-air-secret-2024")
JWT_ALGO           = "HS256"
OTP_EXPIRE_MIN     = 10
MAX_SESSIONS       = 2   # 1 app + 1 browser

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_URI   = os.getenv("MONGO_URL", "mongodb://localhost:27017")
_client     = MongoClient(MONGO_URI)
db          = _client["neet_database"]
users_col   = db["users"]
otp_col     = db["otp_store"]
session_col = db["user_sessions"]

try:
    otp_col.create_index("created_at", expireAfterSeconds=OTP_EXPIRE_MIN * 60)
except Exception:
    pass

# ── Models ────────────────────────────────────────────────────────────────────
class SendOTPReq(BaseModel):
    email: EmailStr

class VerifyOTPReq(BaseModel):
    email: EmailStr
    otp: str
    device_type: str = "browser"  # "app" or "browser"

# ── Helpers ───────────────────────────────────────────────────────────────────
def gen_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def gen_session_id() -> str:
    return secrets.token_hex(32)

def create_jwt(user_id: str, email: str, session_id: str) -> str:
    payload = {
        "sub":        user_id,
        "email":      email,
        "session_id": session_id,
        "iat":        datetime.utcnow(),
        "exp":        datetime.utcnow() + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_token(authorization: str = None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing")
    return authorization.split(" ")[1]

# ── Email Sender (Resend HTTPS API — no SMTP ports, never blocked) ───────────
def send_otp_email(to_email: str, otp: str) -> bool:
    if not RESEND_API_KEY:
        print("[EMAIL ERROR] RESEND_API_KEY not set in environment")
        return False

    html = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0b14;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px;">
<table width="460" style="background:#0f1128;border-radius:20px;border:1px solid rgba(124,58,237,0.3);">
  <tr>
    <td style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:28px;
               text-align:center;border-radius:20px 20px 0 0;">
      <div style="font-size:36px;">👑</div>
      <div style="font-size:22px;font-weight:900;color:#fff;">KING NEET AIR</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.7);">India's #1 NEET Prep Community</div>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 32px;text-align:center;">
      <div style="font-size:15px;color:#9ca3af;margin-bottom:6px;">Tumhara Login OTP hai 👇</div>
      <div style="background:rgba(124,58,237,0.12);border:2px solid rgba(124,58,237,0.5);
                  border-radius:16px;padding:28px 20px;margin:16px auto;display:inline-block;">
        <div style="font-size:48px;font-weight:900;letter-spacing:16px;
                    color:#a78bfa;font-family:monospace;">{otp}</div>
      </div>
      <div style="font-size:13px;color:#9ca3af;margin-top:16px;">
        ⏰ Valid for <strong style="color:#f9fafb;">{OTP_EXPIRE_MIN} minutes</strong> only
      </div>
      <div style="font-size:12px;color:#6b7280;margin-top:6px;">
        🔒 Kisi ke saath share mat karo
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:0 32px 24px;">
      <div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);
                  border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:13px;color:#fbbf24;font-weight:700;">🎯 Login karo aur aaj ka XP earn karo!</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">Daily Login = +4 XP</div>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <div style="font-size:11px;color:#4b5563;line-height:1.7;">
        Agar tumne request nahi ki toh ignore karo.<br/>
        <strong style="color:#6b7280;">— King NEET AIR Team 👑</strong>
      </div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>"""

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "from":    RESEND_FROM_EMAIL,
                "to":      [to_email],
                "subject": f"👑 {otp} — King NEET AIR Login OTP",
                "html":    html,
            },
            timeout=15,
        )
        if resp.status_code in (200, 201):
            return True
        print(f"[EMAIL ERROR] Resend API {resp.status_code}: {resp.text}")
        return False
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False

# ════════════════════════════════════════════════════════════════════════════
# 1️⃣  POST /auth/send-otp
# ════════════════════════════════════════════════════════════════════════════
@router.post("/send-otp")
async def send_otp(req: SendOTPReq):
    email = req.email.lower().strip()

    # Rate limit: 1 OTP per 60 sec
    existing = otp_col.find_one({"email": email})
    if existing:
        elapsed = (datetime.utcnow() - existing["created_at"]).total_seconds()
        if elapsed < 60:
            wait = int(60 - elapsed)
            raise HTTPException(429, f"Thoda wait karo — {wait} second baad try karo")

    otp = gen_otp()
    otp_col.delete_many({"email": email})
    otp_col.insert_one({
        "email":      email,
        "otp":        otp,
        "attempts":   0,
        "created_at": datetime.utcnow(),
    })

    sent = send_otp_email(email, otp)
    if not sent:
        otp_col.delete_many({"email": email})
        raise HTTPException(500, "Email send nahi hua. GMAIL config check karo.")

    return {"success": True, "message": f"OTP sent to {email}"}

# ════════════════════════════════════════════════════════════════════════════
# 2️⃣  POST /auth/verify-otp
# ════════════════════════════════════════════════════════════════════════════
@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPReq):
    email       = req.email.lower().strip()
    otp         = req.otp.strip()
    device_type = req.device_type  # "app" or "browser"

    record = otp_col.find_one({"email": email})
    if not record:
        raise HTTPException(400, "OTP expired ya mila nahi. Naya OTP maango.")

    if record["attempts"] >= 5:
        otp_col.delete_many({"email": email})
        raise HTTPException(400, "Bahut zyada galat attempts. Naya OTP maango.")

    if record["otp"] != otp:
        otp_col.update_one({"email": email}, {"$inc": {"attempts": 1}})
        remaining = 4 - record["attempts"]
        raise HTTPException(400, f"Galat OTP. {remaining} chances bache hain.")

    # ✅ OTP sahi
    otp_col.delete_many({"email": email})

    # User find or create
    user = users_col.find_one({"email": email})
    if not user:
        new_user = {
            "_id":        ObjectId(),
            "email":      email,
            "name":       email.split("@")[0].replace(".", " ").title(),
            "username":   email.split("@")[0].lower(),
            "picture":    None,
            "auth_type":  "email_otp",
            "total_xp":   0,
            "level":      {"name": "Seed", "number": 1},
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        }
        users_col.insert_one(new_user)
        user = users_col.find_one({"email": email})
    else:
        users_col.update_one({"email": email}, {"$set": {"last_login": datetime.utcnow()}})

    user_id = str(user["_id"])

    # ── Session Management: max 2 (1 app + 1 browser) ────────────────────
    active = list(session_col.find({"user_id": user_id}).sort("created_at", 1))

    # Same device type already logged in → kick that session
    same_type = [s for s in active if s.get("device_type") == device_type]
    if same_type:
        session_col.delete_one({"_id": same_type[0]["_id"]})

    # Total still >= 2 → kick oldest
    active = list(session_col.find({"user_id": user_id}).sort("created_at", 1))
    if len(active) >= MAX_SESSIONS:
        session_col.delete_one({"_id": active[0]["_id"]})

    # Create new session
    session_id = gen_session_id()
    session_col.insert_one({
        "session_id":  session_id,
        "user_id":     user_id,
        "email":       email,
        "device_type": device_type,
        "created_at":  datetime.utcnow(),
        "last_active": datetime.utcnow(),
    })

    token = create_jwt(user_id, email, session_id)

    return {
        "success": True,
        "token": token,
        "user": {
            "id":       user_id,
            "email":    user["email"],
            "name":     user["name"],
            "username": user.get("username", ""),
            "picture":  user.get("picture"),
            "total_xp": user.get("total_xp", 0),
            "level":    user.get("level", {"name": "Seed", "number": 1}),
        }
    }

# ════════════════════════════════════════════════════════════════════════════
# 3️⃣  GET /auth/me
# ════════════════════════════════════════════════════════════════════════════
@router.get("/me")
async def get_me(authorization: str = Header(None)):
    token      = get_token(authorization)
    payload    = decode_jwt(token)
    session_id = payload.get("session_id")
    user_id    = payload.get("sub")

    # Session still valid?
    session = session_col.find_one({"session_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(401, "Session khatam. Dobara login karo.")

    session_col.update_one(
        {"session_id": session_id},
        {"$set": {"last_active": datetime.utcnow()}}
    )

    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(404, "User nahi mila")

    return {
        "id":       str(user["_id"]),
        "email":    user["email"],
        "name":     user["name"],
        "username": user.get("username", ""),
        "picture":  user.get("picture"),
        "total_xp": user.get("total_xp", 0),
        "level":    user.get("level", {"name": "Seed", "number": 1}),
    }

# ════════════════════════════════════════════════════════════════════════════
# 4️⃣  POST /auth/logout
# ════════════════════════════════════════════════════════════════════════════
@router.post("/logout")
async def logout(authorization: str = Header(None)):
    token      = get_token(authorization)
    payload    = decode_jwt(token)
    session_id = payload.get("session_id")
    session_col.delete_one({"session_id": session_id})
    return {"success": True, "message": "Logout successful 👋"}
