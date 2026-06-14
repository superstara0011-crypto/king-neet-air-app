import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { api, SUBJECT_LABEL } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import {
    Users, BookOpen, BarChart3, Loader2, Plus, Trash2, Pencil,
    Sparkles, X, ShieldAlert, FileText, Shield, Crown, Eye,
    Image, ChevronDown, ChevronUp, Lock, Unlock, Settings,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_Q = {
    subject: "biology", chapter: "", question: "",
    options: ["", "", "", ""], correct: 0, explanation: "",
    is_pyq: false, year: "", image_url: "",
};

const EMPTY_NOTE = {
    subject: "biology", chapter: "", title: "",
    content: "", type: "text", image_url: "",
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
    const [editing, setEditing] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            const r = await api.get("/admin/questions", { params: filter !== "all" ? { subject: filter } : {} });
            setQuestions(r.data);
        } catch { setQuestions([]); }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            toast.success("Deleted");
            load();
        } catch { toast.error("Failed to delete"); }
    };

    const filtered = (questions || []).filter(q =>
        q.question?.toLowerCase().includes(search.toLowerCase()) ||
        q.chapter?.toLowerCase().includes(search.toLowerCase())
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
                <div className="flex gap-2">
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
        </div>
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

    return (
        <Modal title={initial ? "Edit Question" : "Add Question"} onClose={onClose}>
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
                <Field label="Question Text">
                    <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={2} className={inputCls} />
                </Field>
                <Field label="Image URL (optional — for diagram questions)">
                    <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className={inputCls} />
                    {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-white/10" />}
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
    } : { ...EMPTY_NOTE });
    const [saving, setSaving] = useState(false);

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
                <Field label="Image URL (optional — for diagrams/mind maps)">
                    <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className={inputCls} />
                    {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-white/10" />}
                </Field>
                <button onClick={save} disabled={saving}
                    className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition">
                    {saving ? "Saving..." : initial ? "Update Note" : "Add Note"}
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
