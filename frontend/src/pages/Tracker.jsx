import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
    Loader2, CheckCircle2, Circle, Calendar, Settings, Plus, Trash2,
    Crown, Flame, TrendingUp, X, GripVertical,
} from "lucide-react";
import { toast } from "sonner";

const SCORE_COLORS = {
    "🔥 Excellent": "#39FF14",
    "✅ Good": "#00F0FF",
    "⚠️ Average": "#FFD700",
    "❌ Improve": "#FF3B30",
    "—": "#666",
};

export default function Tracker() {
    const { user } = useAuth();
    const [today, setToday] = useState(null);
    const [week, setWeek] = useState(null);
    const [view, setView] = useState("today"); // today | week | settings
    const [forbidden, setForbidden] = useState(false);

    const loadToday = () => {
        api.get("/tracker/today")
            .then(r => setToday(r.data))
            .catch(e => { if (e.response?.status === 403) setForbidden(true); });
    };

    const loadWeek = () => {
        api.get("/tracker/week").then(r => setWeek(r.data)).catch(() => {});
    };

    useEffect(() => {
        loadToday();
        loadWeek();
    }, []);

    const toggleTask = async (taskId) => {
        // Optimistic update
        setToday(t => {
            const tasks = t.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task);
            const score = tasks.filter(t => t.done).length;
            return { ...t, tasks, score };
        });
        try {
            const r = await api.post("/tracker/today/toggle", { task_id: taskId });
            setToday(t => ({ ...t, score: r.data.score, label: r.data.label }));
            loadWeek(); // keep weekly view in sync
        } catch {
            toast.error("Couldn't save — try again");
            loadToday(); // revert on failure
        }
    };

    if (forbidden) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <Crown className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <h2 className="font-heading text-2xl font-black mb-2">Premium Feature</h2>
                <p className="text-white/50">The Daily Study Tracker is available for Premium members. Climb the leaderboard to unlock it!</p>
            </div>
        );
    }

    if (!today) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
    );

    const scoreColor = SCORE_COLORS[today.label] || "#39FF14";

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[#FFD700]" />Premium
                    </p>
                    <h1 className="font-heading text-3xl sm:text-4xl font-black">Daily Tracker</h1>
                </div>
                <div className="flex gap-2">
                    {[
                        { id: "today", icon: <CheckCircle2 className="w-4 h-4" />, label: "Today" },
                        { id: "week", icon: <Calendar className="w-4 h-4" />, label: "Week" },
                        { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Edit" },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setView(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                view === tab.id ? "bg-[#39FF14] text-black" : "border border-[#39FF14]/30 text-white/60 hover:text-white"
                            }`}>
                            {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {view === "today" && (
                <TodayView today={today} onToggle={toggleTask} scoreColor={scoreColor} />
            )}
            {view === "week" && (
                <WeekView week={week} />
            )}
            {view === "settings" && (
                <SettingsView onSaved={() => { loadToday(); loadWeek(); setView("today"); }} />
            )}
        </div>
    );
}

// ─── TODAY VIEW ──────────────────────────────────────────────────────────
function TodayView({ today, onToggle, scoreColor }) {
    return (
        <div className="fade-up">
            <div className="glass-card p-5 mb-6 flex items-center justify-between">
                <div>
                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">Today's Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-black" style={{ color: scoreColor }}>{today.score}</span>
                        <span className="font-mono text-white/40">/ {today.total}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-bold text-lg" style={{ color: scoreColor }}>{today.label}</span>
                    <div className="w-32 bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(today.score / today.total) * 100}%`, background: scoreColor }} />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {today.tasks.map(task => (
                    <button key={task.id} onClick={() => onToggle(task.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                            task.done ? "border-[#39FF14]/40 bg-[#39FF14]/10" : "border-white/10 hover:border-white/20"
                        }`}>
                        {task.done
                            ? <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
                            : <Circle className="w-5 h-5 text-white/30 shrink-0" />
                        }
                        <span className={`text-sm ${task.done ? "text-white/50 line-through" : "text-white/90"}`}>{task.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── WEEK VIEW ───────────────────────────────────────────────────────────
function WeekView({ week }) {
    if (!week) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#39FF14] animate-spin" /></div>;

    return (
        <div className="fade-up space-y-3">
            {week.days.map(d => {
                const color = SCORE_COLORS[d.label] || "#39FF14";
                return (
                    <div key={d.date} className={`glass-card p-4 flex items-center justify-between ${d.is_today ? "border-[#39FF14]/40" : ""}`}>
                        <div className="flex items-center gap-3">
                            {d.is_sunday && <Flame className="w-4 h-4 text-[#FFD700]" />}
                            <div>
                                <div className="font-bold text-sm">{d.weekday} {d.is_today && <span className="text-[#39FF14] text-xs ml-1">(Today)</span>}</div>
                                <div className="font-mono text-xs text-white/40">{d.date}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(d.score / d.total) * 100}%`, background: color }} />
                            </div>
                            <span className="font-mono text-sm font-bold w-12 text-right" style={{ color }}>{d.score}/{d.total}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── SETTINGS VIEW (task editor) ────────────────────────────────────────
function SettingsView({ onSaved }) {
    const [tasks, setTasks] = useState(null);
    const [newLabel, setNewLabel] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/tracker/tasks").then(r => setTasks(r.data.tasks)).catch(() => setTasks([]));
    }, []);

    const addTask = () => {
        if (!newLabel.trim()) return;
        const id = newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + Date.now().toString(36).slice(-4);
        setTasks(t => [...t, { id, label: newLabel.trim() }]);
        setNewLabel("");
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

    if (!tasks) return <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#39FF14] animate-spin" /></div>;

    return (
        <div className="fade-up">
            <p className="text-white/40 text-sm mb-4">Customize your daily checklist — add, remove, or rename tasks to match your routine.</p>

            <div className="space-y-2 mb-4">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 glass-card p-3">
                        <GripVertical className="w-4 h-4 text-white/20 shrink-0" />
                        <input value={task.label} onChange={(e) => updateLabel(task.id, e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white/90" />
                        <button onClick={() => removeTask(task.id)} className="text-white/30 hover:text-[#FF3B30] transition shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mb-6">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add a new task..."
                    className="flex-1 bg-black/30 border border-[#39FF14]/25 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#39FF14]" />
                <button onClick={addTask} className="px-4 bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 rounded-lg hover:bg-[#39FF14]/25 transition">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <button onClick={save} disabled={saving}
                className="w-full py-3 rounded-xl font-black text-sm text-black uppercase tracking-widest bg-[#39FF14] hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}
