import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import { Trophy, Zap, BookOpen, Target, Clock, TrendingUp, Star, Flame } from "lucide-react";

// Privacy: Initials avatar
function Avatar({ name, size = 10 }) {
    const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    const colors = ["#7C3AED", "#2563EB", "#059669", "#DC2626", "#D97706", "#DB2777"];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black text-white border-2 border-white/20`}
            style={{ background: colors[idx], fontSize: size > 8 ? 16 : 12 }}>
            {initials}
        </div>
    );
}

const PLAY_MODES = [
    { id: "pyq", path: "/play/pyq", icon: "📜", label: "PYQ Practice", desc: "2015–2024 papers", color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
    { id: "daily", path: "/play/daily_quiz", icon: "⚡", label: "Daily Challenge", desc: "+4 XP per correct • Streak bonus", color: "#39FF14", bg: "rgba(57,255,20,0.08)", badge: "TODAY" },
    { id: "mock", path: "/play/mock_test", icon: "🎯", label: "Mock Test", desc: "180 Qs • 3 Hours • NEET Pattern", color: "#00F0FF", bg: "rgba(0,240,255,0.08)" },
    { id: "chapter", path: "/play/chapter", icon: "📖", label: "Chapter Quiz", desc: "+2 XP per correct", color: "#B900FF", bg: "rgba(185,0,255,0.08)" },
];

const SUBJECTS = [
    { name: "Biology", icon: "🧬", color: "#39FF14", path: "/play/chapter?subject=biology" },
    { name: "Physics", icon: "⚛️", color: "#00F0FF", path: "/play/chapter?subject=physics" },
    { name: "Chemistry", icon: "🧪", color: "#B900FF", path: "/play/chapter?subject=chemistry" },
];

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const [dailyDone, setDailyDone] = useState(false);

    useEffect(() => {
        api.get("/leaderboard?limit=5").then(r => setLeaderboard(r.data?.slice(0, 5) || [])).catch(() => {});
        api.get("/quiz/history?limit=5").then(r => setHistory(r.data || [])).catch(() => {});
        // Check if daily challenge done today
        const today = new Date().toISOString().split("T")[0];
        if (user?.daily_challenges_completed?.includes(today)) setDailyDone(true);
    }, [user]);

    if (!user) return null;

    const level = user.level || {};
    const xpProgress = level.progress ? Math.round(level.progress * 100) : 0;
    const xpToNext = level.level_max - level.current_xp;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-8 fade-up">
                <div>
                    <p className="text-white/50 text-sm mb-1">Welcome back 👋</p>
                    <h1 className="font-heading font-black text-3xl sm:text-4xl">
                        {user.name?.split(" ")[0] || "Champion"}!
                    </h1>
                </div>
                <div className="flex gap-3">
                    {user.streak > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10">
                            <Flame className="w-4 h-4 text-[#FF3B30]" />
                            <span className="font-black text-[#FF3B30]">{user.streak} Day Streak</span>
                        </div>
                    )}
                </div>
            </div>

            {/* XP + Level Bar */}
            <div className="glass-card p-5 mb-8 fade-up">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar name={user.name} size={12} />
                        <div>
                            <div className="font-bold text-lg">@{user.username}</div>
                            <div className="flex items-center gap-2">
                                <span style={{ color: level.color || "#39FF14" }} className="font-mono text-sm font-bold">
                                    {level.emoji} {level.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-2xl font-black text-[#39FF14]">{user.total_xp?.toLocaleString()} XP</div>
                        <div className="font-mono text-xs text-white/40">{xpToNext?.toLocaleString()} XP to next level</div>
                    </div>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${xpProgress}%`, background: level.color || "#39FF14", boxShadow: `0 0 10px ${level.color || "#39FF14"}` }} />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="font-mono text-xs text-white/40">{level.level_min?.toLocaleString()} XP</span>
                    <span className="font-mono text-xs text-white/40">{xpProgress}%</span>
                    <span className="font-mono text-xs text-white/40">{level.level_max?.toLocaleString()} XP</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total XP", value: user.total_xp?.toLocaleString() || 0, icon: "⚡", color: "#39FF14" },
                    { label: "Accuracy", value: `${user.questions_answered > 0 ? Math.round((user.correct_answers / user.questions_answered) * 100) : 0}%`, icon: "🎯", color: "#00F0FF" },
                    { label: "Answered", value: user.questions_answered?.toLocaleString() || 0, icon: "📝", color: "#FFD700" },
                    { label: "Streak", value: `🔥 ${user.streak || 0}`, icon: "", color: "#FF3B30" },
                ].map(s => (
                    <div key={s.label} className="glass-card p-4">
                        <div className="text-xl mb-2">{s.icon}</div>
                        <div className="font-mono text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-mono text-xs text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT — Play Modes + Subjects */}
                <div className="lg:col-span-2 space-y-8">

                    {/* XP System Info */}
                    <div className="glass-card p-4 border border-[#39FF14]/20">
                        <div className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-2">⚡ XP System</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="font-black text-[#39FF14]">+4 XP</div>
                                <div className="text-white/40">Live/Daily correct</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="font-black text-[#00F0FF]">+2 XP</div>
                                <div className="text-white/40">Normal correct</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="font-black text-[#FF3B30]">-1 XP</div>
                                <div className="text-white/40">Wrong answer</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="font-black text-[#FFD700]">+10 XP</div>
                                <div className="text-white/40">Chapter bonus</div>
                            </div>
                        </div>
                    </div>

                    {/* Play Modes */}
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-3">Choose Mode</p>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAY_MODES.map(m => (
                                <button key={m.id}
                                    onClick={() => nav(m.path)}
                                    className="relative p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: m.bg, borderColor: m.color + "30" }}>
                                    {m.badge && (
                                        <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                                            style={{ background: m.color, color: "#000" }}>{m.badge}</span>
                                    )}
                                    {dailyDone && m.id === "daily" && (
                                        <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20">✅ DONE</span>
                                    )}
                                    <div className="text-2xl mb-2">{m.icon}</div>
                                    <div className="font-bold text-sm text-white mb-1">{m.label}</div>
                                    <div className="text-xs text-white/50">{m.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subjects */}
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-3">Practice by Subject</p>
                        <div className="grid grid-cols-3 gap-3">
                            {SUBJECTS.map(s => (
                                <button key={s.name} onClick={() => nav(s.path)}
                                    className="glass-card p-4 text-center transition-all hover:scale-[1.03]"
                                    style={{ borderColor: s.color + "30" }}>
                                    <div className="text-3xl mb-2">{s.icon}</div>
                                    <div className="font-bold text-sm" style={{ color: s.color }}>{s.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent History */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-mono text-xs uppercase tracking-widest text-white/40">Recent Activity</p>
                                <Link to="/history" className="font-mono text-xs text-[#39FF14] hover:underline">View all →</Link>
                            </div>
                            <div className="glass-card overflow-hidden">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0">
                                        <div className="text-lg">
                                            {h.mode === "daily_quiz" ? "⚡" : h.mode === "mock_test" ? "🎯" : h.mode === "pyq" ? "📜" : "📖"}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm capitalize">{h.mode?.replace("_", " ")}</div>
                                            <div className="font-mono text-xs text-white/40">
                                                {h.correct}/{h.total} correct • {h.subject || "Mixed"}
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm font-black text-[#39FF14]">+{h.xp_earned} XP</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT — Leaderboard + Daily */}
                <div className="space-y-6">
                    {/* Daily Challenge */}
                    <div className="glass-card p-5 border border-[#39FF14]/25"
                        style={{ background: "linear-gradient(135deg, rgba(57,255,20,0.05), rgba(0,0,0,0))" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-[#39FF14]" />
                            <span className="font-mono text-xs uppercase tracking-widest text-[#39FF14]">Daily Challenge</span>
                            {dailyDone && <span className="text-xs font-bold text-[#39FF14]">✅ Done!</span>}
                        </div>
                        <div className="font-black text-2xl mb-1">20 Questions</div>
                        <div className="text-white/40 text-sm mb-4">+4 XP per correct • Streak bonus</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="font-black text-[#39FF14]">+4 XP</div>
                                <div className="text-xs text-white/40">Per Correct</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="font-black text-[#FF3B30]">🔥 {user.streak || 0}</div>
                                <div className="text-xs text-white/40">Day Streak</div>
                            </div>
                        </div>
                        <button onClick={() => nav("/play/daily_quiz")}
                            className="w-full py-3 rounded-xl font-black text-sm text-black uppercase tracking-widest transition hover:opacity-90"
                            style={{ background: dailyDone ? "#39FF1450" : "#39FF14", color: dailyDone ? "#39FF14" : "#000" }}>
                            {dailyDone ? "✅ Completed" : "Start Challenge →"}
                        </button>
                    </div>

                    {/* Mini Leaderboard */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#FFD700]" />
                                <span className="font-bold text-sm">Top Rankers</span>
                            </div>
                            <Link to="/leaderboard" className="font-mono text-xs text-[#39FF14] hover:underline">View all →</Link>
                        </div>
                        <div className="space-y-3">
                            {leaderboard.map((r, i) => (
                                <div key={r.user_id} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                                        style={{ background: i === 0 ? "#FFD700" : i === 1 ? "#9CA3AF" : i === 2 ? "#F97316" : "#ffffff15", color: i < 3 ? "#000" : "#888" }}>
                                        {i + 1}
                                    </div>
                                    {/* Privacy: Initials only */}
                                    <Avatar name={r.name} size={8} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs truncate">@{r.username}</div>
                                        <div className="font-mono text-[10px] text-white/40">{r.level?.name}</div>
                                    </div>
                                    <div className="font-mono text-xs font-black text-[#FFD700] flex-shrink-0">
                                        {(r.xp || r.total_xp || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="text-center text-white/30 text-sm py-4">No data yet</div>
                            )}
                        </div>
                        {/* Your rank */}
                        <div className="mt-4 p-3 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/50">Your rank</span>
                                <span className="font-black text-[#7C3AED]">Coming soon</span>
                            </div>
                        </div>
                    </div>

                    {/* 14-Day Info */}
                    <div className="glass-card p-4 border border-[#FFD700]/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#FFD700]" />
                            <span className="font-bold text-sm text-[#FFD700]">14-Day Season</span>
                        </div>
                        <div className="text-xs text-white/50 space-y-1">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-[#39FF14]" />
                                <span>Top 6 → Level UP ⬆️</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 text-center text-[#FFD700]">—</span>
                                <span>Rank 7-8 → Same Level</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-[#FF3B30] rotate-180" />
                                <span>Rank 9-12 → Level DOWN ⬇️</span>
                            </div>
                        </div>
                        <Link to="/leaderboard" onClick={() => {}} className="block mt-3 text-center text-xs font-bold text-[#FFD700] hover:underline">
                            View 14-Day Board →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
