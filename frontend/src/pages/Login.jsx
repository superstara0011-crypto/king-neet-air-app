/**
 * frontend/src/pages/Login.jsx
 * ─────────────────────────────────────────────────────────
 * King NEET AIR — Login / Sign Up
 *
 * Three ways in:
 *  1. Continue with Google  → /auth/google/url → Google → AuthCallback.jsx
 *  2. Log In (returning)    → email + password → /auth/login
 *  3. Sign Up (new)         → name + email + password → OTP code → /auth/register/*
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
  text-align:center;margin-bottom:24px;
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

/* tabs */
.kna-tabs {
  display:flex;gap:4px;margin-bottom:20px;
  background:rgba(255,255,255,.04);border-radius:12px;padding:4px;
}
.kna-tab {
  flex:1;padding:10px;border:none;border-radius:9px;
  background:transparent;color:#9ca3af;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.kna-tab.active {
  background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;
}

/* google button */
.kna-google-btn {
  width:100%;padding:14px;border-radius:13px;
  background:#fff;color:#1f2937;border:none;
  font-size:14px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  transition:transform .2s,opacity .2s;
}
.kna-google-btn:hover:not(:disabled) { transform:translateY(-2px); }
.kna-google-btn:disabled { opacity:.6;cursor:not-allowed; }

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
  display:flex;align-items:center;gap:10px;margin:18px 0;
}
.kna-divider-line { flex:1;height:1px;background:rgba(255,255,255,.07); }
.kna-divider-text { font-size:11px;color:#4b5563;font-weight:600; }

/* security row */
.kna-secure { display:flex;gap:6px;flex-wrap:wrap;margin-top:20px;justify-content:center; }
.kna-sec-pill {
  padding:5px 10px;border-radius:100px;font-size:11px;font-weight:600;
  background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);
  color:#818cf8;
}
`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96C.35 6.18 0 7.55 0 9s.35 2.82.96 4.04l3.01-2.34z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [step, setStep]       = useState(1);        // signup only: 1=details, 2=otp
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [resendWait, setResendWait] = useState(0);
  const [hasError, setHasError]     = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  useEffect(() => {
    const id = "kna-login-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = S;
    document.head.appendChild(el);
    return () => document.getElementById(id)?.remove();
  }, []);

  function saveSessionAndGo(data, msg) {
    localStorage.setItem("session_token", data.session_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setSuccess(msg);
    refresh().then(() => setTimeout(() => nav("/dashboard"), 500));
  }

  // ── Google ──────────────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/google/url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Couldn't start Google login");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  }

  // ── Log In (returning users) ───────────────────────────────────────────
  async function handleLogin(e) {
    e?.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      saveSessionAndGo(data, "Logged in! Redirecting 🚀");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Sign Up Step 1: send OTP ───────────────────────────────────────────
  async function handleSendOTP(e) {
    e?.preventDefault();
    setError(""); setSuccess("");
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Couldn't send code");
      setSuccess(`Code sent to ${email} 📬`);
      setResendWait(60);
      setTimeout(() => {
        setSuccess("");
        setStep(2);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(idx, val) {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    setError(""); setHasError(false);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join("").length === 6) {
      handleCompleteRegistration(newOtp.join(""));
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
      setTimeout(() => handleCompleteRegistration(pasted), 100);
    }
    e.preventDefault();
  }

  // ── Sign Up Step 2: verify OTP + create account ────────────────────────
  async function handleCompleteRegistration(otpStr) {
    setError(""); setSuccess(""); setLoading(true);
    const code = otpStr || otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit code"); setLoading(false); return;
    }
    try {
      const res = await fetch(`${API}/auth/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code,
          name: name.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");
      saveSessionAndGo(data, "Account created! Redirecting 🚀");
    } catch (err) {
      setError(err.message);
      setHasError(true);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => { setHasError(false); otpRefs.current[0]?.focus(); }, 600);
    } finally {
      setLoading(false);
    }
  }

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

        <div className="kna-logo">
          <div className="kna-badge">👑</div>
          <div className="kna-title">KING NEET AIR</div>
          <div className="kna-sub">India's #1 NEET Prep Community</div>
        </div>

        {step === 1 && (
          <div className="kna-tabs">
            <button className={`kna-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Log In
            </button>
            <button className={`kna-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
              Sign Up
            </button>
          </div>
        )}

        {step === 1 && (
          <>
            <button className="kna-google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
              {googleLoading
                ? <div className="kna-spin" style={{ borderTopColor: "#7C3AED" }} />
                : <GoogleIcon />}
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
            <div className="kna-divider">
              <div className="kna-divider-line" />
              <div className="kna-divider-text">OR</div>
              <div className="kna-divider-line" />
            </div>
          </>
        )}

        {/* ── LOG IN ── */}
        {step === 1 && mode === "login" && (
          <>
            <div className="kna-step-title">Welcome back 🎯</div>
            <div className="kna-step-sub">Log in with your email and password</div>

            <label className="kna-label">Email</label>
            <input
              className="kna-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              style={{ marginBottom: 14 }}
              autoFocus
            />

            <label className="kna-label">Password</label>
            <input
              className="kna-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />

            {error   && <div className="kna-error">❌ {error}</div>}
            {success && <div className="kna-success">✅ {success}</div>}

            <div style={{ marginTop: 16 }}>
              <button className="kna-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <div className="kna-spin" /> : "🔑"}
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </>
        )}

        {/* ── SIGN UP — Step 1: details ── */}
        {step === 1 && mode === "signup" && (
          <>
            <div className="kna-step-title">Create your account 🚀</div>
            <div className="kna-step-sub">We'll email you a code to confirm it's really you</div>

            <label className="kna-label">Full Name</label>
            <input
              className="kna-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              style={{ marginBottom: 14 }}
              autoFocus
            />

            <label className="kna-label">Email</label>
            <input
              className="kna-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              style={{ marginBottom: 14 }}
            />

            <label className="kna-label">Password</label>
            <input
              className="kna-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSendOTP()}
            />

            {error   && <div className="kna-error">❌ {error}</div>}
            {success && <div className="kna-success">✅ {success}</div>}

            <div style={{ marginTop: 16 }}>
              <button className="kna-btn" onClick={handleSendOTP} disabled={loading}>
                {loading ? <div className="kna-spin" /> : "📧"}
                {loading ? "Sending code..." : "Send Code"}
              </button>
            </div>
          </>
        )}

        {/* ── SIGN UP — Step 2: OTP ── */}
        {step === 2 && (
          <>
            <button className="kna-back" onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); }}>
              ← Back
            </button>

            <div className="kna-step-title">Enter the code 🔐</div>
            <div className="kna-step-sub">6-digit code sent to:</div>

            <div className="kna-email-chip">📧 {email}</div>

            <div className="kna-timer-wrap">
              <div className="kna-timer-bar" key={step} />
            </div>

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
              onClick={() => handleCompleteRegistration()}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? <div className="kna-spin" /> : "✅"}
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <div className="kna-resend">
              Didn't get it?{" "}
              <button onClick={handleResend} disabled={resendWait > 0 || loading}>
                {resendWait > 0 ? `Resend (${resendWait}s)` : "Resend Code"}
              </button>
            </div>
          </>
        )}

        <div className="kna-secure">
          {["🔒 Secure", "⚡ Fast", "🎯 Free"].map(p => (
            <span key={p} className="kna-sec-pill">{p}</span>
          ))}
        </div>

      </div>
    </div>
  );
}
