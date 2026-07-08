import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Trophy, Calendar, Clock, Crown, Atom, FlaskConical, Leaf, Layers, BookOpen, ChevronRight, AlertTriangle } from "lucide-react";

const SUBJECT_META = {
    biology:   { name: "Biology",   icon: "🧬", color: "#D8A7A0", path: "/play/chapter?subject=biology" },
    physics:   { name: "Physics",   icon: "⚛️", color: "#A8C0C9", path: "/play/chapter?subject=physics" },
    chemistry: { name: "Chemistry", icon: "🧪", color: "#B399C9", path: "/play/chapter?subject=chemistry" },
};

export default function Play() {
    const nav = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => setStats(null));
    }, []);

    const modes = [
        { id: "pyq", title: "PYQ Practice", desc: "Real previous year NEET MCQs · pick a subject", icon: <Trophy className="w-7 h-7" />, color: "#D8A7A0" },
        { id: "chapter", title: "Chapter Practice", desc: "Drill a single chapter of any subject", icon: <BookOpen className="w-7 h-7" />, color: "#D4A574" },
        { id: "daily_quiz", title: "Daily Quiz", desc: "10 mixed questions · +10 XP daily bonus", icon: <Calendar className="w-7 h-7" />, color: "#A8C0C9" },
        { id: "mock_test", title: "Mock Test", desc: "25 mixed questions · timed (1 min/Q)", icon: <Clock className="w-7 h-7" />, color: "#B399C9" },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
            <div className="fade-up">
                <p className="font-mono uppercase tracking-widest text-xs text-[#D8A7A0] mb-2">Practice Hub</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black mb-3">Pick your battle.</h1>
                <p className="text-[#A1BBA1] text-lg mb-10">Three modes. One goal: <span className="text-white">crack NEET</span>.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {modes.map((m, i) => (
                    <button
                        key={m.id}
                        onClick={() => nav(`/play/${m.id}`)}
                        className="glass-card p-7 text-left transition hover:-translate-y-1 fade-up"
                        style={{ animationDelay: `${i * 0.05}s`, borderColor: `${m.color}30` }}
                        data-testid={`play-mode-${m.id}`}
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                            style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}40` }}
                        >
                            {m.icon}
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-2">{m.title}</h3>
                        <p className="text-sm text-[#A1BBA1]">{m.desc}</p>
                    </button>
                ))}
            </div>

            {/* Practice by Subject */}
            <div className="mt-10">
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
                <div className="mt-10">
                    <p className="font-mono text-xs uppercase tracking-widest text-[#C97064] flex items-center gap-1.5 mb-3">
                        <AlertTriangle className="w-3.5 h-3.5" />Weak Chapters
                    </p>
                    <div className="glass-card overflow-hidden border border-[#C97064]/20">
                        {stats.weak_chapters.map((c, i) => (
                            <button key={i} onClick={() => nav(`/play/chapter?subject=${c.subject}&chapter=${encodeURIComponent(c.chapter)}`)}
                                className="w-full flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition text-left">
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate">{c.chapter}</div>
                                    <div className="font-mono text-xs text-white/40 capitalize">{c.subject} · {c.attempted} attempts</div>
                                </div>
                                <span className="font-mono text-sm font-black text-[#C97064]">{c.accuracy}%</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
