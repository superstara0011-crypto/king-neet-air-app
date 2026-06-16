import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Trophy, Sparkles, BookOpen, Zap, Target, Star, Users, FileText, CheckCircle, X, Shield, ChevronRight, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { API, api } from "@/lib/api";

// ─── PW-style animated styles ──────────────────────────────────────────────
const LANDING_STYLES = `
@keyframes kna-fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kna-float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}
@keyframes kna-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
  70%  { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
  100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
}
@keyframes kna-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
@keyframes kna-spin {
  to { transform: rotate(360deg); }
}
@keyframes kna-slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kna-backdrop {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes kna-bounce-dot {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40%            { transform: scale(1.2); opacity: 1; }
}

.kna-shimmer-btn {
  background: linear-gradient(90deg, #7C3AED 0%, #9333ea 25%, #7C3AED 50%, #4F46E5 75%, #7C3AED 100%);
  background-size: 600px 100%;
  animation: kna-shimmer 2.5s linear infinite;
}
.kna-float { animation: kna-float 3.5s ease-in-out infinite; }
.kna-fadeUp { animation: kna-fadeUp 0.5s ease both; }
.kna-pulse  { animation: kna-pulse-ring 2.5s ease infinite; }

/* ── Google button ── */
.kna-google-btn {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  width: 100%; padding: 16px 20px;
  background: #fff;
  border: none; border-radius: 14px;
  color: #111; font-size: 16px; font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.kna-google-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  background: #f8f9fa;
}
.kna-google-btn:disabled { opacity: 0.7; cursor: not-allowed; }

/* ── PW-style modal backdrop ── */
.kna-backdrop {
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  display: flex; align-items: flex-end; justify-content: center;
  animation: kna-backdrop 0.25s ease;
}
@media (min-width: 640px) {
  .kna-backdrop { align-items: center; }
}

/* ── Bottom sheet / modal ── */
.kna-sheet {
  width: 100%; max-width: 440px;
  background: #0f1128;
  border: 1px solid rgba(124,58,237,0.25);
  border-radius: 24px 24px 0 0;
  padding: 28px 24px 36px;
  animation: kna-slideUp 0.35s cubic-bezier(.34,1.4,.64,1);
  position: relative;
}
@media (min-width: 640px) {
  .kna-sheet {
    border-radius: 24px;
    padding: 36px 32px;
  }
}

/* ── Sheet handle ── */
.kna-handle {
  width: 40px; height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  margin: 0 auto 24px;
}
@media (min-width: 640px) { .kna-handle { display: none; } }

/* ── Logout confirm modal ── */
.kna-logout-modal {
  width: 90%; max-width: 340px;
  background: #0f1128;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 28px 24px;
  animation: kna-fadeUp 0.3s ease;
  text-align: center;
}

/* ── OTP boxes (decorative, shows "Google secure" flow) ── */
.kna-secure-row {
  display: flex; gap: 10px; justify-content: center; margin: 20px 0;
}
.kna-secure-box {
  width: 52px; height: 56px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(124,58,237,0.3);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: #a78bfa;
  transition: all 0.3s ease;
}
.kna-secure-box.active {
  border-color: #7C3AED;
  background: rgba(124,58,237,0.15);
  box-shadow: 0 0 12px rgba(124,58,237,0.3);
}

/* ── Loading dots ── */
.kna-dots { display: flex; gap: 5px; align-items: center; }
.kna-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,0.5);
}
.kna-dot:nth-child(1) { animation: kna-bounce-dot 1.2s ease 0s infinite; }
.kna-dot:nth-child(2) { animation: kna-bounce-dot 1.2s ease 0.2s infinite; }
.kna-dot:nth-child(3) { animation: kna-bounce-dot 1.2s ease 0.4s infinite; }

/* ── Spinner ── */
.kna-spinner {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: kna-spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── Toast ── */
.kna-toast {
  position: fixed; bottom: 20px; left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: #1a1d36;
  border: 1px solid rgba(124,58,237,0.3);
  color: #f9fafb; padding: 12px 20px; border-radius: 50px;
  font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  z-index: 9999; white-space: nowrap;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.kna-toast.show { transform: translateX(-50%) translateY(0); }
`;

// ─── Google SVG Icon ────────────────────────────────────────────────────────
function GoogleSVG({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

// ─── PW-style Login Bottom Sheet ───────────────────────────────────────────
function LoginSheet({ onClose, onConfirm, loading }) {
    const [step, setStep] = useState(1); // 1 = welcome, 2 = confirming
    const [activeBox, setActiveBox] = useState(0);

    // animate secure boxes when confirming
    useEffect(() => {
        if (step === 2) {
            let i = 0;
            const t = setInterval(() => {
                setActiveBox(i % 4);
                i++;
                if (i > 20) clearInterval(t);
            }, 200);
            return () => clearInterval(t);
        }
    }, [step]);

    const handleContinue = () => {
        setStep(2);
        setTimeout(() => onConfirm(), 1200);
    };

    return (
        <div className="kna-backdrop" onClick={onClose}>
            <div className="kna-sheet" onClick={e => e.stopPropagation()}>
                <div className="kna-handle" />

                {/* Close btn */}
                <button onClick={onClose}
                    style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                    <X size={16} />
                </button>

                {step === 1 ? (
                    <>
                        {/* PW-style icon */}
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div className="kna-float" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #7C3AED, #4F46E5)", marginBottom: 12, fontSize: 32 }}>
                                👑
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", marginBottom: 4 }}>
                                Login to King NEET AIR
                            </div>
                            <div style={{ fontSize: 13, color: "#9ca3af" }}>
                                Aditya Raj Shambhu ka account hai?
                            </div>
                        </div>

                        {/* Account card — PW style */}
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                A
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#f9fafb" }}>Continue with Google</div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Secure login — no password needed</div>
                            </div>
                            <GoogleSVG size={22} />
                        </div>

                        {/* Security badges */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                            {["🔒 100% Secure", "⚡ Instant Login", "🎯 Free Forever"].map(b => (
                                <div key={b} style={{ padding: "5px 10px", borderRadius: 100, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 11, fontWeight: 600, color: "#a78bfa" }}>
                                    {b}
                                </div>
                            ))}
                        </div>

                        {/* CONTINUE button */}
                        <button onClick={handleContinue}
                            className="kna-shimmer-btn"
                            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <GoogleSVG size={20} />
                            CONTINUE WITH GOOGLE
                        </button>

                        <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>
                            By continuing you agree to our{" "}
                            <a href="#" style={{ color: "#818cf8", textDecoration: "none" }}>Terms</a> &amp;{" "}
                            <a href="#" style={{ color: "#818cf8", textDecoration: "none" }}>Privacy Policy</a>
                        </div>
                    </>
                ) : (
                    // Step 2 — Connecting animation (like PW OTP sent screen)
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb", marginBottom: 6 }}>
                            Google se connect ho raha hai...
                        </div>
                        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>
                            Thoda wait karo, secure connection establish ho rahi hai
                        </div>

                        {/* Animated boxes like OTP */}
                        <div className="kna-secure-row">
                            {["G", "o", "o", "g"].map((c, i) => (
                                <div key={i} className={`kna-secure-box ${activeBox === i ? "active" : ""}`}>
                                    {c}
                                </div>
                            ))}
                        </div>

                        <div className="kna-dots" style={{ justifyContent: "center", marginTop: 16 }}>
                            <div className="kna-dot" />
                            <div className="kna-dot" />
                            <div className="kna-dot" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Logout Confirmation Modal (PW style) ──────────────────────────────────
function LogoutModal({ onCancel, onConfirm }) {
    return (
        <div className="kna-backdrop" onClick={onCancel}>
            <div className="kna-logout-modal" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb", marginBottom: 6 }}>
                    Do you want to Log Out...?
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>
                    Tumhara progress save rahega. Anytime wapas aa sakte ho!
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onCancel}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a78bfa", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                        CANCEL
                    </button>
                    <button onClick={onConfirm}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                        LOG OUT
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Landing Component ─────────────────────────────────────────────────
export default function Landing() {
    const nav = useNavigate();
    const { user, loading } = useAuth();
    const [topRankers, setTopRankers] = useState([]);
    const [loginLoading, setLoginLoading] = useState(false);
    const [showLoginSheet, setShowLoginSheet] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: "", icon: "" });

    useEffect(() => {
        if (!loading && user) nav("/dashboard");
    }, [user, loading, nav]);

    useEffect(() => {
        api.get("/leaderboard?limit=5").then(r => setTopRankers(r.data?.slice(0, 5) || [])).catch(() => {});
    }, []);

    // inject styles
    useEffect(() => {
        const id = "kna-landing-styles";
        if (document.getElementById(id)) return;
        const s = document.createElement("style");
        s.id = id;
        s.textContent = LANDING_STYLES;
        document.head.appendChild(s);
        return () => { document.getElementById(id)?.remove(); };
    }, []);

    function showToast(msg, icon = "✅") {
        setToast({ show: true, msg, icon });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }

    // Opens PW-style login sheet
    const handleLogin = () => {
        if (loginLoading) return;
        setShowLoginSheet(true);
    };

    // Actual Google OAuth redirect (called after sheet confirm)
    const doGoogleLogin = async () => {
        setShowLoginSheet(false);
        setLoginLoading(true);
        showToast("Google se connect ho raha hai…", "🔗");
        try {
            const resp = await fetch(`${API}/auth/google/url`);
            const data = await resp.json();
            if (data.url) {
                sessionStorage.setItem("oauth_state", data.state);
                window.location.href = data.url;
            }
        } catch (e) {
            console.error("Login failed", e);
            showToast("Login fail hua, dobara try karo", "❌");
        } finally {
            setLoginLoading(false);
        }
    };

    const levelTeasers = [
        { name: "Seed", emoji: "🌱", xp: "0–500", color: "#88FF88" },
        { name: "Aspirant", emoji: "⚡", xp: "500–1.5k", color: "#00FFCC" },
        { name: "Scholar", emoji: "🎓", xp: "1.5k–5k", color: "#00A3FF" },
        { name: "Warrior", emoji: "⚔️", xp: "5k–10k", color: "#B900FF" },
        { name: "Champion", emoji: "🏆", xp: "10k–20k", color: "#FF007A" },
        { name: "KING NEET", emoji: "👑", xp: "20k–50k", color: "#FF3B30" },
        { name: "AIR LEGEND", emoji: "🌟", xp: "50k+", color: "#FFD700" },
    ];

    const features = [
        { icon: <BookOpen className="w-6 h-6" />, title: "Chapter-wise Practice", desc: "Practice topic-wise questions from all 3 subjects" },
        { icon: <FileText className="w-6 h-6" />, title: "NEET PYQs", desc: "Previous year questions help you score more" },
        { icon: <Zap className="w-6 h-6" />, title: "Daily Challenge", desc: "Solve daily questions and boost your rank" },
        { icon: <Star className="w-6 h-6" />, title: "Rank Boost", desc: "Compete with thousands of aspirants" },
        { icon: <Trophy className="w-6 h-6" />, title: "Level Up", desc: "Earn XP and become the KING of NEET" },
        { icon: <Crown className="w-6 h-6" />, title: "Premium", desc: "Unlock premium features at just ₹30/month" },
    ];

    const premiumFeatures = [
        "Extra Daily Questions",
        "Advanced PYQs",
        "Detailed Analysis",
        "Premium Badge",
        "Ad-free Experience",
    ];

    const stats = [
        { value: "50,000+", label: "Practice Questions" },
        { value: "10,000+", label: "PYQs" },
        { value: "100+", label: "Mock Tests" },
        { value: "50,000+", label: "Aspirants" },
    ];

    const levelColors = {
        "Seed": "#88FF88", "Aspirant": "#00FFCC", "Scholar": "#00A3FF",
        "Warrior": "#B900FF", "Champion": "#FF007A", "KING NEET": "#FF3B30", "AIR LEGEND": "#FFD700",
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #050B1F 0%, #0A0F2E 50%, #050B1F 100%)" }}>
            <style>{LANDING_STYLES}</style>

            {/* ── NAV ── */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10"
                style={{ background: "rgba(5,11,31,0.85)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-2">
                    <Crown className="w-7 h-7 text-yellow-400" />
                    <span className="font-black text-xl tracking-tight">
                        KING NEET <span className="text-yellow-400">AIR</span>
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white/70">
                    <a href="#home"     className="hover:text-white transition">Home</a>
                    <a href="#features" className="hover:text-white transition">Practice</a>
                    <a href="#levels"   className="hover:text-white transition">Levels</a>
                    <a href="#how"      className="hover:text-white transition">How it works</a>
                    <a href="#premium"  className="text-yellow-400 hover:text-yellow-300 transition">Premium</a>
                </nav>

                {/* PW-style nav login button */}
                <button onClick={handleLogin} disabled={loginLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "#fff", border: "none", cursor: "pointer" }}>
                    {loginLoading
                        ? <div className="kna-spinner" />
                        : <GoogleSVG size={16} />
                    }
                    {loginLoading ? "Loading..." : "Login"}
                </button>
            </header>

            {/* ── HERO ── */}
            <section id="home" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-start">
                {/* Left */}
                <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono text-xs uppercase tracking-widest text-yellow-400">No coins. Just rank.</span>
                    </div>

                    <div className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">WELCOME TO</div>
                    <h1 className="font-black leading-[0.9] tracking-tighter mb-6" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
                        KING <span className="text-yellow-400">NEET</span> AIR
                    </h1>

                    <p className="text-lg font-bold text-purple-300 mb-2 uppercase tracking-wide">
                        Practice Today, Achieve Tomorrow, Become the King of NEET
                    </p>
                    <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
                        Chapter-wise Practice • PYQs • Daily Challenge • Mock Tests • Rankings
                    </p>

                    {/* ── PW-style Hero CTA ── */}
                    <button onClick={handleLogin} disabled={loginLoading}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-lg text-white mb-3 kna-pulse"
                        style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", border: "none", cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={e => !loginLoading && (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                        {loginLoading
                            ? <div className="kna-spinner" />
                            : <GoogleSVG size={22} />
                        }
                        {loginLoading ? "Connecting..." : "Continue with Google — Free"}
                    </button>

                    {/* Trust line */}
                    <div className="flex items-center gap-2 mb-8" style={{ color: "#6b7280", fontSize: 12 }}>
                        <Shield size={14} style={{ color: "#818cf8" }} />
                        <span>100% secure • No password required • Instant access</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <div className="font-black text-2xl text-white mb-1">{s.value}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Top Rankers + Premium */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Top Rankers */}
                    <div className="rounded-2xl p-5 border border-yellow-400/20" style={{ background: "rgba(255,215,0,0.05)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="font-black uppercase tracking-widest text-xs text-yellow-400">Top Rankers Today</span>
                        </div>
                        <div className="space-y-3">
                            {topRankers.length > 0 ? topRankers.map((u, i) => (
                                <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-400 text-black" : "bg-white/10 text-white"}`}>
                                        {i + 1}
                                    </div>
                                    {u.picture && <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">@{u.username || u.name}</div>
                                        <div className="text-xs" style={{ color: levelColors[u.level?.name] || "#888" }}>Lv. {u.level?.name}</div>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-yellow-400">XP {u.total_xp?.toLocaleString()}</div>
                                </div>
                            )) : (
                                [
                                    { rank: 1, name: "@neet_king", level: "KING NEET", xp: "52,680" },
                                    { rank: 2, name: "@bio_master", level: "Champion", xp: "41,230" },
                                    { rank: 3, name: "@physics_pro", level: "Champion", xp: "38,750" },
                                    { rank: 4, name: "@dr_surgical", level: "Scholar", xp: "29,420" },
                                    { rank: 5, name: "@chem_legend", level: "Scholar", xp: "27,890" },
                                ].map((u) => (
                                    <div key={u.rank} className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${u.rank === 1 ? "bg-yellow-400 text-black" : u.rank === 2 ? "bg-gray-300 text-black" : u.rank === 3 ? "bg-orange-400 text-black" : "bg-white/10 text-white"}`}>
                                            {u.rank}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{u.name}</div>
                                            <div className="text-xs text-white/40">Lv. {u.level}</div>
                                        </div>
                                        <div className="font-mono text-xs font-bold text-yellow-400">XP {u.xp}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={handleLogin}
                            className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-400 border border-yellow-400/30 rounded-xl hover:bg-yellow-400/10 transition">
                            View Full Leaderboard →
                        </button>
                    </div>

                    {/* Premium Card */}
                    <div id="premium" className="rounded-2xl p-5 border border-purple-500/30" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))" }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="font-black text-yellow-400 uppercase tracking-widest text-xs">Unlock Premium</span>
                        </div>
                        <div className="font-black text-2xl mb-1">Just <span className="text-yellow-400">₹30</span> <span className="text-white/50 text-base font-normal">/ Month</span></div>
                        <div className="space-y-2 mb-4">
                            {premiumFeatures.map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleLogin}
                            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", border: "none", cursor: "pointer" }}>
                            ⚡ Upgrade Now
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <p className="font-mono text-xs uppercase tracking-widest text-purple-400 mb-3">Why King NEET AIR?</p>
                    <h2 className="font-black text-3xl sm:text-4xl">Everything you need to <span className="text-yellow-400">crack NEET</span></h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div key={f.title} className="p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition group" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:text-yellow-400 transition" style={{ background: "rgba(124,58,237,0.15)" }}>
                                {f.icon}
                            </div>
                            <h3 className="font-black text-lg mb-2">{f.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── LEVELS ── */}
            <section id="levels" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <p className="font-mono text-xs uppercase tracking-widest text-yellow-400 mb-3">Level Path</p>
                    <h2 className="font-black text-3xl sm:text-4xl">Climb the <span className="text-yellow-400">Throne</span></h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {levelTeasers.map((l) => (
                        <div key={l.name} className="p-5 rounded-2xl border transition hover:scale-105"
                            style={{ borderColor: l.color + "30", background: l.color + "08", cursor: "pointer" }}
                            onClick={handleLogin}>
                            <div className="text-4xl mb-3">{l.emoji}</div>
                            <div className="font-black text-lg mb-1" style={{ color: l.color }}>{l.name}</div>
                            <div className="font-mono text-xs text-white/40">{l.xp} XP</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <h2 className="font-black text-3xl sm:text-4xl">How it <span className="text-purple-400">works</span></h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { step: "01", icon: <Zap className="w-6 h-6" />, title: "Pick a mode", body: "PYQ Practice, Daily Quiz, or full Mock Test across Bio/Physics/Chem." },
                        { step: "02", icon: <Sparkles className="w-6 h-6" />, title: "Earn XP", body: "+4 per correct answer, -1 per wrong, +10 chapter & daily bonuses." },
                        { step: "03", icon: <Trophy className="w-6 h-6" />, title: "Rank up", body: "Climb 7 levels from Seed to AIR LEGEND. Top the leaderboards." },
                    ].map((c) => (
                        <div key={c.title} className="p-6 rounded-2xl border border-white/10 relative" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="absolute top-4 right-4 font-black text-4xl text-white/5">{c.step}</div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400" style={{ background: "rgba(124,58,237,0.15)" }}>
                                {c.icon}
                            </div>
                            <h3 className="font-black text-xl mb-2">{c.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{c.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-20 text-center">
                <h2 className="font-black text-3xl sm:text-5xl mb-4">Ready to become <span className="text-yellow-400">KING</span>?</h2>
                <p className="text-white/50 mb-8 text-lg">Join 50,000+ aspirants crushing NEET with XP</p>
                <button onClick={handleLogin} disabled={loginLoading}
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white kna-shimmer-btn"
                    style={{ border: "none", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                    {loginLoading ? <div className="kna-spinner" /> : <GoogleSVG size={24} />}
                    {loginLoading ? "Connecting..." : "Start for Free →"}
                </button>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 px-4 sm:px-8 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="font-black text-lg">KING NEET <span className="text-yellow-400">AIR</span></span>
                </div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
                    Stay Consistent · Stay Confident · Crack NEET
                </p>
            </footer>

            {/* ── PW-style Login Bottom Sheet ── */}
            {showLoginSheet && (
                <LoginSheet
                    onClose={() => setShowLoginSheet(false)}
                    onConfirm={doGoogleLogin}
                    loading={loginLoading}
                />
            )}

            {/* ── Logout Confirmation Modal (for future use, exportable) ── */}
            {showLogoutModal && (
                <LogoutModal
                    onCancel={() => setShowLogoutModal(false)}
                    onConfirm={() => { setShowLogoutModal(false); /* call logout fn */ }}
                />
            )}

            {/* ── Toast ── */}
            <div className={`kna-toast ${toast.show ? "show" : ""}`}>
                <span>{toast.icon}</span>
                {toast.msg}
            </div>
        </div>
    );
}

// Export logout modal separately so Dashboard.jsx can use it too
export { LogoutModal };
