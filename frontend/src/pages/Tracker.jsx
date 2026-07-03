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

    const addQuickTask = async (label, category) => {
        try {
            const cur = await api.get("/tracker/tasks");
            const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + Date.now().toString(36).slice(-4);
            const tasks = [...cur.data.tasks, { id, label, category }];
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

    return (
        <div className="fade-up">
            <div className="glass-card p-5 mb-6 flex items-center justify-between relative overflow-hidden">
                <div>
                    <p className="font-bold text-lg" style={{ ...GLOW_TEXT, color: "#fff" }}>Today's Tasks</p>
                    <p className="text-sm text-white/40">{today.score}/{today.total} completed</p>
                </div>
                <div className="relative flex items-center justify-center">
                    <OrbitGlow />
                    <ProgressRing percent={pct} />
                </div>
            </div>

            <div className="space-y-2">
                {today.tasks.map(task => {
                    const Icon = CATEGORY_ICON[task.category] || BookOpen;
                    return (
                        <button key={task.id} onClick={() => onToggle(task.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition ${
                                task.done ? "border-[#00FF66]/40 bg-[#00FF66]/10" : "border-white/10 hover:border-white/20"
                            }`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${task.done ? "bg-[#00FF66]/20" : "bg-white/5"}`}>
                                <Icon className={`w-4 h-4 ${task.done ? "text-[#00FF66]" : "text-white/50"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-bold truncate ${task.done ? "text-white/50 line-through" : "text-white/90"}`}>{task.label}</div>
                                <div className="text-xs text-white/35 font-mono uppercase tracking-wider">{CATEGORY_LABEL[task.category] || "Study"}</div>
                            </div>
                            {task.done
                                ? <CheckCircle2 className="w-5 h-5 text-[#00FF66] shrink-0" />
                                : <Circle className="w-5 h-5 text-white/25 shrink-0" />
                            }
                        </button>
                    );
                })}
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
    const [saving, setSaving] = useState(false);

    const submit = async () => {
        if (!label.trim()) return;
        setSaving(true);
        await onAdd(label.trim(), category);
        setLabel("");
        setCategory("study");
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
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                    <Calendar className="w-3.5 h-3.5" />Today
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 border border-white/10">
                    <Clock className="w-3.5 h-3.5" />Any time
                </span>
            </div>

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
