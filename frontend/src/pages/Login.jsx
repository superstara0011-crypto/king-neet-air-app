/**
 * frontend/src/pages/Login.jsx
 * ─────────────────────────────────────────────────────────
 * King NEET AIR — PW-style Email OTP Login
 *
 * Flow:
 *  Step 1 → Email daalo
 *  Step 2 → 6-digit OTP aaya Gmail pe, enter karo
 *  Step 3 → Logged in! Dashboard pe redirect
 * ─────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// ── inline styles ────────────────────────────────────────────────────────────
const S = `
@keyframes kna-fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes kna-float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes kna-spin { to { transform:rotate(360deg); } }
@keyframes kna-shake {
  0%,100% { transform:translateX(0); }
  20%,60% { transform:translateX(-8px); }
  40%,80% { transform:translateX(8px); }
}
@keyframes kna-pulse {
  0%   { box-shadow:0 0 0 0 rgba(124,58,237,.5); }
  70%  { box-shadow:0 0 0 12px rgba(124,58,237,0); }
  100% { box-shadow:0 0 0 0 rgba(124,58,237,0); }
}
@keyframes kna-timer {
  from { width:100%; }
  to   { width:0%; }
}

.kna-root {
  min-height:100vh;
  background:#0a0b14;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  position:relative;
  overflow:hidden;
  font-family:Inter,Arial,sans-serif;
}
.kna-orb1 {
  position:absolute;width:400px;height:400px;border-radius:50%;
  background:radial-gradient(circle,#7C3AED 0%,transparent 70%);
  top:-120px;left:-80px;opacity:.25;filter:blur(60px);
  animation:kna-float 10s ease-in-out infinite;
}
.kna-orb2 {
  position:absolute;width:320px;height:320px;border-radius:50%;
  background:radial-gradient(circle,#4F46E5 0%,transparent 70%);
  bottom:-80px;right:-60px;opacity:.2;filter:blur(60px);
  animation:kna-float 13s ease-in-out infinite reverse;
}
.kna-card {
  position:relative;width:100%;max-width:420px;
  background:rgba(15,17,40,.9);
  border:1px solid rgba(124,58,237,.25);
  border-radius:24px;padding:36px 28px;
  box-shadow:0 32px 64px rgba(0,0,0,.5);
  animation:kna-fadeUp .5s ease both;
}
.kna-logo {
  text-align:center;margin-bottom:28px;
}
.kna-badge {
  display:inline-flex;align-items:center;justify-content:center;
  width:68px;height:68px;border-radius:18px;font-size:30px;
  background:linear-gradient(135deg,#7C3AED,#4F46E5);
  margin-bottom:12px;
  animation:kna-float 3s ease-in-out infinite, kna-pulse 2.5s ease infinite;
  box-shadow:0 8px 24px rgba(124,58,237,.4);
}
.kna-title { font-size:20px;font-weight:900;color:#f9fafb; }
.kna-sub   { font-size:12px;color:#6b7280;margin-top:3px; }

/* step heading */
.kna-step-title { font-size:18px;font-weight:800;color:#f9fafb;margin-bottom:4px; }
.kna-step-sub   { font-size:13px;color:#9ca3af;margin-bottom:24px;line-height:1.5; }

/* input */
.kna-label { font-size:12px;font-weight:700;color:#9ca3af;margin-bottom:6px;display:block; }
.kna-input {
  width:100%;padding:14px 16px;border-radius:12px;
  background:rgba(255,255,255,.05);
  border:1.5px solid rgba(255,255,255,.1);
  color:#f9fafb;font-size:15px;outline:none;
  transition:border .2s;box-sizing:border-box;
}
.kna-input:focus { border-color:#7C3AED; }
.kna-input::placeholder { color:#4b5563; }

/* OTP boxes */
.kna-otp-row {
  display:flex;gap:8px;justify-content:center;margin-bottom:20px;
}
.kna-otp-box {
  width:48px;height:56px;border-radius:12px;text-align:center;
  font-size:22px;font-weight:900;color:#a78bfa;
  background:rgba(255,255,255,.05);
  border:1.5px solid rgba(124,58,237,.3);
  outline:none;transition:all .2s;caret-color:#7C3AED;
}
.kna-otp-box:focus {
  border-color:#7C3AED;
  background:rgba(124,58,237,.12);
  box-shadow:0 0 0 3px rgba(124,58,237,.2);
}
.kna-otp-box.filled { border-color:#7C3AED;background:rgba(124,58,237,.1); }
.kna-otp-box.error  { border-color:#ef4444!important;animation:kna-shake .4s ease; }

/* button */
.kna-btn {
  width:100%;padding:15px;border-radius:13px;border:none;
  background:linear-gradient(135deg,#7C3AED,#4F46E5);
  color:#fff;font-size:15px;font-weight:800;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  transition:transform .2s,opacity .2s;margin-top:4px;
}
.kna-btn:hover:not(:disabled) { transform:translateY(-2px);opacity:.95; }
.kna-btn:disabled { opacity:.6;cursor:not-allowed; }

/* spinner */
.kna-spin {
  width:18px;height:18px;border-radius:50%;
  border:2.5px solid rgba(255,255,255,.2);
  border-top-color:#fff;
  animation:kna-spin .7s linear infinite;flex-shrink:0;
}

/* back btn */
.kna-back {
  display:flex;align-items:center;gap:6px;
  background:none;border:none;color:#9ca3af;
  font-size:13px;cursor:pointer;margin-bottom:20px;
  padding:0;font-weight:600;transition:color .2s;
}
.kna-back:hover { color:#f9fafb; }

/* timer bar */
.kna-timer-wrap {
  height:3px;background:rgba(255,255,255,.08);border-radius:2px;
  margin-bottom:20px;overflow:hidden;
}
.kna-timer-bar {
  height:100%;background:linear-gradient(90deg,#7C3AED,#4F46E5);
  border-radius:2px;
  animation:kna-timer 600s linear forwards;
}

/* resend */
.kna-resend {
  text-align:center;margin-top:14px;font-size:13px;color:#6b7280;
}
.kna-resend button {
  background:none;border:none;color:#818cf8;
  font-weight:700;cursor:pointer;font-size:13px;
  text-decoration:underline;padding:0;
}
.kna-resend button:disabled { opacity:.5;cursor:not-allowed;text-decoration:none; }

/* error msg */
.kna-error {
  background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
  border-radius:10px;padding:10px 14px;
  font-size:13px;color:#f87171;margin-top:12px;
  display:flex;align-items:center;gap:8px;
}

/* success msg */
.kna-success {
  background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);
  border-radius:10px;padding:10px 14px;
  font-size:13px;color:#4ade80;margin-top:12px;
  display:flex;align-items:center;gap:8px;
}

/* email chip (step 2) */
.kna-email-chip {
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 12px;border-radius:100px;
  background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);
  font-size:13px;color:#a78bfa;font-weight:600;margin-bottom:20px;
}

/* divider */
.kna-divider {
  display:flex;align-items:center;gap:10px;margin:20px 0;
}
.kna-divider-line { flex:1;height:1px;background:rgba(255,255,255,.07); }
.kna-divider-text { font-size:11px;color:#4b5563;font-weight:600; }

/* security row */
.kna-secure { display:flex;gap:6px;flex-wrap:wrap;margin-top:20px; }
.kna-sec-pill {
  padding:5px 10px;border-radius:100px;font-size:11px;font-weight:600;
  background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);
  color:#818cf8;
}
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [step, setStep]       = useState(1); // 1=email, 2=otp
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [resendWait, setResendWait] = useState(0); // countdown seconds
  const [hasError, setHasError]     = useState(false);

  const otpRefs = useRef([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  // Inject CSS once
  useEffect(() => {
    const id = "kna-login-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = S;
    document.head.appendChild(el);
    return () => document.getElementById(id)?.remove();
  }, []);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  async function handleSendOTP(e) {
    e?.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email daalo bhai 📧");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/send-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OTP send fail");
      setSuccess(`OTP sent! ${email} check karo 📬`);
      setResendWait(60);
      setTimeout(() => {
        setSuccess("");
        setStep(2);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── OTP box key handler ─────────────────────────────────────────────────
  function handleOtpChange(idx, val) {
    if (!/^\d*$/.test(val)) return; // only digits
    const newOtp = [...otp];
    newOtp[idx]  = val.slice(-1);
    setOtp(newOtp);
    setError(""); setHasError(false);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-submit when all 6 filled
    if (newOtp.every(d => d) && newOtp.join("").length === 6) {
      handleVerifyOTP(newOtp.join(""));
    }
  }

  function handleOtpKeyDown(idx, e) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      setTimeout(() => handleVerifyOTP(pasted), 100);
    }
    e.preventDefault();
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  async function handleVerifyOTP(otpStr) {
    setError(""); setSuccess(""); setLoading(true);
    const code = otpStr || otp.join("");
    if (code.length < 6) {
      setError("6-digit OTP daalo"); setLoading(false); return;
    }

    // Detect device type
    const isMobile    = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const device_type = isMobile ? "app" : "browser";

    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp: code, device_type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OTP galat hai");

      // Save token
      localStorage.setItem("session_token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      setSuccess("Login successful! Dashboard pe ja raha hoon 🚀");

      // Refresh auth context so Protected routes see the logged-in user immediately
      await refresh();

      setTimeout(() => nav("/dashboard"), 600);
    } catch (err) {
      setError(err.message);
      setHasError(true);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => { setHasError(false); otpRefs.current[0]?.focus(); }, 600);
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendWait > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError(""); setSuccess("");
    await handleSendOTP();
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="kna-root">
      <style>{S}</style>
      <div className="kna-orb1" />
      <div className="kna-orb2" />

      <div className="kna-card">

        {/* Logo */}
        <div className="kna-logo">
          <div className="kna-badge">👑</div>
          <div className="kna-title">KING NEET AIR</div>
          <div className="kna-sub">India's #1 NEET Prep Community</div>
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <>
            <div className="kna-step-title">Login karo 🎯</div>
            <div className="kna-step-sub">
              Apna Gmail daalo — hum OTP bhejenge
            </div>

            <label className="kna-label">Email Address</label>
            <input
              className="kna-input"
              type="email"
              placeholder="tumhara@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSendOTP()}
              autoFocus
            />

            {error   && <div className="kna-error">❌ {error}</div>}
            {success && <div className="kna-success">✅ {success}</div>}

            <div style={{ marginTop: 16 }}>
              <button className="kna-btn" onClick={handleSendOTP} disabled={loading}>
                {loading ? <div className="kna-spin" /> : "📧"}
                {loading ? "OTP bhej raha hoon..." : "OTP Bhejo"}
              </button>
            </div>

            <div className="kna-secure">
              {["🔒 Secure", "⚡ Fast", "🎯 Free"].map(p => (
                <span key={p} className="kna-sec-pill">{p}</span>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <>
            <button className="kna-back" onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); }}>
              ← Wapas jao
            </button>

            <div className="kna-step-title">OTP Enter Karo 🔐</div>
            <div className="kna-step-sub">
              6-digit code bheja gaya:
            </div>

            <div className="kna-email-chip">
              📧 {email}
            </div>

            {/* OTP timer bar */}
            <div className="kna-timer-wrap">
              <div className="kna-timer-bar" key={step} />
            </div>

            {/* 6 OTP Boxes */}
            <div className="kna-otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => (otpRefs.current[idx] = el)}
                  className={`kna-otp-box ${digit ? "filled" : ""} ${hasError ? "error" : ""}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  disabled={loading}
                />
              ))}
            </div>

            {error   && <div className="kna-error">❌ {error}</div>}
            {success && <div className="kna-success">✅ {success}</div>}

            <button
              className="kna-btn"
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? <div className="kna-spin" /> : "✅"}
              {loading ? "Verify ho raha hai..." : "Verify & Login"}
            </button>

            {/* Resend */}
            <div className="kna-resend">
              OTP nahi aaya?{" "}
              <button onClick={handleResend} disabled={resendWait > 0 || loading}>
                {resendWait > 0 ? `Resend OTP (${resendWait}s)` : "Resend OTP"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
