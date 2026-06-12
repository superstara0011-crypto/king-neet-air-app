import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LevelBadge from "@/components/LevelBadge";
import { Check, X, Sparkles, Trophy, Repeat } from "lucide-react";

export default function Result() {
    const nav = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("lastResult");
        if (!raw) { nav("/dashboard"); return; }
        setResult(JSON.parse(raw));
    }, [nav]);

    if (!result) return null;
    const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            {/* SUMMARY */}
            <div className="glass-card p-8 text-center fade-up relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#39FF14]/20 blur-3xl rounded-full pointer-events-none" />
                <div className="relative">
                    <Trophy className="w-12 h-12 text-[#39FF14] mx-auto mb-3" />
                    <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Quiz Complete</p>
                    <h1 className="font-heading font-black text-4xl sm:text-6xl mb-4 glow-text">
                        +<span data-testid="result-xp-earned">{result.xp_earned}</span> XP
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <span className="font-mono text-lg">
                            <span data-testid="result-correct">{result.correct}</span> / <span data-testid="result-total">{result.total}</span> correct ({pct}%)
                        </span>
                        <LevelBadge level={result.level} size="lg" />
                    </div>
                    <div className="font-mono text-sm text-white/50">
                        Total XP: <span className="text-white" data-testid="result-total-xp">{result.new_total_xp}</span>
                    </div>
                </div>
            </div>

            {/* DETAILS */}
            <h2 className="font-heading text-2xl font-bold mt-10 mb-4">Review</h2>
            <div className="space-y-3">
                {result.details.map((d) => (
                    <div key={d.question_id} className="glass-card p-5 fade-up">
                        <div className="flex items-start gap-3 mb-3">
                            {d.is_correct ? (
                                <div className="w-7 h-7 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/60 flex items-center justify-center text-[#39FF14] flex-shrink-0">
                                    <Check className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-400/60 flex items-center justify-center text-red-400 flex-shrink-0">
                                    <X className="w-4 h-4" />
                                </div>
                            )}
                            <h3 className="font-bold text-base flex-1">{d.question}</h3>
                        </div>
                        <div className="space-y-2 ml-10">
                            {d.options.map((opt, j) => {
                                let cls = "opt-btn text-sm py-2";
                                if (j === d.correct) cls += " correct";
                                else if (j === d.selected && !d.is_correct) cls += " wrong";
                                return (
                                    <div key={j} className={cls}>
                                        <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + j)}.</span>
                                        {opt}
                                    </div>
                                );
                            })}
                            {d.explanation && (
                                <div className="mt-3 px-4 py-3 border-l-2 border-[#39FF14] bg-[#39FF14]/5 text-sm text-[#A1BBA1]">
                                    <span className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mr-2">Explain</span>
                                    {d.explanation}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mt-10 justify-center">
                <button onClick={() => nav("/play")} className="neon-btn" data-testid="result-play-again-btn">
                    <Repeat className="w-4 h-4 inline mr-2" />
                    Play Again
                </button>
                <button onClick={() => nav("/leaderboard")} className="neon-btn-ghost" data-testid="result-leaderboard-btn">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    View Leaderboard
                </button>
            </div>
        </div>
    );
}
