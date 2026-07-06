import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
    Loader2, CheckCircle2, Circle, XCircle, Calendar, Clock, Plus, Trash2,
    Flame, GripVertical, BookOpen, Target, ScrollText, ClipboardCheck, MoreHorizontal,
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
            <div className="absolute inset-0 rounded-full bg-[#00FF66]/25 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-[#00FF66]/25 border-dashed animate-spin [animation-duration:18s]" />
            <div className="absolute inset-3 rounded-full border border-[#00FF66]/10 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
        </div>
    );
}

// ─── Circular progress ring ─────────────────────────────────────────────
function ProgressRing({ percent, size = 56, stroke = 5, color = "#00FF66" }) {
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

    if (!today) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[#00FF66] animate-spin" /></div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="font-mono uppercase tracking-widest text-xs text-[#00FF66] mb-2">Study Tracker</p>
                    <h1 className="font-heading text-3xl sm:text-4xl font-black" style={{ color: "#fff", textShadow: "0 0 10px rgba(0,255,102,0.5), 0 0 24px rgba(0,255,102,0.3)" }}>Task Tracker</h1>
                </div>
                <div className="flex gap-2">
                    {[
                        { id: "today", label: "Daily" },
                        { id: "week", label: "Weekly" },
                        { id: "custom", label: "Custom" },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setView(tab.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                view === tab.id ? "bg-[#00FF66] text-black" : "border border-[#00FF66]/30 text-white/60 hover:text-white"
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {view === "today" && (
                <TodayView today={today} onToggle={toggleTask} onAdd={addQuickTask} />
            )}
            {view === "week" && (
                <WeekView week={week} />
            )}
            {view === "custom" && (
                <CustomView onSaved={() => { loadToday(); loadWeek(); }} />
            )}
        </div>
    );
}

// ─── TODAY VIEW ──────────────────────────────────────────────────────────
function TodayView({ today, onToggle, onAdd }) {
    const pct = today.total ? (today.score / today.total) * 100 : 0;
    const [filter, setFilter] = useState("all");

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
                            filter === c ? "bg-[#00FF66] text-black" : "border border-white/10 text-white/50 hover:text-white/80"
                        }`}>
                        {c === "all" ? "All" : CATEGORY_LABEL[c]} ({counts[c] || 0})
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {visibleTasks.map(task => {
                    const Icon = CATEGORY_ICON[task.category] || BookOpen;
                    const timeStatus = getTaskTimeStatus(task);
                    const isCurrent = timeStatus === "current";
                    const isMissed = timeStatus === "missed";
                    return (
                        <button key={task.id} onClick={() => onToggle(task.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition ${
                                task.done ? "border-[#00FF66]/40 bg-[#00FF66]/10"
                                : isCurrent ? "border-[#00FF66]/60 bg-[#00FF66]/[0.06] shadow-[0_0_16px_rgba(0,255,102,0.15)]"
                                : "border-white/10 hover:border-white/20"
                            }`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${task.done ? "bg-[#00FF66]/20" : "bg-white/5"}`}>
                                <Icon className={`w-4 h-4 ${task.done ? "text-[#00FF66]" : "text-white/50"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-bold truncate ${task.done ? "text-white/50 line-through" : "text-white/90"}`}>{task.label}</span>
                                    {isCurrent && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#00FF66] text-black shrink-0">Now</span>}
                                    {isMissed && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] shrink-0">Missed</span>}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/35 font-mono">
                                    <span className="uppercase tracking-wider">{CATEGORY_LABEL[task.category] || "Study"}</span>
                                    {task.start_time && <>
                                        <span>·</span>
                                        <span>{formatTime12h(task.start_time)}</span>
                                        {task.duration_minutes && <span className="text-white/25">({formatDuration(task.duration_minutes)})</span>}
                                    </>}
                                </div>
                            </div>
                            {task.done
                                ? <CheckCircle2 className="w-5 h-5 text-[#00FF66] shrink-0" />
                                : <Circle className="w-5 h-5 text-white/25 shrink-0" />
                            }
                        </button>
                    );
                })}
                {visibleTasks.length === 0 && (
                    <p className="text-center text-white/30 text-sm py-8">No tasks in this category yet.</p>
                )}
            </div>

            <QuickAddTask onAdd={onAdd} />

            <div className="glass-card p-4 mt-4 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-sm text-white/50">Break big goals into daily tasks and stay consistent!</p>
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
                className="w-full bg-black/30 border border-[#00FF66]/25 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#00FF66]" />

            <div className="flex flex-wrap gap-2 mb-3">
                {CATEGORY_LIST.map(c => {
                    const Icon = CATEGORY_ICON[c];
                    const active = category === c;
                    return (
                        <button key={c} type="button" onClick={() => setCategory(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                active ? "bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                            }`}>
                            <Icon className="w-3.5 h-3.5" />{CATEGORY_LABEL[c]}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 mb-3">
                <label className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus-within:border-[#00FF66]/40">
                    <Calendar className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                        className="bg-transparent outline-none text-white/80 w-full [color-scheme:dark]" />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 focus-within:border-[#00FF66]/40">
                    <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <input type="number" min="5" step="5" value={duration} onChange={(e) => setDuration(e.target.value)}
                        disabled={!startTime}
                        className="bg-transparent outline-none text-white/80 w-12 disabled:opacity-30" />
                    <span className="text-white/30">min</span>
                </label>
            </div>
            {!startTime && <p className="text-[11px] text-white/25 -mt-2 mb-3">No time set — task will appear as "Any time" at the end of the list.</p>}

            <button onClick={submit} disabled={saving || !label.trim()}
                className="w-full py-2.5 rounded-xl font-black text-sm text-black uppercase tracking-widest bg-[#00FF66] hover:opacity-90 transition disabled:opacity-40">
                {saving ? "Adding..." : "Add Task"}
            </button>
        </div>
    );
}

// ─── WEEK VIEW ───────────────────────────────────────────────────────────
function WeekView({ week }) {
    if (!week) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#00FF66] animate-spin" /></div>;

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
                    const statusColor = complete ? "#00FF66" : (d.is_past ? "#FF3B30" : "rgba(255,255,255,0.3)");

                    return (
                        <div key={d.date} className={`glass-card p-4 flex items-center justify-between ${d.is_today ? "border-[#00FF66]/40" : ""}`}>
                            <div className="flex items-center gap-3">
                                {d.is_sunday && <Flame className="w-4 h-4 text-[#FFD700]" />}
                                <div>
                                    <div className="font-bold text-sm">
                                        {d.weekday} {d.is_today && <span className="text-[#00FF66] text-xs ml-1">(Today)</span>}
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

    if (!tasks) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#00FF66] animate-spin" /></div>;

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
                            <button onClick={() => removeTask(task.id)} className="text-white/30 hover:text-[#FF3B30] transition shrink-0">
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
                    className="flex-1 bg-black/30 border border-[#00FF66]/25 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00FF66]" />
                <button onClick={addTask} className="px-4 bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 rounded-lg hover:bg-[#00FF66]/25 transition">
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
                                active ? "bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                            }`}>
                            <Icon className="w-3.5 h-3.5" />{CATEGORY_LABEL[c]}
                        </button>
                    );
                })}
            </div>

            <button onClick={save} disabled={saving}
                className="w-full py-3 rounded-xl font-black text-sm text-black uppercase tracking-widest bg-[#00FF66] hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}
