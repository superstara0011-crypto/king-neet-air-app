import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
    Loader2, CheckCircle2, Circle, XCircle, Calendar, Clock, Plus, Trash2,
    Flame, GripVertical, BookOpen, Target, ScrollText, ClipboardCheck, MoreHorizontal,
    MoreVertical, Play, TrendingUp, ListChecks, Timer, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICON = {
    study: BookOpen,
    practice: Target,
    revision: ScrollText,
    test: ClipboardCheck,
    other: MoreHorizontal,
};

const CATEGORY_LABEL = {
    study: "Study",
    practice: "Practice",
    revision: "Revision",
    test: "Test",
    other: "Other",
};

const CATEGORY_LIST = ["study", "practice", "revision", "test", "other"];

const CATEGORY_COLOR = {
    study: "#D8A7A0",
    practice: "#D4A574",
    revision: "#B8A8C9",
    test: "#C97064",
    other: "#9CA3AF",
};

const GLOW_TEXT = { textShadow: "0 0 6px currentColor, 0 0 18px currentColor" };

// ─── Time helpers ────────────────────────────────────────────────────────
function formatTime12h(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(mins) {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Returns "done" | "current" | "upcoming" | "missed" | null (no schedule)
function getTaskTimeStatus(task) {
    if (!task.start_time) return null;
    if (task.done) return "done";
    const now = new Date();
    const [h, m] = task.start_time.split(":").map(Number);
    const start = new Date(now); start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + (task.duration_minutes || 30) * 60000);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "current";
    return "missed";
}

// ─── Ambient glow decoration — the soft "medical tech" backdrop feel ────
function OrbitGlow({ size = 110 }) {
    return (
        <div className="absolute -z-10 pointer-events-none" aria-hidden="true"
            style={{ top: "50%", left: "50%", width: size, height: size, transform: "translate(-50%,-50%)" }}>
            <div className="absolute inset-0 rounded-full bg-[#D8A7A0]/25 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-[#D8A7A0]/25 border-dashed animate-spin [animation-duration:18s]" />
            <div className="absolute inset-3 rounded-full border border-[#D8A7A0]/10 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
        </div>
    );
}

// ─── Circular progress ring ─────────────────────────────────────────────
function ProgressRing({ percent, size = 56, stroke = 5, color = "#D8A7A0" }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, percent));
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <svg width={size} height={size}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
            </g>
            <text x="50%" y="50%" dy=".35em" textAnchor="middle"
                style={{ fontSize: size * 0.26, fontWeight: 900, fill: color, fontFamily: "monospace", textShadow: "0 0 6px currentColor, 0 0 14px currentColor" }}>
                {Math.round(clamped)}%
            </text>
        </svg>
    );
}

// ─── Small stat card for the top row ────────────────────────────────────
function StatCard({ icon, value, label, sub, color }) {
    return (
        <div className="glass-card p-3.5" style={{ borderColor: color + "25" }}>
            <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
            </div>
            <div className="font-mono text-xl font-black" style={{ color }}>{value}</div>
            <div className="text-[11px] text-white/35 truncate">{sub}</div>
        </div>
    );
}

export default function Tracker() {
    const { user } = useAuth();
    const [today, setToday] = useState(null);
    const [week, setWeek] = useState(null);
    const [view, setView] = useState("today"); // today | week | custom

    const loadToday = () => {
        api.get("/tracker/today")
            .then(r => setToday(r.data))
            .catch(() => { toast.error("Couldn't load tracker — try again"); });
    };

    const loadWeek = () => {
        api.get("/tracker/week").then(r => setWeek(r.data)).catch(() => {});
    };

    useEffect(() => {
        loadToday();
        loadWeek();
    }, []);

    const toggleTask = async (taskId) => {
        setToday(t => {
            const tasks = t.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task);
            const score = tasks.filter(t => t.done).length;
            return { ...t, tasks, score };
        });
        try {
            const r = await api.post("/tracker/today/toggle", { task_id: taskId });
            setToday(t => ({ ...t, score: r.data.score, label: r.data.label }));
            loadWeek();
        } catch {
            toast.error("Couldn't save — try again");
            loadToday();
        }
    };

    const addQuickTask = async (label, category, startTime, durationMinutes) => {
        try {
            const cur = await api.get("/tracker/tasks");
            const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + Date.now().toString(36).slice(-4);
            const tasks = [...cur.data.tasks, { id, label, category, start_time: startTime, duration_minutes: durationMinutes }];
            await api.put("/tracker/tasks", { tasks });
            toast.success("Task added!");
            loadToday();
            loadWeek();
        } catch {
            toast.error("Couldn't add task");
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const cur = await api.get("/tracker/tasks");
            const tasks = cur.data.tasks.filter(t => t.id !== taskId);
            await api.put("/tracker/tasks", { tasks });
            toast.success("Task removed");
            loadToday();
            loadWeek();
        } catch {
            toast.error("Couldn't remove task");
        }
    };

    if (!today) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[#D8A7A0] animate-spin" /></div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="font-mono uppercase tracking-widest text-xs text-[#D8A7A0] mb-2">Study Tracker</p>
                    <h1 className="font-heading text-3xl sm:text-4xl font-black" style={{ color: "#fff", textShadow: "0 0 10px rgba(0,255,102,0.5), 0 0 24px rgba(0,255,102,0.3)" }}>Task Tracker</h1>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { id: "today", label: "Daily" },
                        { id: "week", label: "Weekly" },
                        { id: "progress", label: "Progress" },
                        { id: "custom", label: "Custom" },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setView(tab.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                view === tab.id ? "bg-[#D8A7A0] text-black" : "border border-[#D8A7A0]/30 text-white/60 hover:text-white"
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {(() => {
                const weekTotal = week ? week.days.reduce((s, d) => s + d.total, 0) : 0;
                const weekScore = week ? week.days.reduce((s, d) => s + d.score, 0) : 0;
                const weekPct = weekTotal ? Math.round((weekScore / weekTotal) * 100) : 0;
                const donePct = today.total ? Math.round((today.score / today.total) * 100) : 0;
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 fade-up">
                        <StatCard icon={<ListChecks className="w-4 h-4" />} value={today.total} label="Total Tasks" sub="Created" color="#D4A574" />
                        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} value={today.score} label="Completed" sub={`${donePct}% Completed`} color="#9CAF88" />
                        <StatCard icon={<TrendingUp className="w-4 h-4" />} value={`${weekPct}%`} label="Weekly Progress" sub="This week" color="#A8C0C9" />
                        <StatCard icon={<Flame className="w-4 h-4" />} value={user?.streak ?? 0} label="Current Streak" sub="Keep it up!" color="#FF6B00" />
                    </div>
                );
            })()}

            {view === "today" && (
                <TodayView today={today} onToggle={toggleTask} onAdd={addQuickTask} onDelete={deleteTask} />
            )}
            {view === "week" && (
                <WeekView week={week} />
            )}
            {view === "progress" && (
                <ProgressView />
            )}
            {view === "custom" && (
                <CustomView onSaved={() => { loadToday(); loadWeek(); }} />
            )}
        </div>
    );
}

// ─── TODAY VIEW ──────────────────────────────────────────────────────────
function TodayView({ today, onToggle, onAdd, onDelete }) {
    const pct = today.total ? (today.score / today.total) * 100 : 0;
    const [filter, setFilter] = useState("all");
    const [menuFor, setMenuFor] = useState(null);

    const counts = { all: today.tasks.length };
    CATEGORY_LIST.forEach(c => { counts[c] = today.tasks.filter(t => t.category === c).length; });
    const visibleTasks = filter === "all" ? today.tasks : today.tasks.filter(t => t.category === filter);

    return (
        <div className="fade-up">
            <div className="glass-card p-5 mb-4 flex items-center justify-between relative overflow-hidden">
                <div>
                    <p className="font-bold text-lg" style={{ ...GLOW_TEXT, color: "#fff" }}>Today's Tasks</p>
                    <p className="text-sm text-white/40">{today.score}/{today.total} completed</p>
                </div>
                <div className="relative flex items-center justify-center">
                    <OrbitGlow />
                    <ProgressRing percent={pct} />
                </div>
            </div>

            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                {["all", ...CATEGORY_LIST].map(c => (
                    <button key={c} onClick={() => setFilter(c)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                            filter === c ? "bg-[#D8A7A0] text-black" : "border border-white/10 text-white/50 hover:text-white/80"
                        }`}>
                        {c === "all" ? "All" : CATEGORY_LABEL[c]} ({counts[c] || 0})
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {visibleTasks.map(task => {
                    const Icon = CATEGORY_ICON[task.category] || BookOpen;
                    const catColor = CATEGORY_COLOR[task.category] || "#9CAF88";
                    const timeStatus = getTaskTimeStatus(task);
                    const isCurrent = timeStatus === "current";
                    const isMissed = timeStatus === "missed";

                    return (
                        <div key={task.id}
                            className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition ${
                                task.done ? "border-[#9CAF88]/40 bg-[#9CAF88]/10"
                                : isCurrent ? "border-[#D8A7A0]/60 bg-[#D8A7A0]/[0.06] shadow-[0_0_16px_rgba(216,167,160,0.15)]"
                                : "border-white/10 hover:border-white/20"
                            }`}>
                            <button onClick={() => onToggle(task.id)} className="shrink-0">
                                {task.done
                                    ? <CheckCircle2 className="w-6 h-6 text-[#9CAF88]" />
                                    : isCurrent
                                        ? <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#D8A7A0]"><Play className="w-2.5 h-2.5 text-[#D8A7A0] fill-[#D8A7A0]" /></span>
                                        : <Circle className="w-6 h-6 text-white/25" />
                                }
                            </button>

                            <button onClick={() => onToggle(task.id)} className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${task.done ? "bg-[#9CAF88]/20" : "bg-white/5"}`}>
                                <Icon className={`w-4 h-4 ${task.done ? "text-[#9CAF88]" : "text-white/50"}`} />
                            </button>

                            <button onClick={() => onToggle(task.id)} className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-bold truncate ${task.done ? "text-white/50 line-through" : "text-white/90"}`}>{task.label}</span>
                                    {isMissed && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#C97064]/20 text-[#C97064] shrink-0">Missed</span>}
                                </div>
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                                    style={{ background: catColor + "22", color: catColor }}>
                                    {CATEGORY_LABEL[task.category] || "Study"}
                                </span>
                            </button>

                            {task.start_time && (
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-mono text-white/70">{formatTime12h(task.start_time)}</div>
                                    {task.duration_minutes && <div className="text-[10px] font-mono text-white/30">{formatDuration(task.duration_minutes)}</div>}
                                </div>
                            )}

                            <div className="relative shrink-0">
                                <button onClick={() => setMenuFor(menuFor === task.id ? null : task.id)} className="text-white/20 hover:text-white/50 p-1">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {menuFor === task.id && (
                                    <div className="absolute right-0 top-7 z-10 bg-[#0a0f0a] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                                        <button onClick={() => { setMenuFor(null); onDelete(task.id); }}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#C97064] hover:bg-[#C97064]/10 whitespace-nowrap">
                                            <Trash2 className="w-3.5 h-3.5" />Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {visibleTasks.length === 0 && (
                    <p className="text-center text-white/30 text-sm py-8">No tasks in this category yet.</p>
                )}
            </div>

            <QuickAddTask onAdd={onAdd} />

            <FocusMode />

            <div className="glass-card p-4 mt-4 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-sm text-white/50">Break big goals into daily tasks and stay consistent!</p>
            </div>
        </div>
    );
}

// ─── Focus Mode — simple pomodoro-style countdown, no backend needed ────
function FocusMode() {
    const [seconds, setSeconds] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return;
        if (seconds <= 0) { setRunning(false); return; }
        const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [running, seconds]);

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    const reset = () => { setRunning(false); setSeconds(25 * 60); };

    return (
        <div className="glass-card p-4 mt-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-bold text-sm flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#D8A7A0]" />Focus Mode
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Eliminate distractions. Boost your productivity.</p>
                </div>
                <div className="font-mono text-2xl font-black text-[#D8A7A0] shrink-0" style={GLOW_TEXT}>{mm}:{ss}</div>
            </div>
            <div className="flex gap-2 mt-3">
                <button onClick={() => setRunning(r => !r)}
                    className="flex-1 py-2 rounded-xl font-black text-xs text-black uppercase tracking-widest bg-[#D8A7A0] hover:opacity-90 transition">
                    {running ? "Pause" : seconds === 25 * 60 ? "Start Focus Session" : "Resume"}
                </button>
                {seconds !== 25 * 60 && (
                    <button onClick={reset} className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest border border-white/15 text-white/60 hover:text-white transition">
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── PROGRESS VIEW — monthly calendar heatmap + streaks ─────────────────
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function ProgressView() {
    const now = new Date();
    const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(null);
        api.get(`/tracker/calendar?year=${cursor.year}&month=${cursor.month}`)
            .then(r => setData(r.data))
            .catch(() => setData(null));
    }, [cursor]);

    const changeMonth = (delta) => {
        setCursor(c => {
            let m = c.month + delta, y = c.year;
            if (m > 12) { m = 1; y += 1; }
            if (m < 1) { m = 12; y -= 1; }
            return { year: y, month: m };
        });
    };

    if (!data) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#D8A7A0] animate-spin" /></div>;

    const leadingBlanks = (data.days[0].weekday + 1) % 7; // Monday=0..Sunday=6 -> Sunday-first grid
    const monthPct = data.month_total ? Math.round((data.month_completed / data.month_total) * 100) : 0;

    return (
        <div className="fade-up space-y-4">
            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white transition">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm">{MONTH_NAMES[cursor.month - 1]} {cursor.year}</span>
                    <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white transition">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-white/30">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
                    {data.days.map(d => {
                        const complete = !d.is_future && d.total > 0 && d.score === d.total;
                        const missed = d.is_past && d.total > 0 && d.score < d.total;
                        return (
                            <div key={d.date} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold relative ${
                                d.is_today ? "ring-2 ring-[#D8A7A0]" : ""
                            }`}
                                style={{
                                    background: complete ? "#9CAF88" : missed ? "rgba(255,59,48,0.15)" : "rgba(255,255,255,0.04)",
                                    color: complete ? "#000" : missed ? "#C97064" : d.is_future ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.6)",
                                }}>
                                {complete ? <CheckCircle2 className="w-4 h-4" /> : missed ? <XCircle className="w-3.5 h-3.5" /> : d.day}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 mt-4 text-[11px] text-white/40">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#9CAF88]" />Completed</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/10" />Pending</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#C97064]/20" />Missed</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1">Streak</p>
                    <p className="font-mono text-2xl font-black text-[#FF6B00]">🔥 {data.current_streak} <span className="text-sm text-white/40">Days</span></p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1">Best Streak</p>
                    <p className="font-mono text-2xl font-black text-[#D4A574]">{data.best_streak} <span className="text-sm text-white/40">Days</span></p>
                </div>
            </div>

            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">Tasks Completed</p>
                    <p className="font-mono text-sm text-white/50">{data.month_completed}/{data.month_total}</p>
                </div>
                <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#9CAF88] transition-all" style={{ width: `${monthPct}%` }} />
                </div>
            </div>
        </div>
    );
}

function QuickAddTask({ onAdd }) {
    const [label, setLabel] = useState("");
    const [category, setCategory] = useState("study");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState(60);
    const [saving, setSaving] = useState(false);

    const submit = async () => {
        if (!label.trim()) return;
        setSaving(true);
        await onAdd(label.trim(), category, startTime || null, startTime ? Number(duration) : null);
        setLabel("");
        setCategory("study");
        setStartTime("");
        setDuration(60);
        setSaving(false);
    };

    return (
        <div className="glass-card p-4 mt-6">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Add a New Task</p>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="e.g. Solve 30 Questions"
                className="w-full bg-black/30 border border-[#D8A7A0]/25 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#D8A7A0]" />

            <div className="flex flex-wrap gap-2 mb-3">
                {CATEGORY_LIST.map(c => {
                    const Icon = CATEGORY_ICON[c];
                    const active = category === c;
                    return (
                        <button key={c} type="button" onClick={() => setCategory(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                active ? "bg-[#D8A7A0]/15 text-[#D8A7A0] border-[#D8A7A0]/40" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                            }`}>
                            <Icon className="w-3.5 h-3.5" />{CATEGORY_LABEL[c]}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 mb-3">
                <label className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus-within:border-[#D8A7A0]/40">
                    <Calendar className="w-3.5 h-3.5 text-[#D8A7A0] shrink-0" />
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                        className="bg-transparent outline-none text-white/80 w-full [color-scheme:dark]" />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus-within:border-[#D8A7A0]/40">
                    <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <input type="number" min="5" step="5" value={duration} onChange={(e) => setDuration(e.target.value)}
                        disabled={!startTime}
                        className="bg-transparent outline-none text-white/80 w-12 disabled:opacity-30" />
                    <span className="text-white/30">min</span>
                </label>
            </div>
            {!startTime && <p className="text-[11px] text-white/25 -mt-2 mb-3">No time set — task will appear as "Any time" at the end of the list.</p>}

            <button onClick={submit} disabled={saving || !label.trim()}
                className="w-full py-2.5 rounded-xl font-black text-sm text-black uppercase tracking-widest bg-[#D8A7A0] hover:opacity-90 transition disabled:opacity-40">
                {saving ? "Adding..." : "Add Task"}
            </button>
        </div>
    );
}

// ─── WEEK VIEW ───────────────────────────────────────────────────────────
function WeekView({ week }) {
    if (!week) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#D8A7A0] animate-spin" /></div>;

    const completedDays = week.days.filter(d => d.total > 0 && d.score === d.total).length;
    const pct = week.days.length ? (completedDays / week.days.length) * 100 : 0;

    return (
        <div className="fade-up">
            <div className="glass-card p-5 mb-6 flex items-center justify-between relative overflow-hidden">
                <div>
                    <p className="font-bold text-lg" style={{ ...GLOW_TEXT, color: "#fff" }}>This Week</p>
                    <p className="text-sm text-white/40">{completedDays}/{week.days.length} completed</p>
                </div>
                <div className="relative flex items-center justify-center">
                    <OrbitGlow />
                    <ProgressRing percent={pct} />
                </div>
            </div>

            <div className="space-y-2">
                {week.days.map(d => {
                    const complete = d.total > 0 && d.score === d.total;
                    const StatusIcon = complete ? CheckCircle2 : (d.is_past ? XCircle : Circle);
                    const statusColor = complete ? "#9CAF88" : (d.is_past ? "#C97064" : "rgba(255,255,255,0.3)");

                    return (
                        <div key={d.date} className={`glass-card p-4 flex items-center justify-between ${d.is_today ? "border-[#D8A7A0]/40" : ""}`}>
                            <div className="flex items-center gap-3">
                                {d.is_sunday && <Flame className="w-4 h-4 text-[#D4A574]" />}
                                <div>
                                    <div className="font-bold text-sm">
                                        {d.weekday} {d.is_today && <span className="text-[#D8A7A0] text-xs ml-1">(Today)</span>}
                                    </div>
                                    <div className="text-xs text-white/40 mt-0.5">
                                        {d.total ? `${d.score}/${d.total} tasks done` : "No tasks set"}
                                    </div>
                                </div>
                            </div>
                            <StatusIcon className="w-5 h-5 shrink-0" style={{ color: statusColor }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── CUSTOM VIEW (task editor — manage your own daily checklist) ────────
function CustomView({ onSaved }) {
    const [tasks, setTasks] = useState(null);
    const [newLabel, setNewLabel] = useState("");
    const [newCategory, setNewCategory] = useState("study");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/tracker/tasks").then(r => setTasks(r.data.tasks)).catch(() => setTasks([]));
    }, []);

    const addTask = () => {
        if (!newLabel.trim()) return;
        const id = newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + Date.now().toString(36).slice(-4);
        setTasks(t => [...t, { id, label: newLabel.trim(), category: newCategory }]);
        setNewLabel("");
        setNewCategory("study");
    };

    const removeTask = (id) => setTasks(t => t.filter(x => x.id !== id));
    const updateLabel = (id, label) => setTasks(t => t.map(x => x.id === id ? { ...x, label } : x));

    const save = async () => {
        if (tasks.length === 0) { toast.error("Add at least one task"); return; }
        setSaving(true);
        try {
            await api.put("/tracker/tasks", { tasks });
            toast.success("Tasks updated!");
            onSaved();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to save");
        } finally { setSaving(false); }
    };

    if (!tasks) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#D8A7A0] animate-spin" /></div>;

    return (
        <div className="fade-up">
            <p className="text-white/40 text-sm mb-4">Customize your daily checklist — add, remove, or rename tasks to match your routine.</p>

            <div className="space-y-2 mb-4">
                {tasks.map(task => {
                    const Icon = CATEGORY_ICON[task.category] || BookOpen;
                    return (
                        <div key={task.id} className="flex items-center gap-2 glass-card p-3">
                            <GripVertical className="w-4 h-4 text-white/20 shrink-0" />
                            <Icon className="w-4 h-4 text-white/40 shrink-0" />
                            <input value={task.label} onChange={(e) => updateLabel(task.id, e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white/90" />
                            <button onClick={() => removeTask(task.id)} className="text-white/30 hover:text-[#C97064] transition shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-2 mb-3">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add a new task..."
                    className="flex-1 bg-black/30 border border-[#D8A7A0]/25 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D8A7A0]" />
                <button onClick={addTask} className="px-4 bg-[#D8A7A0]/15 text-[#D8A7A0] border border-[#D8A7A0]/40 rounded-lg hover:bg-[#D8A7A0]/25 transition">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORY_LIST.map(c => {
                    const Icon = CATEGORY_ICON[c];
                    const active = newCategory === c;
                    return (
                        <button key={c} type="button" onClick={() => setNewCategory(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                active ? "bg-[#D8A7A0]/15 text-[#D8A7A0] border-[#D8A7A0]/40" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                            }`}>
                            <Icon className="w-3.5 h-3.5" />{CATEGORY_LABEL[c]}
                        </button>
                    );
                })}
            </div>

            <button onClick={save} disabled={saving}
                className="w-full py-3 rounded-xl font-black text-sm text-black uppercase tracking-widest bg-[#D8A7A0] hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}
