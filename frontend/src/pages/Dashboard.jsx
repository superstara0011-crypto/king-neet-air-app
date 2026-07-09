import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
    Trophy, Zap, BookOpen, Target, Clock, TrendingUp, TrendingDown, Star, Flame,
    ChevronRight, CheckCircle2, Calendar, BookMarked, PlayCircle, Brain,
} from "lucide-react";

function Avatar({ name, size = 10 }) {
    const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    const colors = ["#7C3AED", "#2563EB", "#059669", "#DC2626", "#D97706", "#DB2777"];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black text-white`}
            style={{ background: colors[idx], fontSize: size > 8 ? 16 : 12 }}>
            {initials}
        </div>
    );
}

function ProgressRing({ percent, size = 72, stroke = 6, color = "#6C63FF" }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, percent));
    const offset = circumference - (clamped / 100) * circumference;
    return (
        <svg width={size} height={size} className="shrink-0">
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth={stroke} fill="none" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            </g>
            <text x="50%" y="50%" dy=".35em" textAnchor="middle"
                style={{ fontSize: size * 0.24, fontWeight: 800, fill: "var(--text)", fontFamily: "Poppins, sans-serif" }}>
                {Math.round(clamped)}%
            </text>
        </svg>
    );
}

const PLAY_MODES = [
    { id: "pyq", path: "/play/pyq", icon: "📜", label: "PYQ Practice", desc: "2015–2024 papers", color: "#F59E0B", bg: "#FFFBEB" },
    { id: "daily", path: "/play/daily_quiz", icon: "⚡", label: "Daily Challenge", desc: "+4 XP per correct • Streak bonus", color: "#6C63FF", bg: "#F5F4FF", badge: "TODAY" },
    { id: "mock", path: "/play/mock_test", icon: "🎯", label: "Mock Test", desc: "180 Qs • 3 Hours • NEET Pattern", color: "#3B82F6", bg: "#EFF6FF" },
    { id: "chapter", path: "/play/chapter", icon: "📖", label: "Chapter Quiz", desc: "+2 XP per correct", color: "#7C3AED", bg: "#F5F3FF" },
];

// NEET 2027 exam date — update this if the official date is announced/changed
const NEET_EXAM_DATE = new Date("2027-05-03T00:00:00Z");

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [dailyDone, setDailyDone] = useState(false);

    useEffect(() => {
        api.get("/leaderboard?limit=5").then(r => setLeaderboard(r.data?.slice(0, 5) || [])).catch(() => {});
        api.get("/quiz/history?limit=5").then(r => setHistory(r.data || [])).catch(() => {});
        api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => setStats(null));

        const today = new Date().toISOString().split("T")[0];
        if (user?.daily_challenges_completed?.includes(today)) setDailyDone(true);
    }, [user]);

    if (!user) return null;

    const level = user.level || {};
    const xpProgress = level.progress ? Math.round(level.progress * 100) : 0;
    const xpToNext = (level.level_max ?? 0) - (level.current_xp ?? 0);
    const lastActivity = history?.[0];

    const daysLeft = Math.max(0, Math.ceil((NEET_EXAM_DATE - new Date()) / (1000 * 60 * 60 * 24)));

    const heatColor = (lvl) => {
        if (lvl === "completed") return "#6C63FF";
        if (lvl === "partial") return "#C7C2FF";
        return "var(--border)";
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-[var(--card-hover)] min-h-screen">

            {/* Exam Countdown Card */}
            <div className="relative overflow-hidden flex items-center justify-between gap-3 mb-6 px-6 py-8 sm:py-10 glass-card gradient-card fade-up">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-secondary)]">NEET 2027</span>
                    </div>
                    <div className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--text)]">
                        {daysLeft}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold">Days Left</span>
                </div>
                <img src="/steth-illustration.png" alt=""
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-32 sm:h-44 w-auto object-contain opacity-80 pointer-events-none mix-blend-multiply"
                    style={{ filter: "saturate(0.5) brightness(1.15)" }} />
            </div>

            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="text-[var(--text-secondary)] text-sm mb-1">Welcome back 👋</p>
                    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--text)]">{user.name?.split(" ")[0] || "Champion"}!</h1>
                </div>
                {user.streak > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
                        <Flame className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-bold text-[#B45309]">{user.streak} Day Streak</span>
                    </div>
                )}
            </div>

            {/* Continue Where You Left Off */}
            {lastActivity && (
                <div className="glass-card gradient-card p-4 mb-6 fade-up flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-[#EDE9FE]">
                        {lastActivity.mode === "daily_quiz" ? "⚡" : lastActivity.mode === "mock_test" ? "🎯" : lastActivity.mode === "pyq" ? "📜" : "📖"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#7C3AED] mb-0.5">Continue where you left off</div>
                        <div className="font-bold text-sm capitalize truncate text-[var(--text)]">
                            {lastActivity.mode?.replace("_", " ")} {lastActivity.subject ? `· ${lastActivity.subject}` : ""}
                        </div>
                    </div>
                    <button onClick={() => nav(PLAY_MODES.find(m => m.id === lastActivity.mode)?.path || "/play")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs flex-shrink-0 transition hover:opacity-90"
                        style={{ background: "#7C3AED", color: "#fff" }}>
                        <PlayCircle className="w-3.5 h-3.5" />Resume
                    </button>
                </div>
            )}

            {/* Your Progress */}
            <div className="glass-card p-5 mb-6 fade-up">
                <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3">Your Progress</p>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <ProgressRing percent={xpProgress} />
                        <div>
                            <div className="font-bold text-lg text-[var(--text)]">@{user.username}</div>
                            <span style={{ color: level.color || "#6C63FF" }} className="text-sm font-bold">{level.emoji} {level.name}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-extrabold text-[var(--text)]">{user.total_xp?.toLocaleString()} XP</div>
                        <div className="text-xs text-[var(--text-muted)]">{xpToNext?.toLocaleString()} XP to next level</div>
                    </div>
                </div>
                <div className="bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, #6C63FF, #7C3AED)` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-[var(--text-muted)]">{level.level_min?.toLocaleString()} XP</span>
                    <span className="text-xs text-[var(--text-muted)] font-semibold">{xpProgress}%</span>
                    <span className="text-xs text-[var(--text-muted)]">{level.level_max?.toLocaleString()} XP</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total XP", value: user.total_xp?.toLocaleString() || 0, icon: "⚡", color: "#6C63FF" },
                    { label: "Accuracy", value: `${user.questions_answered > 0 ? Math.round((user.correct_answers / user.questions_answered) * 100) : 0}%`, icon: "🎯", color: "#3B82F6" },
                    { label: "Answered", value: user.questions_answered?.toLocaleString() || 0, icon: "📝", color: "#F59E0B" },
                    { label: "Streak", value: `🔥 ${user.streak || 0}`, icon: "", color: "#F59E0B" },
                ].map(s => (
                    <div key={s.label} className="glass-card p-4">
                        <div className="text-xl mb-2">{s.icon}</div>
                        <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Today's Mission + Week Heatmap */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#F59E0B]" />
                            <span className="text-xs uppercase tracking-widest font-bold text-[#B45309]">Today's Mission</span>
                        </div>
                        {stats && <span className="text-xs text-[var(--text-muted)]">{stats.today_mission.answered}/{stats.today_mission.goal} Qs</span>}
                    </div>
                    <div className="bg-[var(--border)] rounded-full h-2.5 overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${stats?.today_mission?.percent || 0}%`, background: "#F59E0B" }} />
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                        {!stats ? "Loading…" : stats.today_mission.completed
                            ? "🎉 Goal complete! Great work today."
                            : `${stats.today_mission.goal - stats.today_mission.answered} more questions to hit today's goal`}
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-[#3B82F6]" />
                        <span className="text-xs uppercase tracking-widest font-bold text-[#1D4ED8]">This Week</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                        {(stats?.week_heatmap || Array.from({ length: 7 })).map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                <div className="w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all"
                                    style={{
                                        background: d ? heatColor(d.level) : "var(--border)",
                                        color: d?.level === "completed" ? "#fff" : "#9CA3AF",
                                        outline: d?.is_today ? "2px solid #6C63FF" : "none",
                                        outlineOffset: "1px",
                                    }}>
                                    {d?.level === "completed" ? "✓" : ""}
                                </div>
                                <span className="text-[9px] text-[var(--text-muted)] font-medium">{d?.label || "·"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-8">

                    {/* XP System Info */}
                    <div className="glass-card p-4">
                        <div className="text-xs uppercase tracking-widest font-bold text-[#6C63FF] mb-2">⚡ XP System</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                            <div className="bg-[var(--card-hover)] rounded-xl p-2"><div className="font-extrabold text-[#6C63FF]">+4 XP</div><div className="text-[var(--text-muted)]">Live/Daily correct</div></div>
                            <div className="bg-[var(--card-hover)] rounded-xl p-2"><div className="font-extrabold text-[#3B82F6]">+4 XP</div><div className="text-[var(--text-muted)]">Normal correct</div></div>
                            <div className="bg-[var(--card-hover)] rounded-xl p-2"><div className="font-extrabold text-[#EF4444]">-1 XP</div><div className="text-[var(--text-muted)]">Wrong answer</div></div>
                            <div className="bg-[var(--card-hover)] rounded-xl p-2"><div className="font-extrabold text-[#F59E0B]">+10 XP</div><div className="text-[var(--text-muted)]">Chapter bonus</div></div>
                        </div>
                    </div>

                    {/* Practice mode selection, subject progress, and weak chapters now live
                        on the Practice tab (Play.jsx) — see BottomNav. Keeping Home focused
                        on progress/overview instead of duplicating practice entry points. */}

                    {/* Recent History */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)]">Recent Activity</p>
                                <Link to="/history" className="text-xs font-semibold text-[#6C63FF] hover:underline">View all →</Link>
                            </div>
                            <div className="glass-card overflow-hidden divide-y divide-[#E5E7EB]">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="text-lg">{h.mode === "daily_quiz" ? "⚡" : h.mode === "mock_test" ? "🎯" : h.mode === "pyq" ? "📜" : "📖"}</div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm capitalize text-[var(--text)]">{h.mode?.replace("_", " ")}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{h.correct}/{h.total} correct • {h.subject || "Mixed"}</div>
                                        </div>
                                        <div className="text-sm font-extrabold text-[#6C63FF]">+{h.xp_earned} XP</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                    {/* Daily Challenge */}
                    <div className="glass-card gradient-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-[#6C63FF]" />
                            <span className="text-xs uppercase tracking-widest font-bold text-[#6C63FF]">Daily Challenge</span>
                            {dailyDone && <span className="text-xs font-bold text-[#22C55E]">✅ Done!</span>}
                        </div>
                        <div className="font-extrabold text-2xl mb-1 text-[var(--text)]">20 Questions</div>
                        <div className="text-[var(--text-secondary)] text-sm mb-4">+4 XP per correct • Streak bonus</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-[var(--card)] rounded-xl p-3 text-center border border-[var(--border)]"><div className="font-extrabold text-[#6C63FF]">+4 XP</div><div className="text-xs text-[var(--text-muted)]">Per Correct</div></div>
                            <div className="bg-[var(--card)] rounded-xl p-3 text-center border border-[var(--border)]"><div className="font-extrabold text-[#F59E0B]">🔥 {user.streak || 0}</div><div className="text-xs text-[var(--text-muted)]">Day Streak</div></div>
                        </div>
                        <button onClick={() => nav("/play/daily_quiz")}
                            disabled={dailyDone}
                            className={dailyDone ? "w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest bg-[var(--border)] text-[var(--text-muted)]" : "neon-btn w-full py-3 text-sm uppercase tracking-widest"}>
                            {dailyDone ? "✅ Completed" : "Start Challenge →"}
                        </button>
                    </div>

                    {/* Mistake Notebook preview — real counts */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-[#EF4444]" />
                                <span className="font-bold text-sm text-[var(--text)]">Mistake Notebook</span>
                            </div>
                            {stats?.total_mistakes > 0 && <span className="text-xs font-bold text-[#EF4444]">{stats.total_mistakes}</span>}
                        </div>
                        {stats && stats.total_mistakes > 0 ? (
                            <>
                                <div className="space-y-1.5 mb-3">
                                    {Object.entries(stats.mistake_counts).filter(([, c]) => c > 0).map(([subj, c]) => (
                                        <div key={subj} className="flex items-center justify-between text-xs">
                                            <span className="text-[var(--text-secondary)] capitalize">{subj}</span>
                                            <span className="text-[var(--text-muted)]">{c} mistakes</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => nav("/mistakes")}
                                    className="btn-secondary w-full py-2.5 text-xs uppercase tracking-widest">
                                    Review All Mistakes →
                                </button>
                            </>
                        ) : (
                            <p className="text-xs text-[var(--text-muted)]">No mistakes yet — keep up the great accuracy! 🎯</p>
                        )}
                    </div>

                    {/* Study Resources */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BookMarked className="w-4 h-4 text-[#7C3AED]" />
                            <span className="font-bold text-sm text-[var(--text)]">Study Resources</span>
                        </div>
                        <div className="space-y-1">
                            {[
                                { label: "Chapter Notes", icon: "📓", path: "/notes" },
                                { label: "Formula Sheets", icon: "📐", path: "/notes?type=formula" },
                                { label: "Quick Revision", icon: "⏱️", path: "/notes?type=revision" },
                            ].map(r => (
                                <button key={r.label} onClick={() => nav(r.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-[var(--card-hover)] text-left">
                                    <span className="text-lg">{r.icon}</span>
                                    <span className="flex-1 text-sm font-medium text-[var(--text)]">{r.label}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mini Leaderboard */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                                <span className="font-bold text-sm text-[var(--text)]">Top Rankers</span>
                            </div>
                            <Link to="/leaderboard" className="text-xs font-semibold text-[#6C63FF] hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-3">
                            {leaderboard.map((r, i) => (
                                <div key={r.user_id} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${i === 0 ? "bg-[#FDE68A] text-[#92400E]" : i === 1 ? "bg-[#E5E7EB] text-[var(--text)]" : i === 2 ? "bg-[#FED7AA] text-[#9A3412]" : "bg-[var(--card-hover)] text-[var(--text-muted)]"}`}>
                                        {i + 1}
                                    </div>
                                    <Avatar name={r.name} size={8} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs truncate text-[var(--text)]">@{r.username}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{r.level?.name}</div>
                                    </div>
                                    <div className="text-xs font-extrabold text-[#F59E0B] flex-shrink-0">{(r.xp || r.total_xp || 0).toLocaleString()}</div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && <div className="text-center text-[var(--text-muted)] text-sm py-4">No data yet</div>}
                        </div>
                    </div>

                    {/* 14-Day Info */}
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#F59E0B]" />
                            <span className="font-bold text-sm text-[#B45309]">14-Day Season</span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] space-y-1">
                            <div className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-[#22C55E]" /><span>Top 6 → Level UP ⬆️</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 text-center text-[#F59E0B]">—</span><span>Rank 7-8 → Same Level</span></div>
                            <div className="flex items-center gap-2"><TrendingDown className="w-3 h-3 text-[#EF4444]" /><span>Rank 9-12 → Level DOWN ⬇️</span></div>
                        </div>
                        <Link to="/leaderboard" className="block mt-3 text-center text-xs font-semibold text-[#6C63FF] hover:underline">View 14-Day Board →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
