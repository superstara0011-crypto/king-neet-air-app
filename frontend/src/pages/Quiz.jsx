import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, SUBJECT_COLORS, SUBJECT_LABEL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2, X, Clock, ZoomIn, Flag, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";

// ─── Circular countdown ring (mock_test only) ───────────────────────────
function CountdownRing({ timeLeft, totalTime, size = 56 }) {
    const stroke = 5;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = totalTime ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 0;
    const offset = circumference - pct * circumference;
    const low = totalTime && timeLeft <= 30;
    const color = low ? "#FF3B30" : "#00FF66";
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <div className={`relative shrink-0 ${low ? "animate-pulse" : ""}`} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s linear" }} />
                </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-black leading-none" style={{ color, fontSize: size * 0.2 }}>{mins}:{String(secs).padStart(2, "0")}</span>
            </div>
        </div>
    );
}

export default function Quiz() {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const { refresh } = useAuth();
    const mode = params.get("mode") || "pyq";
    const subject = params.get("subject") || undefined;
    const chapter = params.get("chapter") || undefined;
    const limit = parseInt(params.get("limit") || "10", 10);

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idx, setIdx] = useState(0);
    const [answersMap, setAnswersMap] = useState({}); // { [questionIndex]: selectedOptionIndex }
    const [visited, setVisited] = useState(() => new Set([0]));
    const [marked, setMarked] = useState(() => new Set());
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // seconds, mock_test only
    const [totalTime, setTotalTime] = useState(null);
    const [imageZoomed, setImageZoomed] = useState(false);
    const [navigatorOpen, setNavigatorOpen] = useState(false);

    const answersMapRef = useRef({});
    const submittedRef = useRef(false);
    const timeSpentRef = useRef({});
    const enteredAtRef = useRef(Date.now());
    const prevIdxRef = useRef(0);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.get("/questions", { params: { mode, subject, chapter, limit } });
                if (!r.data || r.data.length === 0) {
                    toast.error("No questions available. Try another mode.");
                    nav("/dashboard");
                    return;
                }
                setQuestions(r.data);
                if (mode === "mock_test") {
                    const t = r.data.length * 60;
                    setTimeLeft(t);
                    setTotalTime(t);
                }
            } catch (e) {
                toast.error("Failed to load questions");
                nav("/dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, []); // eslint-disable-line

    // Track time spent per question whenever the current index changes
    useEffect(() => {
        const prev = prevIdxRef.current;
        const elapsed = (Date.now() - enteredAtRef.current) / 1000;
        timeSpentRef.current[prev] = (timeSpentRef.current[prev] || 0) + elapsed;
        enteredAtRef.current = Date.now();
        prevIdxRef.current = idx;
        setVisited(v => new Set(v).add(idx));
    }, [idx]);

    const submitQuiz = async () => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        setSubmitting(true);
        const finalAnswers = Object.entries(answersMapRef.current).map(([i, sel]) => ({
            question_id: questions[Number(i)].id,
            selected_option: sel,
        }));
        try {
            const r = await api.post("/quiz/submit", { mode, subject, answers: finalAnswers });
            await refresh();
            sessionStorage.setItem("lastResult", JSON.stringify(r.data));
            nav("/result");
        } catch (e) {
            toast.error("Failed to submit quiz");
            setSubmitting(false);
            submittedRef.current = false;
        }
    };

    // Mock-test countdown timer -> auto-submit at 0
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            toast.warning("Time's up! Submitting your test.");
            submitQuiz();
            return;
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]); // eslint-disable-line

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00FF66] animate-spin" />
            </div>
        );
    }

    if (questions.length === 0) return null;
    const q = questions[idx];
    const subjColor = SUBJECT_COLORS[q.subject] || "#00FF66";
    const progress = (idx / questions.length) * 100;
    const answeredCount = Object.keys(answersMap).length;

    const selectOption = (i) => {
        const next = { ...answersMapRef.current, [idx]: i };
        answersMapRef.current = next;
        setAnswersMap(next);
    };

    const goTo = (newIdx) => {
        setIdx(newIdx);
        setImageZoomed(false);
        setNavigatorOpen(false);
    };

    const handleNext = async () => {
        if (idx + 1 < questions.length) {
            goTo(idx + 1);
        } else {
            await submitQuiz();
        }
    };

    const toggleMark = () => {
        setMarked(m => {
            const next = new Set(m);
            if (next.has(idx)) next.delete(idx); else next.add(idx);
            return next;
        });
    };

    const questionStatus = (i) => {
        if (i === idx) return "current";
        if (marked.has(i)) return "marked";
        if (answersMap[i] !== undefined) return "answered";
        if (visited.has(i)) return "visited";
        return "unvisited";
    };

    const selected = answersMap[idx] ?? null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span
                        className="font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full border shrink-0"
                        style={{ color: subjColor, borderColor: `${subjColor}50`, background: `${subjColor}15` }}
                        data-testid="quiz-subject-tag"
                    >
                        {SUBJECT_LABEL[q.subject] || q.subject}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/50 shrink-0">{mode.replace("_", " ")}</span>
                    {q.is_pyq && q.year && (
                        <span className="font-mono text-xs text-[#FFD700] shrink-0">PYQ {q.year}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setNavigatorOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-white/60 hover:text-white text-xs font-bold transition"
                        data-testid="open-navigator-btn">
                        <List className="w-3.5 h-3.5" />
                        {answeredCount}/{questions.length}
                    </button>
                    {timeLeft !== null && <CountdownRing timeLeft={timeLeft} totalTime={totalTime} size={48} />}
                    <button onClick={() => nav("/dashboard")} className="text-white/40 hover:text-white" data-testid="quit-quiz-btn">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between mb-2 font-mono text-xs uppercase tracking-widest text-white/60">
                    <span data-testid="quiz-progress">Question {idx + 1} / {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00FF66] transition-all duration-500" style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(0,255,102,0.6)" }} />
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8 fade-up" key={q.id}>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-white/40">Chapter · {q.chapter}</p>
                    <button onClick={toggleMark}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                            marked.has(idx) ? "text-[#FFA500] border-[#FFA500]/50 bg-[#FFA500]/10" : "text-white/40 border-white/15 hover:text-white/70"
                        }`}>
                        <Flag className="w-3.5 h-3.5" />
                        {marked.has(idx) ? "Marked" : "Mark for review"}
                    </button>
                </div>

                {q.image_url && (
                    <button
                        onClick={() => setImageZoomed(true)}
                        className="relative w-full mb-5 group cursor-zoom-in"
                        data-testid="quiz-question-image-btn"
                    >
                        <img
                            src={q.image_url}
                            alt="Question diagram"
                            className="w-full max-h-72 object-contain rounded-xl border border-white/10 bg-white"
                            data-testid="quiz-question-image"
                        />
                        <span className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-bold opacity-90 group-hover:opacity-100 group-hover:bg-black/85 transition">
                            <ZoomIn className="w-3.5 h-3.5" />
                            Tap to zoom
                        </span>
                    </button>
                )}

                {q.question && (
                    <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug mb-6" data-testid="quiz-question-text">
                        {q.question}
                    </h2>
                )}

                <div className="space-y-3">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => selectOption(i)}
                            disabled={submitting}
                            className={`opt-btn ${selected === i ? "selected" : ""}`}
                            data-testid={`quiz-option-${i}`}
                        >
                            <span className="font-mono font-bold text-[#00FF66] mr-3">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => goTo(Math.max(0, idx - 1))}
                        disabled={idx === 0 || submitting}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white font-bold text-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={submitting}
                        className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="quiz-next-btn"
                    >
                        {submitting ? "Submitting…" : idx + 1 === questions.length ? "Finish →" : selected === null ? "Skip →" : "Next →"}
                    </button>
                </div>
            </div>

            {/* ── Question Navigator (bottom sheet) ── */}
            {navigatorOpen && (
                <div className="fixed inset-0 z-[90] flex items-end" onClick={() => setNavigatorOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-3xl mx-auto bg-[#0a0f0a] border-t border-[#00FF66]/20 rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
                        <p className="font-bold text-sm mb-4">Questions</p>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {questions.map((_, i) => {
                                const status = questionStatus(i);
                                const styles = {
                                    current: "border-2 border-[#00FF66] text-white bg-[#00FF66]/10",
                                    answered: "bg-[#00FF66] text-black border-transparent",
                                    marked: "bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/50",
                                    visited: "bg-white/5 text-white/50 border border-white/10",
                                    unvisited: "bg-transparent text-white/30 border border-white/10",
                                };
                                return (
                                    <button key={i} onClick={() => goTo(i)}
                                        className={`aspect-square rounded-lg font-mono font-bold text-sm flex items-center justify-center transition ${styles[status]}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-[11px] text-white/50">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#00FF66]" />Answered</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FFA500]/30 border border-[#FFA500]/50" />Marked</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/5 border border-white/10" />Visited</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-white/10" />Not Visited</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fullscreen image zoom lightbox ── */}
            {imageZoomed && q.image_url && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
                    onClick={() => setImageZoomed(false)}
                    data-testid="quiz-image-lightbox"
                >
                    <button
                        onClick={() => setImageZoomed(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <img
                        src={q.image_url}
                        alt="Question diagram zoomed"
                        className="max-w-full max-h-full object-contain rounded-lg bg-white cursor-zoom-out"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono">
                        Tap anywhere to close
                    </p>
                </div>
            )}
        </div>
    );
}
