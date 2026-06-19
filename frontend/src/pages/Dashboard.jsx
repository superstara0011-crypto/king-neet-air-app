import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
    Trophy, Zap, BookOpen, Target, Clock, TrendingUp, TrendingDown, Star, Flame,
    ChevronRight, CheckCircle2, Calendar, BookMarked, PlayCircle, Brain, AlertTriangle,
} from "lucide-react";

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

const SUBJECT_META = {
    biology:   { name: "Biology",   icon: "🧬", color: "#39FF14", path: "/play/chapter?subject=biology" },
    physics:   { name: "Physics",   icon: "⚛️", color: "#00F0FF", path: "/play/chapter?subject=physics" },
    chemistry: { name: "Chemistry", icon: "🧪", color: "#B900FF", path: "/play/chapter?subject=chemistry" },
};

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
        if (lvl === "completed") return "#39FF14";
        if (lvl === "partial") return "#FFD700";
        return "rgba(255,255,255,0.06)";
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

            {/* Exam Countdown Banner */}
            <div className="flex items-center justify-between gap-3 mb-6 px-4 py-2.5 rounded-xl border border-[#FFD700]/25 fade-up"
                style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.08), rgba(0,0,0,0))" }}>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FFD700]" />
                    <span className="font-mono text-xs sm:text-sm text-white/70">NEET 2027</span>
                </div>
                <span className="font-mono text-sm font-black text-[#FFD700]">{daysLeft} Days Left</span>
            </div>

            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="text-white/50 text-sm mb-1">Welcome back 👋</p>
                    <h1 className="font-heading font-black text-3xl sm:text-4xl">{user.name?.split(" ")[0] || "Champion"}!</h1>
                </div>
                {user.streak > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10">
                        <Flame className="w-4 h-4 text-[#FF3B30]" />
                        <span className="font-black text-[#FF3B30]">{user.streak} Day Streak</span>
                    </div>
                )}
            </div>

            {/* Continue Where You Left Off */}
            {lastActivity && (
                <div className="glass-card p-4 mb-6 fade-up flex items-center gap-4 border border-[#7C3AED]/25"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,0,0,0))" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                        {lastActivity.mode === "daily_quiz" ? "⚡" : lastActivity.mode === "mock_test" ? "🎯" : lastActivity.mode === "pyq" ? "📜" : "📖"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa] mb-0.5">Continue where you left off</div>
                        <div className="font-bold text-sm capitalize truncate">
                            {lastActivity.mode?.replace("_", " ")} {lastActivity.subject ? `· ${lastActivity.subject}` : ""}
                        </div>
                    </div>
                    <button onClick={() => nav(PLAY_MODES.find(m => m.id === lastActivity.mode)?.path || "/play")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs flex-shrink-0 transition hover:scale-105"
                        style={{ background: "#7C3AED", color: "#fff" }}>
                        <PlayCircle className="w-3.5 h-3.5" />Resume
                    </button>
                </div>
            )}

            {/* XP + Level Bar */}
            <div className="glass-card p-5 mb-6 fade-up">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar name={user.name} size={12} />
                        <div>
                            <div className="font-bold text-lg">@{user.username}</div>
                            <span style={{ color: level.color || "#39FF14" }} className="font-mono text-sm font-bold">{level.emoji} {level.name}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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

            {/* Today's Mission + Week Heatmap */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-5 border border-[#FFD700]/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#FFD700]" />
                            <span className="font-mono text-xs uppercase tracking-widest text-[#FFD700]">Today's Mission</span>
                        </div>
                        {stats && <span className="font-mono text-xs text-white/40">{stats.today_mission.answered}/{stats.today_mission.goal} Qs</span>}
                    </div>
                    <div className="bg-white/10 rounded-full h-2.5 overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${stats?.today_mission?.percent || 0}%`, background: "#FFD700", boxShadow: "0 0 8px #FFD700" }} />
                    </div>
                    <div className="text-xs text-white/40">
                        {!stats ? "Loading…" : stats.today_mission.completed
                            ? "🎉 Goal complete! Great work today."
                            : `${stats.today_mission.goal - stats.today_mission.answered} more questions to hit today's goal`}
                    </div>
                </div>

                <div className="glass-card p-5 border border-[#00F0FF]/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-[#00F0FF]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF]">This Week</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                        {(stats?.week_heatmap || Array.from({ length: 7 })).map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                <div className="w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                                    style={{
                                        background: d ? heatColor(d.level) : "rgba(255,255,255,0.06)",
                                        color: d?.level === "completed" ? "#000" : "rgba(255,255,255,0.3)",
                                        boxShadow: d?.level === "completed" ? "0 0 8px rgba(57,255,20,0.5)" : "none",
                                        outline: d?.is_today ? "1.5px solid rgba(255,255,255,0.4)" : "none",
                                    }}>
                                    {d?.level === "completed" ? "✓" : ""}
                                </div>
                                <span className="text-[9px] font-mono text-white/30">{d?.label || "·"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-8">

                    {/* XP System Info */}
                    <div className="glass-card p-4 border border-[#39FF14]/20">
                        <div className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-2">⚡ XP System</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                            <div className="bg-white/5 rounded-lg p-2"><div className="font-black text-[#39FF14]">+4 XP</div><div className="text-white/40">Live/Daily correct</div></div>
                            <div className="bg-white/5 rounded-lg p-2"><div className="font-black text-[#00F0FF]">+2 XP</div><div className="text-white/40">Normal correct</div></div>
                            <div className="bg-white/5 rounded-lg p-2"><div className="font-black text-[#FF3B30]">-1 XP</div><div className="text-white/40">Wrong answer</div></div>
                            <div className="bg-white/5 rounded-lg p-2"><div className="font-black text-[#FFD700]">+10 XP</div><div className="text-white/40">Chapter bonus</div></div>
                        </div>
                    </div>

                    {/* Play Modes */}
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-3">Choose Mode</p>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAY_MODES.map(m => (
                                <button key={m.id} onClick={() => nav(m.path)}
                                    className="relative p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: m.bg, borderColor: m.color + "30" }}>
                                    {m.badge && <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: m.color, color: "#000" }}>{m.badge}</span>}
                                    {dailyDone && m.id === "daily" && <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20">✅ DONE</span>}
                                    <div className="text-2xl mb-2">{m.icon}</div>
                                    <div className="font-bold text-sm text-white mb-1">{m.label}</div>
                                    <div className="text-xs text-white/50">{m.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subjects with Real Progress */}
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-3">Practice by Subject</p>
                        <div className="space-y-3">
                            {Object.entries(SUBJECT_META).map(([key, s]) => {
                                const prog = stats?.subject_progress?.[key];
                                const pct = prog?.accuracy ?? 0;
                                const attempted = prog?.attempted ?? 0;
                                return (
                                    <button key={key} onClick={() => nav(s.path)}
                                        className="glass-card w-full p-4 text-left transition-all hover:scale-[1.01]" style={{ borderColor: s.color + "30" }}>
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <div className="text-2xl flex-shrink-0">{s.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.name}</span>
                                                    <span className="font-mono text-xs text-white/40">
                                                        {attempted > 0 ? `${pct}% accuracy · ${attempted} Qs` : "Start practicing →"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                                        </div>
                                        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weak Chapters — real data, only shows once enough attempts exist */}
                    {stats?.weak_chapters?.length > 0 && (
                        <div>
                            <p className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] flex items-center gap-1.5 mb-3">
                                <AlertTriangle className="w-3.5 h-3.5" />Weak Chapters
                            </p>
                            <div className="glass-card overflow-hidden border border-[#FF3B30]/20">
                                {stats.weak_chapters.map((c, i) => (
                                    <button key={i} onClick={() => nav(`/play/chapter?subject=${c.subject}&chapter=${encodeURIComponent(c.chapter)}`)}
                                        className="w-full flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition text-left">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{c.chapter}</div>
                                            <div className="font-mono text-xs text-white/40 capitalize">{c.subject} · {c.attempted} attempts</div>
                                        </div>
                                        <span className="font-mono text-sm font-black text-[#FF3B30]">{c.accuracy}%</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                                        <div className="text-lg">{h.mode === "daily_quiz" ? "⚡" : h.mode === "mock_test" ? "🎯" : h.mode === "pyq" ? "📜" : "📖"}</div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm capitalize">{h.mode?.replace("_", " ")}</div>
                                            <div className="font-mono text-xs text-white/40">{h.correct}/{h.total} correct • {h.subject || "Mixed"}</div>
                                        </div>
                                        <div className="font-mono text-sm font-black text-[#39FF14]">+{h.xp_earned} XP</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                    {/* Daily Challenge */}
                    <div className="glass-card p-5 border border-[#39FF14]/25" style={{ background: "linear-gradient(135deg, rgba(57,255,20,0.05), rgba(0,0,0,0))" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-[#39FF14]" />
                            <span className="font-mono text-xs uppercase tracking-widest text-[#39FF14]">Daily Challenge</span>
                            {dailyDone && <span className="text-xs font-bold text-[#39FF14]">✅ Done!</span>}
                        </div>
                        <div className="font-black text-2xl mb-1">20 Questions</div>
                        <div className="text-white/40 text-sm mb-4">+4 XP per correct • Streak bonus</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-white/5 rounded-xl p-3 text-center"><div className="font-black text-[#39FF14]">+4 XP</div><div className="text-xs text-white/40">Per Correct</div></div>
                            <div className="bg-white/5 rounded-xl p-3 text-center"><div className="font-black text-[#FF3B30]">🔥 {user.streak || 0}</div><div className="text-xs text-white/40">Day Streak</div></div>
                        </div>
                        <button onClick={() => nav("/play/daily_quiz")}
                            className="w-full py-3 rounded-xl font-black text-sm text-black uppercase tracking-widest transition hover:opacity-90"
                            style={{ background: dailyDone ? "#39FF1450" : "#39FF14", color: dailyDone ? "#39FF14" : "#000" }}>
                            {dailyDone ? "✅ Completed" : "Start Challenge →"}
                        </button>
                    </div>

                    {/* Mistake Notebook preview — real counts */}
                    <div className="glass-card p-5 border border-[#B900FF]/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-[#B900FF]" />
                                <span className="font-bold text-sm">Mistake Notebook</span>
                            </div>
                            {stats?.total_mistakes > 0 && <span className="font-mono text-xs font-bold text-[#B900FF]">{stats.total_mistakes}</span>}
                        </div>
                        {stats && stats.total_mistakes > 0 ? (
                            <>
                                <div className="space-y-1.5 mb-3">
                                    {Object.entries(stats.mistake_counts).filter(([, c]) => c > 0).map(([subj, c]) => (
                                        <div key={subj} className="flex items-center justify-between text-xs">
                                            <span className="text-white/60 capitalize">{subj}</span>
                                            <span className="font-mono text-white/40">{c} mistakes</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => nav("/mistakes")}
                                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-[#B900FF]/40 text-[#B900FF] hover:bg-[#B900FF]/10 transition">
                                    Review All Mistakes →
                                </button>
                            </>
                        ) : (
                            <p className="text-xs text-white/30">No mistakes yet — keep up the great accuracy! 🎯</p>
                        )}
                    </div>

                    {/* Study Resources */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BookMarked className="w-4 h-4 text-[#a78bfa]" />
                            <span className="font-bold text-sm">Study Resources</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: "Chapter Notes", icon: "📓", path: "/notes" },
                                { label: "Formula Sheets", icon: "📐", path: "/notes?type=formula" },
                                { label: "Quick Revision", icon: "⏱️", path: "/notes?type=revision" },
                            ].map(r => (
                                <button key={r.label} onClick={() => nav(r.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-white/5 text-left">
                                    <span className="text-lg">{r.icon}</span>
                                    <span className="flex-1 text-sm font-medium text-white/80">{r.label}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                                </button>
                            ))}
                        </div>
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
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-400 text-black" : "bg-white/10 text-white"}`}>
                                        {i + 1}
                                    </div>
                                    <Avatar name={r.name} size={8} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs truncate">@{r.username}</div>
                                        <div className="font-mono text-[10px] text-white/40">{r.level?.name}</div>
                                    </div>
                                    <div className="font-mono text-xs font-black text-[#FFD700] flex-shrink-0">{(r.xp || r.total_xp || 0).toLocaleString()}</div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && <div className="text-center text-white/30 text-sm py-4">No data yet</div>}
                        </div>
                    </div>

                    {/* 14-Day Info */}
                    <div className="glass-card p-4 border border-[#FFD700]/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#FFD700]" />
                            <span className="font-bold text-sm text-[#FFD700]">14-Day Season</span>
                        </div>
                        <div className="text-xs text-white/50 space-y-1">
                            <div className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-[#39FF14]" /><span>Top 6 → Level UP ⬆️</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 text-center text-[#FFD700]">—</span><span>Rank 7-8 → Same Level</span></div>
                            <div className="flex items-center gap-2"><TrendingDown className="w-3 h-3 text-[#FF3B30]" /><span>Rank 9-12 → Level DOWN ⬇️</span></div>
                        </div>
                        <Link to="/leaderboard" className="block mt-3 text-center text-xs font-bold text-[#FFD700] hover:underline">View 14-Day Board →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
