import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { api, SUBJECT_LABEL } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import {
    Users, BookOpen, BarChart3, Loader2, Plus, Trash2, Pencil,
    Sparkles, X, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_Q = {
    subject: "biology", chapter: "", question: "",
    options: ["", "", "", ""], correct: 0, explanation: "", is_pyq: false, year: "",
};

export default function Admin() {
    const { user } = useAuth();
    const [tab, setTab] = useState("overview");

    if (!user) return null;
    if (!user.is_admin) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center" data-testid="admin-denied">
                <ShieldAlert className="w-12 h-12 text-[#FF3B30] mx-auto mb-4" />
                <p className="font-heading text-2xl mb-2">Access denied</p>
                <p className="text-[#A1BBA1]">You don't have admin privileges.</p>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
        { id: "questions", label: "Questions", icon: <BookOpen className="w-4 h-4" /> },
        { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="fade-up mb-8">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Control Room</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black">
                    Admin <span className="text-[#39FF14] glow-text">Panel</span>
                </h1>
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                            tab === t.id
                                ? "bg-[#39FF14] text-black"
                                : "border border-[#39FF14]/30 text-white/70 hover:text-white hover:border-[#39FF14]/60"
                        }`}
                        data-testid={`admin-tab-${t.id}`}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {tab === "overview" && <Overview />}
            {tab === "questions" && <Questions />}
            {tab === "users" && <UsersTab />}
        </div>
    );
}

function Overview() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => setStats(null));
    }, []);
    if (!stats) return <Spinner />;
    const cards = [
        { label: "Total Users", value: stats.total_users, color: "#39FF14" },
        { label: "Total Questions", value: stats.total_questions, color: "#00F0FF" },
        { label: "PYQs", value: stats.total_pyq, color: "#FFD700" },
        { label: "AI Generated", value: stats.total_ai, color: "#B900FF" },
        { label: "Quiz Attempts", value: stats.total_attempts, color: "#FF007A" },
    ];
    return (
        <div data-testid="admin-overview">
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {cards.map((c) => (
                    <div key={c.label} className="glass-card p-5" data-testid={`stat-${c.label.toLowerCase().replace(/ /g, "-")}`}>
                        <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: c.color }}>{c.label}</div>
                        <div className="font-mono text-3xl font-black">{c.value}</div>
                    </div>
                ))}
            </div>
            <h2 className="font-heading text-xl font-bold mb-3 uppercase tracking-wider">Questions by Subject</h2>
            <div className="grid sm:grid-cols-3 gap-4">
                {Object.entries(stats.questions_by_subject).map(([s, n]) => (
                    <div key={s} className="glass-card p-5">
                        <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-1">{SUBJECT_LABEL[s] || s}</div>
                        <div className="font-mono text-2xl font-bold text-[#39FF14]">{n}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState(null);
    useEffect(() => {
        api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => setUsers([]));
    }, []);
    if (!users) return <Spinner />;
    return (
        <div className="glass-card overflow-x-auto" data-testid="admin-users">
            <table className="w-full text-sm min-w-[800px]">
                <thead>
                    <tr className="border-b border-[#39FF14]/15 font-mono text-xs uppercase tracking-widest text-white/40">
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3">Email</th>
                        <th className="text-center px-4 py-3">Level</th>
                        <th className="text-right px-4 py-3">XP</th>
                        <th className="text-right px-4 py-3">Answered</th>
                        <th className="text-right px-4 py-3">Accuracy</th>
                        <th className="text-right px-4 py-3">Attempts</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.user_id} className="border-b border-white/5 hover:bg-[#39FF14]/5" data-testid={`admin-user-row`}>
                            <td className="px-4 py-3 font-bold">
                                {u.name} {u.is_admin && <span className="text-[#FFD700] text-xs">★</span>}
                                <div className="font-mono text-xs text-[#A1BBA1]">@{u.username}</div>
                            </td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">{u.email}</td>
                            <td className="px-4 py-3 text-center"><LevelBadge level={u.level} size="sm" /></td>
                            <td className="px-4 py-3 text-right font-mono text-[#39FF14] font-bold">{u.total_xp}</td>
                            <td className="px-4 py-3 text-right font-mono">{u.questions_answered}</td>
                            <td className="px-4 py-3 text-right font-mono">{u.accuracy}%</td>
                            <td className="px-4 py-3 text-right font-mono">{u.attempts}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Questions() {
    const [questions, setQuestions] = useState(null);
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState(null); // question object or "new"
    const [aiOpen, setAiOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const r = await api.get("/admin/questions", { params: filter !== "all" ? { subject: filter } : {} });
            setQuestions(r.data);
        } catch {
            setQuestions([]);
        }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            toast.success("Question deleted");
            load();
        } catch {
            toast.error("Failed to delete");
        }
    };

    if (!questions) return <Spinner />;

    return (
        <div data-testid="admin-questions">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                    {["all", "biology", "physics", "chemistry"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                                filter === s ? "bg-[#39FF14] text-black" : "border border-[#39FF14]/30 text-white/70 hover:text-white"
                            }`}
                            data-testid={`admin-q-filter-${s}`}
                        >
                            {s === "all" ? "All" : SUBJECT_LABEL[s]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg border border-[#B900FF]/40 text-[#B900FF] hover:bg-[#B900FF]/10 transition" data-testid="admin-ai-generate-btn">
                        <Sparkles className="w-4 h-4" /> AI Generate
                    </button>
                    <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg bg-[#39FF14] text-black hover:opacity-90 transition" data-testid="admin-add-question-btn">
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>
            </div>

            <p className="font-mono text-xs text-white/40 mb-3" data-testid="admin-q-count">{questions.length} questions</p>

            <div className="space-y-3">
                {questions.map((q) => (
                    <div key={q.id} className="glass-card p-4" data-testid="admin-question-card">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">{SUBJECT_LABEL[q.subject] || q.subject}</span>
                                    <span className="font-mono text-[10px] text-white/40">{q.chapter}</span>
                                    {q.is_pyq && <span className="font-mono text-[10px] text-[#FFD700]">PYQ {q.year || ""}</span>}
                                    <span className="font-mono text-[10px] text-white/30">[{q.source}]</span>
                                </div>
                                <p className="font-medium">{q.question}</p>
                                <div className="grid sm:grid-cols-2 gap-1 mt-2">
                                    {q.options.map((o, i) => (
                                        <span key={i} className={`text-xs font-mono ${i === q.correct ? "text-[#39FF14]" : "text-white/50"}`}>
                                            {i === q.correct ? "✓ " : "• "}{o}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setEditing(q)} className="text-white/50 hover:text-[#00F0FF]" data-testid="admin-edit-q-btn"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => del(q.id)} className="text-white/50 hover:text-[#FF3B30]" data-testid="admin-delete-q-btn"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editing && <QuestionModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
            {aiOpen && <AIModal onClose={() => setAiOpen(false)} onDone={() => { setAiOpen(false); load(); }} />}
        </div>
    );
}

function QuestionModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial ? {
        subject: initial.subject, chapter: initial.chapter, question: initial.question,
        options: [...initial.options], correct: initial.correct, explanation: initial.explanation || "",
        is_pyq: initial.is_pyq, year: initial.year || "",
    } : { ...EMPTY_Q, options: ["", "", "", ""] });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!form.question.trim() || form.options.some((o) => !o.trim()) || !form.chapter.trim()) {
            toast.error("Fill question, chapter and all 4 options");
            return;
        }
        setSaving(true);
        const payload = { ...form, year: form.year ? parseInt(form.year) : null };
        try {
            if (initial) await api.put(`/admin/questions/${initial.id}`, payload);
            else await api.post("/admin/questions", payload);
            toast.success(initial ? "Question updated" : "Question added");
            onSaved();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const setOpt = (i, v) => setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? v : o)) }));

    return (
        <Modal title={initial ? "Edit Question" : "Add Question"} onClose={onClose}>
            <div className="space-y-4" data-testid="admin-question-modal">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Subject">
                        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} data-testid="q-subject-select">
                            <option value="biology">Biology</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </Field>
                    <Field label="Chapter">
                        <input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} className={inputCls} data-testid="q-chapter-input" />
                    </Field>
                </div>
                <Field label="Question">
                    <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={2} className={inputCls} data-testid="q-question-input" />
                </Field>
                {form.options.map((o, i) => (
                    <Field key={i} label={`Option ${i + 1}${form.correct === i ? " (correct)" : ""}`}>
                        <div className="flex items-center gap-2">
                            <input type="radio" name="correct" checked={form.correct === i} onChange={() => setForm({ ...form, correct: i })} className="accent-[#39FF14]" data-testid={`q-correct-${i}`} />
                            <input value={o} onChange={(e) => setOpt(i, e.target.value)} className={inputCls} data-testid={`q-option-${i}`} />
                        </div>
                    </Field>
                ))}
                <Field label="Explanation">
                    <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} className={inputCls} data-testid="q-explanation-input" />
                </Field>
                <div className="grid grid-cols-2 gap-3 items-end">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.is_pyq} onChange={(e) => setForm({ ...form, is_pyq: e.target.checked })} className="accent-[#39FF14]" data-testid="q-pyq-checkbox" />
                        Mark as PYQ
                    </label>
                    <Field label="Year (optional)">
                        <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} data-testid="q-year-input" />
                    </Field>
                </div>
                <button onClick={save} disabled={saving} className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition" data-testid="q-save-btn">
                    {saving ? "Saving..." : initial ? "Update Question" : "Add Question"}
                </button>
            </div>
        </Modal>
    );
}

function AIModal({ onClose, onDone }) {
    const [subject, setSubject] = useState("biology");
    const [count, setCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const generate = async () => {
        setLoading(true);
        try {
            const r = await api.post("/admin/questions/ai-generate", { subject, count: parseInt(count) });
            toast.success(`Generated ${r.data.generated} questions`);
            onDone();
        } catch (e) {
            toast.error(e.response?.data?.detail || "AI generation failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal title="AI Generate Questions" onClose={onClose}>
            <div className="space-y-4" data-testid="admin-ai-modal">
                <Field label="Subject">
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} data-testid="ai-subject-select">
                        <option value="biology">Biology</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                    </select>
                </Field>
                <Field label="Number of questions (1-20)">
                    <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(e.target.value)} className={inputCls} data-testid="ai-count-input" />
                </Field>
                <button onClick={generate} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-[#B900FF] text-white font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition" data-testid="ai-generate-confirm-btn">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? "Generating..." : "Generate"}
                </button>
            </div>
        </Modal>
    );
}

const inputCls = "w-full bg-black/40 border border-[#39FF14]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]";

function Field({ label, children }) {
    return (
        <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1 block">{label}</label>
            {children}
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white" data-testid="modal-close-btn"><X className="w-5 h-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
        </div>
    );
}
