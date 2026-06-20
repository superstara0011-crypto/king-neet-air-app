import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { api, SUBJECT_LABEL } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import {
    Users, BookOpen, BarChart3, Loader2, Plus, Trash2, Pencil,
    Sparkles, X, ShieldAlert, FileText, Shield, Crown, Eye,
    Image, ChevronDown, ChevronUp, Lock, Unlock, Settings,
    Radio, Play, Square, Clock, Calendar, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { getGroups, normalizeChapter } from "@/constants/syllabus";

const EMPTY_Q = {
    subject: "biology", chapter: "", question: "",
    options: ["", "", "", ""], correct: 0, explanation: "",
    is_pyq: false, year: "", image_url: "",
};

const EMPTY_NOTE = {
    subject: "biology", chapter: "", title: "",
    content: "", type: "text", image_url: "",
};

const EMPTY_LIVE_Q = {
    question: "", options: ["", "", "", ""], correct: 0,
    explanation: "", image_url: "", subject: "biology",
};

const EMPTY_LIVE_QUIZ = {
    title: "", description: "", subject: "mixed",
    duration_seconds: 1800, starts_at: "", ends_at: "",
    xp_per_correct: 4, xp_penalty_wrong: 1, questions: [],
};

// Admin roles
const ROLES = {
    super_admin: { label: "Super Admin", color: "#FFD700", icon: <Crown className="w-3 h-3" /> },
    content_admin: { label: "Content Admin", color: "#39FF14", icon: <BookOpen className="w-3 h-3" /> },
    analytics_admin: { label: "Analytics Admin", color: "#00F0FF", icon: <BarChart3 className="w-3 h-3" /> },
    test_admin: { label: "Test Admin", color: "#B900FF", icon: <FileText className="w-3 h-3" /> },
};

export default function Admin() {
    const { user } = useAuth();
    const [tab, setTab] = useState("overview");

    if (!user) return null;
    if (!user.is_admin) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <ShieldAlert className="w-12 h-12 text-[#FF3B30] mx-auto mb-4" />
                <p className="font-heading text-2xl mb-2">Access Denied</p>
                <p className="text-[#A1BBA1]">You don't have admin privileges.</p>
            </div>
        );
    }

    const isSuperAdmin = user.email === "supersara0011@gmail.com" || user.admin_role === "super_admin";

    const allTabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" />, roles: ["all"] },
        { id: "questions", label: "Questions", icon: <BookOpen className="w-4 h-4" />, roles: ["all"] },
        { id: "live_quiz", label: "Live Quiz", icon: <Radio className="w-4 h-4" />, roles: ["all"] },
        { id: "notes", label: "Notes", icon: <FileText className="w-4 h-4" />, roles: ["all"] },
        { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, roles: ["super_admin", "analytics_admin"] },
        { id: "admins", label: "Admin Access", icon: <Shield className="w-4 h-4" />, roles: ["super_admin"] },
    ];

    const visibleTabs = allTabs.filter(t =>
        t.roles.includes("all") ||
        isSuperAdmin ||
        t.roles.includes(user.admin_role)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="fade-up mb-8 flex items-center justify-between">
                <div>
                    <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Control Room</p>
                    <h1 className="font-heading text-4xl sm:text-5xl font-black">
                        Admin <span className="text-[#39FF14] glow-text">Panel</span>
                    </h1>
                </div>
                {isSuperAdmin && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10">
                        <Crown className="w-4 h-4 text-[#FFD700]" />
                        <span className="font-mono text-xs text-[#FFD700] uppercase tracking-widest">Super Admin</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {visibleTabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                            tab === t.id
                                ? "bg-[#39FF14] text-black"
                                : "border border-[#39FF14]/30 text-white/70 hover:text-white hover:border-[#39FF14]/60"
                        }`}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {tab === "overview" && <Overview />}
            {tab === "questions" && <Questions />}
            {tab === "live_quiz" && <LiveQuizTab />}
            {tab === "notes" && <Notes />}
            {tab === "users" && <UsersTab isSuperAdmin={isSuperAdmin} />}
            {tab === "admins" && isSuperAdmin && <AdminAccess />}
        </div>
    );
}

// ─── OVERVIEW ───────────────────────────────────────────────────────
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
        <div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {cards.map((c) => (
                    <div key={c.label} className="glass-card p-5">
                        <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: c.color }}>{c.label}</div>
                        <div className="font-mono text-3xl font-black">{c.value}</div>
                    </div>
                ))}
            </div>
            <h2 className="font-heading text-xl font-bold mb-3 uppercase tracking-wider">Questions by Subject</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {Object.entries(stats.questions_by_subject).map(([s, n]) => (
                    <div key={s} className="glass-card p-5">
                        <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-1">{SUBJECT_LABEL[s] || s}</div>
                        <div className="font-mono text-2xl font-bold text-[#39FF14]">{n}</div>
                    </div>
                ))}
            </div>
            <div className="glass-card p-5">
                <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-3">AI Generation Today</div>
                <div className="flex items-center gap-4">
                    <div>
                        <div className="font-mono text-2xl font-bold text-[#B900FF]">{stats.ai_generated_today}</div>
                        <div className="font-mono text-xs text-white/40">Generated</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div>
                        <div className="font-mono text-2xl font-bold text-[#39FF14]">{stats.ai_daily_remaining}</div>
                        <div className="font-mono text-xs text-white/40">Remaining</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── USERS ──────────────────────────────────────────────────────────
function UsersTab({ isSuperAdmin }) {
    const [users, setUsers] = useState(null);
    const [search, setSearch] = useState("");
    useEffect(() => {
        api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => setUsers([]));
    }, []);
    if (!users) return <Spinner />;

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full mb-4 bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
            />
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                    <thead>
                        <tr className="border-b border-[#39FF14]/15 font-mono text-xs uppercase tracking-widest text-white/40">
                            <th className="text-left px-4 py-3">User</th>
                            <th className="text-left px-4 py-3">Email</th>
                            <th className="text-center px-4 py-3">Level</th>
                            <th className="text-right px-4 py-3">XP</th>
                            <th className="text-right px-4 py-3">Answered</th>
                            <th className="text-right px-4 py-3">Accuracy</th>
                            <th className="text-right px-4 py-3">Streak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <tr key={u.user_id} className="border-b border-white/5 hover:bg-[#39FF14]/5">
                                <td className="px-4 py-3 font-bold">
                                    <div className="flex items-center gap-2">
                                        {u.picture && <img src={u.picture} alt="" className="w-7 h-7 rounded-full" />}
                                        <div>
                                            {u.name} {u.is_admin && <span className="text-[#FFD700] text-xs">★</span>}
                                            <div className="font-mono text-xs text-[#A1BBA1]">@{u.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-white/70 font-mono text-xs">{u.email}</td>
                                <td className="px-4 py-3 text-center"><LevelBadge level={u.level} size="sm" /></td>
                                <td className="px-4 py-3 text-right font-mono text-[#39FF14] font-bold">{u.total_xp}</td>
                                <td className="px-4 py-3 text-right font-mono">{u.questions_answered}</td>
                                <td className="px-4 py-3 text-right font-mono">{u.accuracy}%</td>
                                <td className="px-4 py-3 text-right font-mono text-[#FF007A]">{u.streak}🔥</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── QUESTIONS ──────────────────────────────────────────────────────
function Questions() {
    const [questions, setQuestions] = useState(null);
    const [filter, setFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState(null);   // e.g. "11th" or "physical"
    const [chapterFilter, setChapterFilter] = useState(null);
    const [editing, setEditing] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            const r = await api.get("/admin/questions", { params: filter !== "all" ? { subject: filter } : {} });
            setQuestions(r.data);
        } catch { setQuestions([]); }
    }, [filter]);

    useEffect(() => { load(); }, [load]);
    // Reset deeper filters whenever the subject changes
    useEffect(() => { setGroupFilter(null); setChapterFilter(null); }, [filter]);

    const groups = filter !== "all" ? getGroups(filter) : [];

    const del = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            toast.success("Deleted");
            load();
        } catch { toast.error("Failed to delete"); }
    };

    const filtered = (questions || []).filter(q => {
        const matchesSearch = q.question?.toLowerCase().includes(search.toLowerCase()) ||
            q.chapter?.toLowerCase().includes(search.toLowerCase());
        const matchesChapter = !chapterFilter || normalizeChapter(q.chapter) === normalizeChapter(chapterFilter);
        return matchesSearch && matchesChapter;
    });

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {["all", "biology", "physics", "chemistry"].map((s) => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                                filter === s ? "bg-[#39FF14] text-black" : "border border-[#39FF14]/30 text-white/60 hover:text-white"
                            }`}>{s}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setBulkOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 transition">
                        <Upload className="w-4 h-4" />Bulk Upload
                    </button>
                    <button onClick={() => setAiOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg border border-[#B900FF]/50 text-[#B900FF] hover:bg-[#B900FF]/10 transition">
                        <Sparkles className="w-4 h-4" />AI Generate
                    </button>
                    <button onClick={() => setEditing("new")}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg bg-[#39FF14] text-black hover:opacity-90 transition">
                        <Plus className="w-4 h-4" />Add Question
                    </button>
                </div>
            </div>

            {/* ── Drill-down: Class/Branch (11th, 12th, Physical, etc.) ── */}
            {groups.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                    {groups.map(g => (
                        <button key={g.key}
                            onClick={() => { setGroupFilter(groupFilter === g.key ? null : g.key); setChapterFilter(null); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                                groupFilter === g.key
                                    ? "bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]"
                                    : "border-white/15 text-white/50 hover:border-white/30"
                            }`}>
                            {g.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Drill-down: Chapter list for the selected group ── */}
            {groupFilter && (
                <div className="flex gap-2 flex-wrap mb-4 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-lg border border-white/5">
                    {groups.find(g => g.key === groupFilter)?.chapters.map(ch => (
                        <button key={ch}
                            onClick={() => setChapterFilter(chapterFilter === ch ? null : ch)}
                            className={`px-2.5 py-1 text-[11px] rounded-md border transition ${
                                chapterFilter === ch
                                    ? "bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]"
                                    : "border-white/10 text-white/40 hover:text-white/70"
                            }`}>
                            {ch}
                        </button>
                    ))}
                </div>
            )}

            {chapterFilter && (
                <div className="mb-3 flex items-center gap-2 text-xs text-white/40">
                    Filtering by: <span className="text-[#39FF14] font-bold">{chapterFilter}</span>
                    <button onClick={() => setChapterFilter(null)} className="text-white/30 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
            )}

            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full mb-4 bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]" />

            {!questions ? <Spinner /> : (
                <div className="space-y-3">
                    {filtered.map((q) => (
                        <div key={q.id} className="glass-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border"
                                            style={{ borderColor: q.subject === "biology" ? "#39FF14" : q.subject === "physics" ? "#00F0FF" : "#B900FF",
                                                color: q.subject === "biology" ? "#39FF14" : q.subject === "physics" ? "#00F0FF" : "#B900FF" }}>
                                            {q.subject}
                                        </span>
                                        <span className="text-white/40 font-mono text-xs">{q.chapter}</span>
                                        {q.is_pyq && <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">PYQ {q.year}</span>}
                                        {q.image_url && <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1"><Image className="w-3 h-3" />Image</span>}
                                    </div>
                                    {q.image_url && <img src={q.image_url} alt="Question" className="w-40 h-24 object-cover rounded-lg mb-2 border border-white/10" />}
                                    <p className="text-sm font-medium leading-snug">{q.question}</p>
                                    <div className="mt-2 grid grid-cols-2 gap-1">
                                        {q.options.map((o, i) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded ${i === q.correct ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30" : "text-white/50"}`}>
                                                {String.fromCharCode(65 + i)}. {o}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setEditing(q)} className="text-white/50 hover:text-[#39FF14]"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => del(q.id)} className="text-white/50 hover:text-[#FF3B30]"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-12 text-white/40 font-mono">No questions found</div>}
                </div>
            )}

            {editing && <QuestionModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
            {aiOpen && <AIModal onClose={() => setAiOpen(false)} onDone={() => { setAiOpen(false); load(); }} />}
            {bulkOpen && <BulkUploadModal onClose={() => setBulkOpen(false)} onDone={() => { setBulkOpen(false); load(); }} />}
        </div>
    );
}

// ─── LIVE QUIZ ──────────────────────────────────────────────────────
function formatDuration(totalSeconds) {
    const s = parseInt(totalSeconds) || 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
}

function LiveQuizTab() {
    const [quizzes, setQuizzes] = useState(null);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            const r = await api.get("/admin/live-quiz");
            setQuizzes(r.data);
        } catch { setQuizzes([]); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm("Delete this live quiz? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/live-quiz/${id}`);
            toast.success("Quiz deleted");
            load();
        } catch { toast.error("Failed to delete"); }
    };

    const goLive = async (id) => {
        try {
            await api.post(`/admin/live-quiz/${id}/go-live`);
            toast.success("Quiz is now LIVE 🔴");
            load();
        } catch { toast.error("Failed to go live"); }
    };

    const endQuiz = async (id) => {
        if (!window.confirm("End this quiz now? Students won't be able to attempt it anymore.")) return;
        try {
            await api.post(`/admin/live-quiz/${id}/end`);
            toast.success("Quiz ended");
            load();
        } catch { toast.error("Failed to end quiz"); }
    };

    const filtered = (quizzes || []).filter(q =>
        q.title?.toLowerCase().includes(search.toLowerCase())
    );

    const statusBadge = (status) => {
        const map = {
            live:     { label: "🔴 LIVE",     color: "#39FF14", bg: "rgba(57,255,20,0.12)" },
            upcoming: { label: "⏰ Upcoming", color: "#FFD700", bg: "rgba(255,215,0,0.12)" },
            ended:    { label: "⬛ Ended",     color: "#888",    bg: "rgba(255,255,255,0.06)" },
            draft:    { label: "📝 Draft",     color: "#00F0FF", bg: "rgba(0,240,255,0.12)" },
        };
        const s = map[status] || map.draft;
        return (
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-bold"
                style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}>
                {s.label}
            </span>
        );
    };

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
                <p className="text-white/50 text-sm">Create and schedule live quizzes with your own questions</p>
                <button onClick={() => setEditing("new")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg bg-[#39FF14] text-black hover:opacity-90 transition">
                    <Plus className="w-4 h-4" />New Live Quiz
                </button>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search live quizzes..."
                className="w-full mb-4 bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]" />

            {!quizzes ? <Spinner /> : (
                <div className="space-y-3">
                    {filtered.map((q) => (
                        <div key={q.id} className="glass-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {statusBadge(q.status)}
                                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border"
                                            style={{ borderColor: q.subject === "biology" ? "#39FF14" : q.subject === "physics" ? "#00F0FF" : q.subject === "chemistry" ? "#B900FF" : "#FFD700",
                                                color: q.subject === "biology" ? "#39FF14" : q.subject === "physics" ? "#00F0FF" : q.subject === "chemistry" ? "#B900FF" : "#FFD700" }}>
                                            {q.subject}
                                        </span>
                                        <span className="text-white/40 font-mono text-xs flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />{q.question_count} Qs
                                        </span>
                                        <span className="text-white/40 font-mono text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{formatDuration(q.duration_seconds)}
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-bold text-base mb-1">{q.title}</h3>
                                    {q.description && <p className="text-white/50 text-xs leading-relaxed">{q.description}</p>}
                                    {(q.starts_at || q.ends_at) && (
                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30 font-mono">
                                            <Calendar className="w-3 h-3" />
                                            {q.starts_at && <span>From: {new Date(q.starts_at).toLocaleString()}</span>}
                                            {q.ends_at && <span>To: {new Date(q.ends_at).toLocaleString()}</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 items-end">
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditing(q)} className="text-white/50 hover:text-[#39FF14]" title="Edit"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => del(q.id)} className="text-white/50 hover:text-[#FF3B30]" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    {q.status !== "live" && q.status !== "ended" && (
                                        <button onClick={() => goLive(q.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg bg-[#39FF14] text-black hover:opacity-90 transition">
                                            <Play className="w-3 h-3" />Go Live Now
                                        </button>
                                    )}
                                    {q.status === "live" && (
                                        <button onClick={() => endQuiz(q.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg bg-[#FF3B30] text-white hover:opacity-90 transition">
                                            <Square className="w-3 h-3" />End Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-12 text-white/40 font-mono">No live quizzes yet. Create your first one!</div>}
                </div>
            )}

            {editing && <LiveQuizModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
        </div>
    );
}

function LiveQuizModal({ initial, onClose, onSaved }) {
    const initialSeconds = initial ? (initial.duration_seconds ?? 1800) : 1800;
    const [form, setForm] = useState(initial ? {
        title: initial.title, description: initial.description || "",
        subject: initial.subject, duration_seconds: initialSeconds,
        starts_at: initial.starts_at ? initial.starts_at.slice(0, 16) : "",
        ends_at: initial.ends_at ? initial.ends_at.slice(0, 16) : "",
        xp_per_correct: initial.xp_per_correct ?? 4,
        xp_penalty_wrong: initial.xp_penalty_wrong ?? 1,
        questions: initial.questions || [],
    } : { ...EMPTY_LIVE_QUIZ });
    // Separate min/sec inputs for a friendlier UI — kept in sync with form.duration_seconds
    const [durMin, setDurMin] = useState(Math.floor(initialSeconds / 60));
    const [durSec, setDurSec] = useState(initialSeconds % 60);
    const [saving, setSaving] = useState(false);
    const [qDraft, setQDraft] = useState({ ...EMPTY_LIVE_Q });
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);
    const bulkFileRef = React.useRef(null);

    // Keep form.duration_seconds in sync whenever minutes/seconds inputs change
    useEffect(() => {
        const mins = parseInt(durMin) || 0;
        const secs = parseInt(durSec) || 0;
        setForm(f => ({ ...f, duration_seconds: mins * 60 + secs }));
    }, [durMin, durSec]);
    const [editingQIdx, setEditingQIdx] = useState(null);
    const [uploadingQImg, setUploadingQImg] = useState(false);
    const qImgRef = React.useRef(null);

    const handleQImgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image 5MB se kam honi chahiye"); return; }
        setUploadingQImg(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await api.post("/admin/notes/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setQDraft(q => ({ ...q, image_url: r.data.url }));
            toast.success("Image uploaded!");
        } catch { toast.error("Image upload fail hua"); }
        finally {
            setUploadingQImg(false);
            if (qImgRef.current) qImgRef.current.value = "";
        }
    };

    const setOpt = (i, v) => {
        const opts = [...qDraft.options];
        opts[i] = v;
        setQDraft({ ...qDraft, options: opts });
    };

    const addOrUpdateQuestion = () => {
        if (!qDraft.question.trim() || qDraft.options.some(o => !o.trim())) {
            toast.error("Fill question and all 4 options");
            return;
        }
        const qs = [...form.questions];
        if (editingQIdx !== null) {
            qs[editingQIdx] = qDraft;
        } else {
            qs.push(qDraft);
        }
        setForm({ ...form, questions: qs });
        setQDraft({ ...EMPTY_LIVE_Q });
        setEditingQIdx(null);
    };

    const editQuestion = (i) => {
        setQDraft(form.questions[i]);
        setEditingQIdx(i);
    };

    const removeQuestion = (i) => {
        setForm({ ...form, questions: form.questions.filter((_, idx) => idx !== i) });
        if (editingQIdx === i) { setQDraft({ ...EMPTY_LIVE_Q }); setEditingQIdx(null); }
    };

    const save = async () => {
        if (!form.title.trim()) { toast.error("Title is required"); return; }
        if (form.questions.length === 0) { toast.error("Add at least one question"); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
                ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
                duration_seconds: parseInt(form.duration_seconds) || 0,
                xp_per_correct: parseInt(form.xp_per_correct),
                xp_penalty_wrong: parseInt(form.xp_penalty_wrong),
            };
            if (initial) await api.put(`/admin/live-quiz/${initial.id}`, payload);
            else await api.post("/admin/live-quiz", payload);
            toast.success(initial ? "Quiz updated" : "Quiz created");
            onSaved();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to save");
        } finally { setSaving(false); }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!initial?.id) {
            toast.error("Save the quiz first, then reopen it to bulk upload questions");
            if (bulkFileRef.current) bulkFileRef.current.value = "";
            return;
        }
        setBulkUploading(true);
        setBulkResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await api.post(`/admin/live-quiz/${initial.id}/bulk-upload`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setBulkResult(r.data);
            if (r.data.inserted > 0) {
                toast.success(`${r.data.inserted} questions added!`);
                // Refetch this quiz so the visible question list includes the new ones
                try {
                    const refreshed = await api.get("/admin/live-quiz");
                    const updated = refreshed.data.find(q => q.id === initial.id);
                    if (updated) setForm(f => ({ ...f, questions: updated.questions || f.questions }));
                } catch { /* non-fatal — list will still refresh once modal closes */ }
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || "Bulk upload failed");
        } finally {
            setBulkUploading(false);
            if (bulkFileRef.current) bulkFileRef.current.value = "";
        }
    };

    return (
        <Modal title={initial ? "Edit Live Quiz" : "Create Live Quiz"} onClose={onClose}>
            <div className="space-y-4">
                <Field label="Quiz Title">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Sunday Mega Test" />
                </Field>
                <Field label="Description (optional)">
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Subject">
                        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls}>
                            <option value="mixed">Mixed</option>
                            <option value="biology">Biology</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </Field>
                    <Field label="Duration (Min : Sec)">
                        <div className="flex items-center gap-2">
                            <input type="number" min={0} value={durMin}
                                onChange={(e) => setDurMin(e.target.value)}
                                placeholder="Min" className={inputCls} />
                            <span className="text-white/40 font-bold">:</span>
                            <input type="number" min={0} max={59} value={durSec}
                                onChange={(e) => setDurSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                placeholder="Sec" className={inputCls} />
                        </div>
                        <p className="text-[10px] text-white/30 mt-1">
                            Total: {formatDuration(form.duration_seconds)} — use 0 min for quick-fire rounds (e.g. 15s)
                        </p>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Starts At (optional — leave blank + use 'Go Live Now' instead)">
                        <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Ends At (optional — leave blank = open until manually ended)">
                        <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={inputCls} />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="XP per correct answer">
                        <input type="number" min={1} value={form.xp_per_correct} onChange={(e) => setForm({ ...form, xp_per_correct: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="XP penalty for wrong answer">
                        <input type="number" min={0} value={form.xp_penalty_wrong} onChange={(e) => setForm({ ...form, xp_penalty_wrong: e.target.value })} className={inputCls} />
                    </Field>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <div className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-3">
                        Questions ({form.questions.length})
                    </div>

                    {/* ── Bulk Upload (only works once quiz is saved at least once) ── */}
                    <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-xs font-bold text-[#00F0FF]">📤 Bulk Upload Questions</span>
                            {!initial?.id && (
                                <span className="text-[10px] text-[#FFD700]">Save quiz first →</span>
                            )}
                        </div>
                        <input
                            ref={bulkFileRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleBulkUpload}
                            disabled={bulkUploading || !initial?.id}
                            className={`${inputCls} cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#00F0FF]/20 file:text-[#00F0FF] file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-[#00F0FF]/30 disabled:opacity-40`}
                        />
                        <p className="text-[10px] text-white/30 mt-1.5">
                            Same format as Questions tab: subject, chapter, question, option_a-d, correct_answer (A/B/C/D), explanation, image_url
                        </p>
                        {bulkUploading && <div className="flex items-center gap-2 mt-2 text-xs text-[#00F0FF]"><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</div>}
                        {bulkResult && (
                            <div className="mt-2 text-xs">
                                <span className="text-[#39FF14] font-bold">✓ {bulkResult.inserted} added</span>
                                {bulkResult.skipped_count > 0 && <span className="text-[#FF3B30] ml-2">· {bulkResult.skipped_count} skipped</span>}
                            </div>
                        )}
                    </div>

                    {/* Existing questions list */}
                    {form.questions.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {form.questions.map((q, i) => (
                                <div key={i} className="flex items-start justify-between gap-2 bg-black/30 rounded-lg p-3 border border-white/10">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{i + 1}. {q.question}</p>
                                        <p className="text-[10px] text-[#39FF14] mt-0.5">✓ {q.options[q.correct]}</p>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                        <button onClick={() => editQuestion(i)} className="text-white/50 hover:text-[#39FF14]"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => removeQuestion(i)} className="text-white/50 hover:text-[#FF3B30]"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Question builder */}
                    <div className="bg-black/20 rounded-lg p-4 border border-[#39FF14]/15 space-y-3">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                            {editingQIdx !== null ? `Editing Question ${editingQIdx + 1}` : "Add a Question"}
                        </div>
                        <Field label="Question">
                            <textarea value={qDraft.question} onChange={(e) => setQDraft({ ...qDraft, question: e.target.value })} rows={2} className={inputCls} />
                        </Field>
                        <Field label="Subject (for this question)">
                            <select value={qDraft.subject} onChange={(e) => setQDraft({ ...qDraft, subject: e.target.value })} className={inputCls}>
                                <option value="biology">Biology</option>
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                            </select>
                        </Field>
                        {qDraft.options.map((o, i) => (
                            <Field key={i} label={`Option ${String.fromCharCode(65 + i)}`}>
                                <div className="flex items-center gap-2">
                                    <input type="radio" name="qcorrect" checked={qDraft.correct === i} onChange={() => setQDraft({ ...qDraft, correct: i })} className="accent-[#39FF14]" />
                                    <input value={o} onChange={(e) => setOpt(i, e.target.value)} className={inputCls} />
                                </div>
                            </Field>
                        ))}
                        <Field label="Explanation (optional)">
                            <textarea value={qDraft.explanation} onChange={(e) => setQDraft({ ...qDraft, explanation: e.target.value })} rows={2} className={inputCls} />
                        </Field>
                        <Field label="Diagram/Image (optional)">
                            <input ref={qImgRef} type="file" accept="image/*"
                                onChange={handleQImgUpload} disabled={uploadingQImg}
                                className={`${inputCls} cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#00F0FF]/20 file:text-[#00F0FF] file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-[#00F0FF]/30`}
                            />
                            {uploadingQImg && <div className="flex items-center gap-2 mt-2 text-xs text-[#00F0FF]"><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</div>}
                            {qDraft.image_url && (
                                <div className="relative mt-2">
                                    <img src={qDraft.image_url} alt="preview" className="w-full h-28 object-contain rounded-lg border border-white/10 bg-black/20" />
                                    <button onClick={() => setQDraft(q => ({ ...q, image_url: "" }))}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition">
                                        <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            )}
                        </Field>
                        <div className="flex gap-2">
                            <button onClick={addOrUpdateQuestion}
                                className="flex-1 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-bold uppercase tracking-widest text-xs py-2.5 rounded-lg hover:bg-[#00F0FF]/30 transition">
                                {editingQIdx !== null ? "Update Question" : "+ Add Question to Quiz"}
                            </button>
                            {editingQIdx !== null && (
                                <button onClick={() => { setQDraft({ ...EMPTY_LIVE_Q }); setEditingQIdx(null); }}
                                    className="px-4 bg-white/5 text-white/60 border border-white/10 font-bold uppercase tracking-widest text-xs py-2.5 rounded-lg hover:bg-white/10 transition">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={save} disabled={saving}
                    className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition">
                    {saving ? "Saving..." : initial ? "Update Live Quiz" : "Create Live Quiz"}
                </button>
            </div>
        </Modal>
    );
}

// ─── NOTES ──────────────────────────────────────────────────────────
function Notes() {
    const [notes, setNotes] = useState(null);
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            const params = filter !== "all" ? { subject: filter } : {};
            const r = await api.get("/admin/notes", { params });
            setNotes(r.data);
        } catch { setNotes([]); }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm("Delete this note?")) return;
        try {
            await api.delete(`/admin/notes/${id}`);
            toast.success("Note deleted");
            load();
        } catch { toast.error("Failed to delete"); }
    };

    const filtered = (notes || []).filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.chapter?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {["all", "biology", "physics", "chemistry"].map((s) => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                                filter === s ? "bg-[#39FF14] text-black" : "border border-[#39FF14]/30 text-white/60 hover:text-white"
                            }`}>{s}</button>
                    ))}
                </div>
                <button onClick={() => setEditing("new")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg bg-[#39FF14] text-black hover:opacity-90 transition">
                    <Plus className="w-4 h-4" />Add Note
                </button>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full mb-4 bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]" />

            {!notes ? <Spinner /> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((n) => (
                        <div key={n.id} className="glass-card p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border"
                                        style={{ borderColor: n.subject === "biology" ? "#39FF14" : n.subject === "physics" ? "#00F0FF" : "#B900FF",
                                            color: n.subject === "biology" ? "#39FF14" : n.subject === "physics" ? "#00F0FF" : "#B900FF" }}>
                                        {n.subject}
                                    </span>
                                    <span className="ml-2 text-white/40 font-mono text-xs">{n.chapter}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditing(n)} className="text-white/50 hover:text-[#39FF14]"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => del(n.id)} className="text-white/50 hover:text-[#FF3B30]"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {n.image_url && <img src={n.image_url} alt="Note" className="w-full h-32 object-cover rounded-lg mb-3 border border-white/10" />}
                            <h3 className="font-heading font-bold text-base mb-1">{n.title}</h3>
                            <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{n.content}</p>
                            <div className="mt-2 font-mono text-[10px] text-white/30 uppercase">{n.type} note</div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-white/40 font-mono">No notes found. Add your first note!</div>}
                </div>
            )}

            {editing && <NoteModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
        </div>
    );
}

// ─── ADMIN ACCESS ───────────────────────────────────────────────────
function AdminAccess() {
    const [admins, setAdmins] = useState(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("content_admin");
    const [adding, setAdding] = useState(false);

    const load = async () => {
        try {
            const r = await api.get("/admin/admin-users");
            setAdmins(r.data);
        } catch { setAdmins([]); }
    };

    useEffect(() => { load(); }, []);

    const addAdmin = async () => {
        if (!email.trim()) { toast.error("Enter email"); return; }
        setAdding(true);
        try {
            await api.post("/admin/admin-users", { email, role });
            toast.success("Admin added!");
            setEmail("");
            load();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to add admin");
        } finally { setAdding(false); }
    };

    const removeAdmin = async (userId) => {
        if (!window.confirm("Remove admin access?")) return;
        try {
            await api.delete(`/admin/admin-users/${userId}`);
            toast.success("Admin removed");
            load();
        } catch { toast.error("Failed to remove"); }
    };

    return (
        <div>
            <div className="glass-card p-6 mb-6">
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#39FF14]" /> Add New Admin
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                    <input value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]" />
                    <select value={role} onChange={e => setRole(e.target.value)}
                        className="bg-black/40 border border-[#39FF14]/25 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14]">
                        <option value="content_admin">Content Admin — Add questions & notes</option>
                        <option value="analytics_admin">Analytics Admin — View stats & users</option>
                        <option value="test_admin">Test Admin — Manage tests</option>
                    </select>
                    <button onClick={addAdmin} disabled={adding}
                        className="bg-[#39FF14] text-black font-bold uppercase tracking-widest rounded-lg py-2 text-xs hover:opacity-90 transition">
                        {adding ? "Adding..." : "Add Admin"}
                    </button>
                </div>
            </div>

            <h2 className="font-heading text-xl font-bold mb-4">Current Admins</h2>
            {!admins ? <Spinner /> : (
                <div className="space-y-3">
                    {admins.map((a) => (
                        <div key={a.user_id} className="glass-card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {a.picture && <img src={a.picture} alt="" className="w-9 h-9 rounded-full" />}
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {a.name}
                                        {a.admin_role === "super_admin" && <Crown className="w-4 h-4 text-[#FFD700]" />}
                                    </div>
                                    <div className="text-white/50 text-xs font-mono">{a.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs px-3 py-1 rounded-full border"
                                    style={{
                                        borderColor: ROLES[a.admin_role]?.color || "#39FF14",
                                        color: ROLES[a.admin_role]?.color || "#39FF14",
                                        background: (ROLES[a.admin_role]?.color || "#39FF14") + "15",
                                    }}>
                                    {ROLES[a.admin_role]?.label || a.admin_role}
                                </span>
                                {a.admin_role !== "super_admin" && (
                                    <button onClick={() => removeAdmin(a.user_id)}
                                        className="text-white/40 hover:text-[#FF3B30] transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 glass-card p-5">
                <h3 className="font-heading font-bold mb-4">Role Permissions</h3>
                <div className="space-y-3">
                    {Object.entries(ROLES).map(([key, r]) => (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-white/5">
                            <span style={{ color: r.color }}>{r.icon}</span>
                            <div>
                                <div className="font-bold text-sm" style={{ color: r.color }}>{r.label}</div>
                                <div className="text-white/40 text-xs">
                                    {key === "super_admin" && "Full access — all features, all data, add/remove admins"}
                                    {key === "content_admin" && "Add, edit, delete questions and notes"}
                                    {key === "analytics_admin" && "View stats, user data, and analytics only"}
                                    {key === "test_admin" && "Create and manage test series and paid plans"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── MODALS ─────────────────────────────────────────────────────────
function QuestionModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial ? {
        subject: initial.subject, chapter: initial.chapter, question: initial.question,
        options: [...initial.options], correct: initial.correct,
        explanation: initial.explanation || "", is_pyq: initial.is_pyq,
        year: initial.year || "", image_url: initial.image_url || "",
    } : { ...EMPTY_Q, options: ["", "", "", ""] });
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const imgInputRef = React.useRef(null);

    const [qGroup, setQGroup] = useState(() => {
        if (!initial?.chapter) return null;
        const g = getGroups(initial.subject).find(gr => gr.chapters.includes(initial.chapter));
        return g ? g.key : null;
    });

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
        } finally { setSaving(false); }
    };

    const setOpt = (i, v) => setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? v : o)) }));

    const handleImgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image under 5MB honi chahiye"); return; }
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await api.post("/admin/notes/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setForm(f => ({ ...f, image_url: r.data.url }));
            toast.success("Image uploaded!");
        } catch (e) {
            toast.error("Image upload fail hua");
        } finally {
            setUploadingImg(false);
            if (imgInputRef.current) imgInputRef.current.value = "";
        }
    };

    return (
        <Modal title={initial ? "Edit Question" : "Add Question"} onClose={onClose}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Subject">
                        <select value={form.subject} onChange={(e) => { setForm({ ...form, subject: e.target.value, chapter: "" }); setQGroup(null); }} className={inputCls}>
                            <option value="biology">Biology</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </Field>
                    <Field label="Class / Branch">
                        <select value={qGroup || ""} onChange={(e) => { setQGroup(e.target.value); setForm({ ...form, chapter: "" }); }} className={inputCls}>
                            <option value="">Select...</option>
                            {getGroups(form.subject).map(g => (
                                <option key={g.key} value={g.key}>{g.label}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Chapter">
                        <select value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} className={inputCls} disabled={!qGroup}>
                            <option value="">Select...</option>
                            {qGroup && getGroups(form.subject).find(g => g.key === qGroup)?.chapters.map(ch => (
                                <option key={ch} value={ch}>{ch}</option>
                            ))}
                        </select>
                    </Field>
                </div>
                <Field label="Question Text">
                    <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={2} className={inputCls} />
                </Field>
                <Field label="Diagram/Image (optional)">
                    <input ref={imgInputRef} type="file" accept="image/*"
                        onChange={handleImgUpload} disabled={uploadingImg}
                        className={`${inputCls} cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#00F0FF]/20 file:text-[#00F0FF] file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-[#00F0FF]/30`}
                    />
                    {uploadingImg && <div className="flex items-center gap-2 mt-2 text-xs text-[#00F0FF]"><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</div>}
                    {form.image_url && (
                        <div className="relative mt-2">
                            <img src={form.image_url} alt="preview" className="w-full h-36 object-contain rounded-lg border border-white/10 bg-black/20" />
                            <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition">
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>
                    )}
                </Field>
                {form.options.map((o, i) => (
                    <Field key={i} label={`Option ${String.fromCharCode(65+i)}${form.correct === i ? " ✓ Correct" : ""}`}>
                        <div className="flex items-center gap-2">
                            <input type="radio" name="correct" checked={form.correct === i} onChange={() => setForm({ ...form, correct: i })} className="accent-[#39FF14]" />
                            <input value={o} onChange={(e) => setOpt(i, e.target.value)} className={inputCls} />
                        </div>
                    </Field>
                ))}
                <Field label="Explanation">
                    <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3 items-end">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.is_pyq} onChange={(e) => setForm({ ...form, is_pyq: e.target.checked })} className="accent-[#39FF14]" />
                        Mark as PYQ
                    </label>
                    <Field label="Year (optional)">
                        <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} />
                    </Field>
                </div>
                <button onClick={save} disabled={saving}
                    className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition">
                    {saving ? "Saving..." : initial ? "Update Question" : "Add Question"}
                </button>
            </div>
        </Modal>
    );
}

function NoteModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial ? {
        subject: initial.subject, chapter: initial.chapter, title: initial.title,
        content: initial.content || "", type: initial.type || "text", image_url: initial.image_url || "",
        file_url: initial.file_url || "", file_name: initial.file_name || "",
    } : { ...EMPTY_NOTE, file_url: "", file_name: "" });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const save = async () => {
        if (!form.title.trim() || !form.chapter.trim()) {
            toast.error("Fill title and chapter");
            return;
        }
        setSaving(true);
        try {
            if (initial) await api.put(`/admin/notes/${initial.id}`, form);
            else await api.post("/admin/notes", form);
            toast.success(initial ? "Note updated" : "Note added");
            onSaved();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to save");
        } finally { setSaving(false); }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File must be under 10MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const r = await api.post("/admin/notes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (r.data.is_pdf) {
                setForm(f => ({ ...f, file_url: r.data.url, file_name: r.data.file_name }));
                toast.success("PDF uploaded!");
            } else {
                setForm(f => ({ ...f, image_url: r.data.url }));
                toast.success("Image uploaded!");
            }
        } catch (e) {
            toast.error(e.response?.data?.detail || "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <Modal title={initial ? "Edit Note" : "Add Note"} onClose={onClose}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Subject">
                        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls}>
                            <option value="biology">Biology</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </Field>
                    <Field label="Chapter">
                        <input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} className={inputCls} />
                    </Field>
                </div>
                <Field label="Note Type">
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                        <option value="text">Text Note</option>
                        <option value="mindmap">Mind Map</option>
                        <option value="diagram">Diagram</option>
                        <option value="formula">Formula Sheet</option>
                        <option value="ncert">NCERT Line-by-Line</option>
                    </select>
                </Field>
                <Field label="Title">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Content">
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className={inputCls} placeholder="Write note content here..." />
                </Field>

                {/* ── File Upload (Image or PDF) ── */}
                <Field label="Attach Image or PDF (optional)">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className={`${inputCls} cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:text-[#39FF14] file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-[#39FF14]/30`}
                    />
                    {uploading && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#39FF14]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...
                        </div>
                    )}
                    {form.image_url && (
                        <div className="mt-2 relative">
                            <img src={form.image_url} alt="preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                            <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition">
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>
                    )}
                    {form.file_url && (
                        <div className="mt-2 flex items-center gap-2 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg p-2.5">
                            <FileText className="w-4 h-4 text-[#FF3B30] shrink-0" />
                            <span className="text-xs text-white/70 flex-1 truncate">{form.file_name || "PDF attached"}</span>
                            <button onClick={() => setForm(f => ({ ...f, file_url: "", file_name: "" }))}>
                                <X className="w-3.5 h-3.5 text-white/50 hover:text-red-400" />
                            </button>
                        </div>
                    )}
                </Field>

                <button onClick={save} disabled={saving}
                    className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition">
                    {saving ? "Saving..." : initial ? "Update Note" : "Add Note"}
                </button>
            </div>
        </Modal>
    );
}

function BulkUploadModal({ onClose, onDone }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async () => {
        if (!file) { toast.error("Select a CSV or Excel file first"); return; }
        setUploading(true);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const r = await api.post("/admin/questions/bulk-upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(r.data);
            if (r.data.inserted > 0) {
                toast.success(`${r.data.inserted} questions added!`);
            }
        } catch (e) {
            toast.error(e.response?.data?.detail || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal title="Bulk Upload Questions" onClose={onClose}>
            <div className="space-y-4">
                <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-lg p-4">
                    <p className="text-xs text-white/60 leading-relaxed">
                        Upload a CSV or Excel file with multiple questions at once. Required columns:
                    </p>
                    <p className="text-[11px] font-mono text-[#00F0FF] mt-2 break-words">
                        subject, chapter, question, option_a, option_b, option_c, option_d, correct_answer
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                        Optional columns: explanation, is_pyq (yes/no), year, image_url
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                        correct_answer should be A, B, C, or D
                    </p>
                </div>

                <Field label="Select CSV or Excel File">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={uploading}
                        className={`${inputCls} cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#00F0FF]/20 file:text-[#00F0FF] file:text-xs file:font-bold file:uppercase file:cursor-pointer hover:file:bg-[#00F0FF]/30`}
                    />
                </Field>

                {result && (
                    <div className="space-y-2">
                        <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-[#39FF14] font-bold text-sm">✓ {result.inserted} questions added successfully</span>
                        </div>
                        {result.skipped_count > 0 && (
                            <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg p-3">
                                <p className="text-[#FF3B30] font-bold text-xs mb-2">{result.skipped_count} rows skipped:</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {result.skipped.map((s, i) => (
                                        <p key={i} className="text-[11px] text-white/50">Row {s.row}: {s.reason}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={handleUpload} disabled={uploading || !file}
                    className="w-full bg-[#00F0FF] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition disabled:opacity-40">
                    {uploading ? "Uploading..." : "Upload Questions"}
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
        } finally { setLoading(false); }
    };
    return (
        <Modal title="AI Generate Questions" onClose={onClose}>
            <div className="space-y-4">
                <Field label="Subject">
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
                        <option value="biology">Biology</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                    </select>
                </Field>
                <Field label="Number of questions (1-20)">
                    <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(e.target.value)} className={inputCls} />
                </Field>
                <button onClick={generate} disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#B900FF] text-white font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? "Generating..." : "Generate with AI"}
                </button>
            </div>
        </Modal>
    );
}

// ─── HELPERS ────────────────────────────────────────────────────────
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
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
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
