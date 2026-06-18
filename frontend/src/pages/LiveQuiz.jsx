import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, Radio, Clock, BookOpen, ChevronRight, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";

// ─── LIST PAGE — /live-quiz ──────────────────────────────────────────────
export function LiveQuizList() {
    const [quizzes, setQuizzes] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        api.get("/live-quiz").then(r => setQuizzes(r.data)).catch(() => setQuizzes([]));
    }, []);

    if (!quizzes) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
    );

    const subjectColor = (s) => s === "biology" ? "#39FF14" : s === "physics" ? "#00F0FF" : s === "chemistry" ? "#B900FF" : "#FFD700";

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="mb-8 fade-up">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Special Tests</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black">
                    Live <span className="text-[#39FF14] glow-text">Quiz</span>
                </h1>
                <p className="text-white/50 mt-2">Limited-time quizzes set by admins — attempt before they end!</p>
            </div>

            {quizzes.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Radio className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 font-mono">No live quizzes right now. Check back soon!</p>
                </div>
            )}

            <div className="space-y-4">
                {quizzes.map(q => (
                    <button key={q.id} onClick={() => nav(`/live-quiz/${q.id}`)}
                        className="w-full glass-card p-5 text-left transition hover:scale-[1.01] block">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {q.status === "live" ? (
                                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-bold animate-pulse"
                                            style={{ color: "#39FF14", background: "rgba(57,255,20,0.12)", border: "1px solid #39FF1440" }}>
                                            🔴 LIVE NOW
                                        </span>
                                    ) : (
                                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-bold"
                                            style={{ color: "#FFD700", background: "rgba(255,215,0,0.12)", border: "1px solid #FFD70040" }}>
                                            ⏰ Upcoming
                                        </span>
                                    )}
                                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border"
                                        style={{ borderColor: subjectColor(q.subject), color: subjectColor(q.subject) }}>
                                        {q.subject}
                                    </span>
                                </div>
                                <h3 className="font-heading font-bold text-lg mb-1">{q.title}</h3>
                                {q.description && <p className="text-white/50 text-sm mb-2">{q.description}</p>}
                                <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{q.question_count} Questions</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration_minutes} min</span>
                                </div>
                                {q.starts_at && q.status === "upcoming" && (
                                    <div className="mt-2 text-xs text-[#FFD700] font-mono">
                                        Starts: {new Date(q.starts_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30 shrink-0 mt-1" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── ATTEMPT PAGE — /live-quiz/:id ────────────────────────────────────────
export default function LiveQuizAttempt() {
    const { id } = useParams();
    const nav = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState("");
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        api.get(`/live-quiz/${id}`).then(r => {
            setQuiz(r.data);
            setAnswers(new Array(r.data.questions.length).fill(-1));
            setTimeLeft(r.data.duration_minutes * 60);
        }).catch(e => setError(e.response?.data?.detail || "Failed to load quiz"));
    }, [id]);

    // Countdown timer once started
    useEffect(() => {
        if (!started || result) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, timeLeft, result]);

    const selectAnswer = (idx) => {
        const a = [...answers];
        a[current] = idx;
        setAnswers(a);
    };

    const handleSubmit = async () => {
        if (submitting || result) return;
        setSubmitting(true);
        try {
            const r = await api.post(`/live-quiz/${id}/submit`, { answers });
            setResult(r.data);
        } catch (e) {
            toast.error(e.response?.data?.detail || "Submit failed");
        } finally {
            setSubmitting(false);
        }
    };

    const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    if (error) return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
            <Radio className="w-10 h-10 text-[#FF3B30] mx-auto mb-3" />
            <p className="font-heading text-xl mb-2">Can't attempt this quiz</p>
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={() => nav("/live-quiz")} className="mt-6 text-[#39FF14] font-mono text-sm hover:underline">← Back to Live Quizzes</button>
        </div>
    );

    if (!quiz) return (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
    );

    // ── Result screen ──
    if (result) {
        const pct = Math.round((result.correct / result.total) * 100);
        return (
            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="glass-card p-8 text-center mb-6">
                    <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                    <h2 className="font-heading text-3xl font-black mb-2">Quiz Complete!</h2>
                    <p className="text-white/50 mb-6">{quiz.title}</p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="font-black text-2xl text-[#39FF14]">{result.correct}</div>
                            <div className="text-xs text-white/40 mt-1">Correct</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="font-black text-2xl text-[#FF3B30]">{result.wrong}</div>
                            <div className="text-xs text-white/40 mt-1">Wrong</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="font-black text-2xl text-[#FFD700]">+{result.xp_earned}</div>
                            <div className="text-xs text-white/40 mt-1">XP Earned</div>
                        </div>
                    </div>
                    <div className="text-sm text-white/60">Accuracy: <span className="text-white font-bold">{pct}%</span></div>
                </div>

                <div className="space-y-3 mb-6">
                    {result.results.map((r, i) => (
                        <div key={i} className="glass-card p-4">
                            <div className="flex items-start gap-3">
                                {r.is_correct ? <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                    <p className="text-sm font-medium mb-1">{i + 1}. {r.question}</p>
                                    {!r.is_correct && quiz.questions[i] && (
                                        <p className="text-xs text-[#39FF14]">Correct: {quiz.questions[i].options[r.correct_answer]}</p>
                                    )}
                                    {r.explanation && <p className="text-xs text-white/40 mt-1">{r.explanation}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={() => nav("/live-quiz")} className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-[#39FF14] text-black">
                    Back to Live Quizzes
                </button>
            </div>
        );
    }

    // ── Pre-start screen ──
    if (!started) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <Radio className="w-12 h-12 text-[#39FF14] mx-auto mb-4 animate-pulse" />
                <h2 className="font-heading text-3xl font-black mb-2">{quiz.title}</h2>
                {quiz.description && <p className="text-white/50 mb-6">{quiz.description}</p>}
                <div className="glass-card p-6 mb-6 flex justify-around">
                    <div>
                        <div className="font-black text-2xl text-[#00F0FF]">{quiz.questions.length}</div>
                        <div className="text-xs text-white/40">Questions</div>
                    </div>
                    <div>
                        <div className="font-black text-2xl text-[#FFD700]">{quiz.duration_minutes}</div>
                        <div className="text-xs text-white/40">Minutes</div>
                    </div>
                </div>
                <p className="text-xs text-white/40 mb-6">⚠️ Once started, timer can't be paused. You can only attempt this quiz once.</p>
                <button onClick={() => setStarted(true)} className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-[#39FF14] text-black hover:opacity-90 transition">
                    Start Quiz
                </button>
            </div>
        );
    }

    // ── In-progress quiz ──
    const q = quiz.questions[current];
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-sm text-white/50">Question {current + 1}/{quiz.questions.length}</span>
                <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg ${timeLeft < 60 ? "text-[#FF3B30] bg-[#FF3B30]/10" : "text-[#39FF14] bg-[#39FF14]/10"}`}>
                    ⏱ {fmtTime(timeLeft)}
                </span>
            </div>

            <div className="bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
                <div className="h-full bg-[#39FF14] transition-all" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
            </div>

            <div className="glass-card p-6 mb-6">
                {q.image_url && <img src={q.image_url} alt="" className="w-full max-h-60 object-contain rounded-lg mb-4 border border-white/10" />}
                <p className="text-lg font-medium leading-relaxed mb-6">{q.question}</p>
                <div className="space-y-3">
                    {q.options.map((opt, i) => (
                        <button key={i} onClick={() => selectAnswer(i)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                answers[current] === i
                                    ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]"
                                    : "border-white/10 hover:border-white/30 text-white/80"
                            }`}>
                            <span className="font-mono text-xs mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                    className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 text-white/60 disabled:opacity-30">
                    ← Previous
                </button>
                {current < quiz.questions.length - 1 ? (
                    <button onClick={() => setCurrent(c => c + 1)}
                        className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40">
                        Next →
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-[#39FF14] text-black">
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                )}
            </div>
        </div>
    );
}
