import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import LevelBadge from "@/components/LevelBadge";
import { api, SUBJECT_COLORS, SUBJECT_LABEL } from "@/lib/api";
import { Atom, FlaskConical, Leaf, Sparkles, Calendar, Trophy, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
    const { user, refresh } = useAuth();
    const nav = useNavigate();
    const [editing, setEditing] = useState(false);
    const [usernameInput, setUsernameInput] = useState(user?.username || "");
    const [saving, setSaving] = useState(false);

    if (!user) return null;
    const level = user.level || { name: "Seed", emoji: "🌱", level_min: 0, level_max: 500, progress: 0 };
    const xpToNext = Math.max(0, level.level_max - user.total_xp);
    const accuracy = user.questions_answered > 0
        ? Math.round((user.correct_answers / user.questions_answered) * 100)
        : 0;

    const saveUsername = async () => {
        setSaving(true);
        try {
            await api.put("/auth/username", { username: usernameInput });
            await refresh();
            setEditing(false);
            toast.success("Username updated");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to update username");
        } finally {
            setSaving(false);
        }
    };

    const modes = [
        { id: "pyq", title: "PYQ Practice", desc: "Real previous year NEET questions", icon: <Trophy className="w-5 h-5" />, color: "#39FF14" },
        { id: "chapter", title: "Chapter Practice", desc: "Drill a single chapter", icon: <BookOpen className="w-5 h-5" />, color: "#FFD700" },
        { id: "daily_quiz", title: "Daily Quiz", desc: "10 questions · +10 XP daily bonus", icon: <Calendar className="w-5 h-5" />, color: "#00F0FF" },
        { id: "mock_test", title: "Mock Test", desc: "Timed full-syllabus challenge", icon: <Sparkles className="w-5 h-5" />, color: "#B900FF" },
    ];

    const subjects = [
        { id: "biology", icon: <Leaf className="w-6 h-6" />, label: "Biology" },
        { id: "physics", icon: <Atom className="w-6 h-6" />, label: "Physics" },
        { id: "chemistry", icon: <FlaskConical className="w-6 h-6" />, label: "Chemistry" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
            {/* HERO STATS */}
            <div className="fade-up grid lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 glass-card p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                        {user.picture ? (
                            <img src={user.picture} alt="" className="w-16 h-16 rounded-full border-2 border-[#39FF14]/50" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[#39FF14]/20 border-2 border-[#39FF14]/50 flex items-center justify-center text-2xl font-black">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-1">Welcome back</p>
                            <h1 className="font-heading text-2xl sm:text-3xl font-black truncate">{user.name}</h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {editing ? (
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[#39FF14]">@</span>
                                        <input
                                            value={usernameInput}
                                            onChange={(e) => setUsernameInput(e.target.value)}
                                            className="bg-black/40 border border-[#39FF14]/30 px-2 py-1 rounded text-sm font-mono w-36 focus:outline-none focus:border-[#39FF14]"
                                            data-testid="username-input"
                                        />
                                        <button onClick={saveUsername} disabled={saving} className="text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline" data-testid="username-save-btn">
                                            {saving ? "..." : "Save"}
                                        </button>
                                        <button onClick={() => setEditing(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-mono text-sm text-[#A1BBA1]">@{user.username}</span>
                                        <button onClick={() => { setUsernameInput(user.username); setEditing(true); }} className="text-xs text-white/40 hover:text-[#39FF14] underline" data-testid="username-edit-btn">
                                            edit
                                        </button>
                                    </>
                                )}
                                <LevelBadge level={level} size="sm" />
                            </div>
                        </div>
                    </div>

                    {/* XP PROGRESS */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs uppercase tracking-widest text-white/60">Progress to next level</span>
                            <span className="font-mono text-sm text-[#39FF14]" data-testid="xp-to-next">{xpToNext} XP to go</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-[#39FF14]/10">
                            <div
                                className="h-full bg-[#39FF14] rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, (level.progress || 0) * 100)}%`, boxShadow: "0 0 12px rgba(57,255,20,0.8)" }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 font-mono text-xs text-white/40">
                            <span>{level.level_min} XP</span>
                            <span className="text-white" data-testid="total-xp">{user.total_xp} XP</span>
                            <span>{level.level_max} XP</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <KPI label="Day Streak" value={`${user.streak || 0} 🔥`} testid="kpi-streak" />
                    <KPI label="Answered" value={user.questions_answered} testid="kpi-answered" />
                    <KPI label="Correct" value={user.correct_answers} testid="kpi-correct" />
                    <KPI label="Accuracy" value={`${accuracy}%`} testid="kpi-accuracy" />
                </div>
            </div>

            {/* MODE PICKER */}
            <h2 className="font-heading text-xl sm:text-2xl font-bold mb-4 uppercase tracking-wider">Choose Mode</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => nav(`/play/${m.id}`)}
                        className="glass-card p-6 text-left hover:border-[#39FF14]/50 transition group fade-up"
                        data-testid={`mode-${m.id}-btn`}
                    >
                        <div
                            className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 border"
                            style={{ background: `${m.color}15`, borderColor: `${m.color}40`, color: m.color }}
                        >
                            {m.icon}
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-1">{m.title}</h3>
                        <p className="text-sm text-[#A1BBA1] mb-4">{m.desc}</p>
                        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-bold text-[#39FF14] group-hover:gap-2 transition-all">
                            Start <ArrowRight className="w-3 h-3" />
                        </span>
                    </button>
                ))}
            </div>

            {/* QUICK SUBJECTS */}
            <h2 className="font-heading text-xl sm:text-2xl font-bold mb-4 uppercase tracking-wider">Quick Practice</h2>
            <div className="grid sm:grid-cols-3 gap-4">
                {subjects.map((s) => {
                    const color = SUBJECT_COLORS[s.id];
                    return (
                        <button
                            key={s.id}
                            onClick={() => nav(`/quiz?mode=pyq&subject=${s.id}`)}
                            className="glass-card p-5 flex items-center gap-4 hover:translate-y-[-2px] transition"
                            style={{ borderColor: `${color}30` }}
                            data-testid={`subject-${s.id}-btn`}
                        >
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ background: `${color}18`, color }}
                            >
                                {s.icon}
                            </div>
                            <div className="text-left">
                                <div className="font-heading font-bold">{s.label}</div>
                                <div className="text-xs font-mono uppercase tracking-widest" style={{ color }}>PYQ →</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function KPI({ label, value, testid }) {
    return (
        <div className="glass-card p-4 text-center" data-testid={testid}>
            <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-1">{label}</div>
            <div className="font-mono font-bold text-2xl text-[#39FF14]">{value}</div>
        </div>
    );
}
