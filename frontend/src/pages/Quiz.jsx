import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, SUBJECT_COLORS, SUBJECT_LABEL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2, X, Clock } from "lucide-react";
import { toast } from "sonner";

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
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // seconds, mock_test only

    const answersRef = useRef([]);
    const submittedRef = useRef(false);

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
                if (mode === "mock_test") setTimeLeft(r.data.length * 60); // 1 min / question
            } catch (e) {
                toast.error("Failed to load questions");
                nav("/dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, []); // eslint-disable-line

    const submitQuiz = async (finalAnswers) => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        setSubmitting(true);
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
            submitQuiz(answersRef.current);
            return;
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]); // eslint-disable-line

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
            </div>
        );
    }

    if (questions.length === 0) return null;
    const q = questions[idx];
    const subjColor = SUBJECT_COLORS[q.subject] || "#39FF14";
    const progress = (idx / questions.length) * 100;

    const handleNext = async () => {
        if (selected === null) return;
        const newAnswers = [...answers, { question_id: q.id, selected_option: selected }];
        setAnswers(newAnswers);
        answersRef.current = newAnswers;
        setSelected(null);

        if (idx + 1 < questions.length) {
            setIdx(idx + 1);
        } else {
            await submitQuiz(newAnswers);
        }
    };

    const mins = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
    const secs = timeLeft !== null ? timeLeft % 60 : 0;
    const lowTime = timeLeft !== null && timeLeft <= 30;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span
                        className="font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full border"
                        style={{ color: subjColor, borderColor: `${subjColor}50`, background: `${subjColor}15` }}
                        data-testid="quiz-subject-tag"
                    >
                        {SUBJECT_LABEL[q.subject] || q.subject}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/50">{mode.replace("_", " ")}</span>
                    {q.is_pyq && q.year && (
                        <span className="font-mono text-xs text-[#FFD700]">PYQ {q.year}</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {timeLeft !== null && (
                        <span
                            className={`inline-flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded-full border ${lowTime ? "text-[#FF3B30] border-[#FF3B30]/50 bg-[#FF3B30]/10 animate-pulse" : "text-[#39FF14] border-[#39FF14]/40 bg-[#39FF14]/10"}`}
                            data-testid="quiz-timer"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                        </span>
                    )}
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
                    <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(57,255,20,0.6)" }} />
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8 fade-up" key={q.id}>
                <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">Chapter · {q.chapter}</p>

                {q.image_url && (
                    <img
                        src={q.image_url}
                        alt="Question diagram"
                        className="w-full max-h-72 object-contain rounded-xl border border-white/10 bg-white mb-5"
                        data-testid="quiz-question-image"
                    />
                )}

                <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug mb-6" data-testid="quiz-question-text">
                    {q.question}
                </h2>

                <div className="space-y-3">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => setSelected(i)}
                            disabled={submitting}
                            className={`opt-btn ${selected === i ? "selected" : ""}`}
                            data-testid={`quiz-option-${i}`}
                        >
                            <span className="font-mono font-bold text-[#39FF14] mr-3">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={handleNext}
                        disabled={selected === null || submitting}
                        className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="quiz-next-btn"
                    >
                        {submitting ? "Submitting…" : idx + 1 === questions.length ? "Finish →" : "Next →"}
                    </button>
                </div>
            </div>
        </div>
    );
}
