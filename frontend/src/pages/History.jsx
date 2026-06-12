import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, History as HistoryIcon, Trophy, Calendar, Clock, BookOpen } from "lucide-react";

const MODE_META = {
    pyq: { label: "PYQ Practice", icon: <Trophy className="w-4 h-4" />, color: "#39FF14" },
    daily_quiz: { label: "Daily Quiz", icon: <Calendar className="w-4 h-4" />, color: "#00F0FF" },
    mock_test: { label: "Mock Test", icon: <Clock className="w-4 h-4" />, color: "#B900FF" },
    chapter: { label: "Chapter", icon: <BookOpen className="w-4 h-4" />, color: "#FFD700" },
};

function fmtDate(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return iso;
    }
}

export default function History() {
    const [rows, setRows] = useState(null);

    useEffect(() => {
        api.get("/quiz/history", { params: { limit: 50 } })
            .then((r) => setRows(r.data))
            .catch(() => setRows([]));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="fade-up mb-6">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Your Journey</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black">
                    Quiz <span className="text-[#39FF14] glow-text">History</span>
                </h1>
            </div>

            {rows === null ? (
                <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
            ) : rows.length === 0 ? (
                <div className="glass-card p-12 text-center" data-testid="history-empty">
                    <HistoryIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="font-mono uppercase tracking-widest text-sm text-white/50">No quizzes yet.</p>
                    <Link to="/play" className="neon-btn inline-block mt-4">Start practicing →</Link>
                </div>
            ) : (
                <div className="glass-card overflow-hidden" data-testid="history-list">
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[#39FF14]/15 font-mono text-xs uppercase tracking-widest text-white/40">
                        <div className="col-span-4 sm:col-span-3">Mode</div>
                        <div className="col-span-3 sm:col-span-3">Subject</div>
                        <div className="col-span-2 sm:col-span-2 text-center">Score</div>
                        <div className="col-span-3 sm:col-span-2 text-right">XP</div>
                        <div className="hidden sm:block sm:col-span-2 text-right">When</div>
                    </div>
                    {rows.map((r) => {
                        const m = MODE_META[r.mode] || { label: r.mode, color: "#fff", icon: null };
                        return (
                            <div key={r.attempt_id} className="grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-white/5" data-testid="history-row">
                                <div className="col-span-4 sm:col-span-3 flex items-center gap-2 font-bold" style={{ color: m.color }}>
                                    {m.icon}<span className="truncate">{m.label}</span>
                                </div>
                                <div className="col-span-3 sm:col-span-3 capitalize text-[#A1BBA1] truncate">{r.subject || "Mixed"}</div>
                                <div className="col-span-2 sm:col-span-2 text-center font-mono">{r.correct}/{r.total}</div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-[#39FF14]">+{r.xp_earned}</div>
                                <div className="hidden sm:block sm:col-span-2 text-right font-mono text-xs text-white/40">{fmtDate(r.created_at)}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
