import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, Brain, X, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const SUBJECT_COLORS = { biology: "var(--accent)", physics: "#A8C0C9", chemistry: "#B399C9" };

export default function Mistakes() {
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState("all");
    const [expanded, setExpanded] = useState(null);

    const load = useCallback(() => {
        api.get(`/quiz/mistakes${filter !== "all" ? `?subject=${filter}` : ""}`)
            .then(r => setData(r.data))
            .catch(() => setData({ mistakes: [], counts: {}, total: 0 }));
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const dismiss = async (id) => {
        try {
            await api.delete(`/quiz/mistakes/${id}`);
            toast.success("Marked as reviewed");
            load();
        } catch { toast.error("Failed to dismiss"); }
    };

    if (!data) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" /></div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="mb-6 fade-up">
                <p className="font-mono uppercase tracking-widest text-xs text-[var(--accent)] mb-2 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />Mistake Notebook
                </p>
                <h1 className="font-heading text-3xl sm:text-4xl font-black">Learn from your <span className="text-[var(--accent)]">mistakes</span></h1>
                <p className="text-[var(--text-secondary)] mt-2">Wrong answers are saved here automatically. Retry the topic to clear them.</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {["all", "biology", "physics", "chemistry"].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                            filter === s ? "bg-[var(--accent)] text-[var(--text)]" : "border border-[var(--accent)]/30 text-[var(--text-secondary)] hover:text-[var(--text)]"
                        }`}>
                        {s} {s !== "all" && data.counts?.[s] > 0 ? `(${data.counts[s]})` : ""}
                    </button>
                ))}
            </div>

            {data.mistakes.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-[var(--success)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)] font-mono">No mistakes here — great job! 🎯</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.mistakes.map(m => (
                        <div key={m.mistake_id} className="glass-card p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border"
                                        style={{ borderColor: SUBJECT_COLORS[m.subject], color: SUBJECT_COLORS[m.subject] }}>
                                        {m.subject}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><BookOpen className="w-3 h-3" />{m.chapter}</span>
                                </div>
                                <button onClick={() => dismiss(m.mistake_id)} title="Mark as reviewed"
                                    className="text-[var(--text-muted)] hover:text-[var(--success)] transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {m.image_url && (
                                <img src={m.image_url} alt="" className="w-full max-h-48 object-contain rounded-lg mb-3 border border-[var(--border)]" />
                            )}

                            <p className="text-sm font-medium mb-3">{m.question}</p>

                            <div className="space-y-2 mb-3">
                                {m.options.map((opt, i) => (
                                    <div key={i} className={`px-3 py-2 rounded-lg text-sm border ${
                                        i === m.correct ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                                        : i === m.selected ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"
                                        : "border-[var(--border)] text-[var(--text-secondary)]"
                                    }`}>
                                        <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                                        {opt}
                                        {i === m.correct && <span className="ml-2 text-xs">✓ Correct</span>}
                                        {i === m.selected && i !== m.correct && <span className="ml-2 text-xs">✗ Your answer</span>}
                                    </div>
                                ))}
                            </div>

                            {m.explanation && (
                                <div className="bg-[var(--card-hover)] rounded-lg p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                                    💡 {m.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
