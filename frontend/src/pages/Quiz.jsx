import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, SUBJECT_COLORS, SUBJECT_LABEL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2, X, Clock, ZoomIn, Flag, ChevronLeft, ChevronRight, List, Lightbulb, Bookmark, StickyNote, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

// ─── Circular countdown ring (mock_test only) ───────────────────────────
function CountdownRing({ timeLeft, totalTime, size = 56 }) {
    const stroke = 5;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = totalTime ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 0;
    const offset = circumference - pct * circumference;
    const low = totalTime && timeLeft <= 30;
    const color = low ? "var(--danger)" : "var(--accent)";
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <div className={`relative shrink-0 ${low ? "animate-pulse" : ""}`} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth={stroke} fill="none" />
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

    // Practice-mode helpers (never used in mock_test)
    const [checkResult, setCheckResult] = useState(null); // { is_correct, correct_option, explanation }
    const [checking, setChecking] = useState(false);
    const [hintEliminated, setHintEliminated] = useState([]);
    const [hintLoading, setHintLoading] = useState(false);
    const [bookmarked, setBookmarked] = useState(() => new Set());
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [noteSaving, setNoteSaving] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportSubmitting, setReportSubmitting] = useState(false);

    const answersMapRef = useRef({});
    const submittedRef = useRef(false);
    const timeSpentRef = useRef({});
    const enteredAtRef = useRef(Date.now());
    const prevIdxRef = useRef(0);
    const liveIdxRef = useRef(0);

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
        liveIdxRef.current = idx;
        const prev = prevIdxRef.current;
        const elapsed = (Date.now() - enteredAtRef.current) / 1000;
        timeSpentRef.current[prev] = (timeSpentRef.current[prev] || 0) + elapsed;
        enteredAtRef.current = Date.now();
        prevIdxRef.current = idx;
        setVisited(v => new Set(v).add(idx));
        setCheckResult(null);
        setHintEliminated([]);
        setNoteOpen(false);
        setReportOpen(false);
        setReportReason("");
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
                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
            </div>
        );
    }

    if (questions.length === 0) return null;
    const q = questions[idx];
    const subjColor = SUBJECT_COLORS[q.subject] || "var(--accent)";
    const progress = (idx / questions.length) * 100;
    const answeredCount = Object.keys(answersMap).length;

    const isPractice = mode !== "mock_test";

    const selectOption = async (i) => {
        if (isPractice && checkResult) return; // locked after checking, until Next
        const askedForIdx = idx; // remember which question this selection belongs to
        const next = { ...answersMapRef.current, [idx]: i };
        answersMapRef.current = next;
        setAnswersMap(next);

        if (isPractice) {
            setChecking(true);
            try {
                const r = await api.post("/quiz/check", { question_id: q.id, selected_option: i });
                // If the user already moved to a different question while this was
                // in flight, discard the response — it belongs to the old question.
                if (askedForIdx === liveIdxRef.current) {
                    setCheckResult(r.data);
                }
            } catch {
                // fail silently — feedback is a nice-to-have, shouldn't block the quiz
            } finally {
                if (askedForIdx === liveIdxRef.current) {
                    setChecking(false);
                }
            }
        }
    };

    const handleHint = async () => {
        if (hintEliminated.length > 0 || hintLoading) return;
        setHintLoading(true);
        try {
            const r = await api.post("/quiz/hint", { question_id: q.id });
            setHintEliminated(r.data.eliminate || []);
            toast.success(`-1 XP · Two options eliminated`);
        } catch {
            toast.error("Couldn't fetch hint");
        } finally {
            setHintLoading(false);
        }
    };

    const handleBookmark = async () => {
        try {
            const r = await api.post("/quiz/bookmark", { question_id: q.id });
            setBookmarked(b => {
                const next = new Set(b);
                if (r.data.bookmarked) next.add(q.id); else next.delete(q.id);
                return next;
            });
            toast.success(r.data.bookmarked ? "Bookmarked" : "Bookmark removed");
        } catch {
            toast.error("Couldn't update bookmark");
        }
    };

    const openNote = async () => {
        const opening = !noteOpen;
        setNoteOpen(opening);
        if (opening) {
            try {
                const r = await api.get(`/quiz/notes/${q.id}`);
                setNoteText(r.data?.text || "");
            } catch {
                setNoteText("");
            }
        }
    };

    const saveNote = async () => {
        setNoteSaving(true);
        try {
            await api.put(`/quiz/notes/${q.id}`, { text: noteText });
            toast.success("Note saved");
            setNoteOpen(false);
        } catch {
            toast.error("Couldn't save note");
        } finally {
            setNoteSaving(false);
        }
    };

    const submitReport = async () => {
        if (!reportReason.trim()) return;
        setReportSubmitting(true);
        try {
            await api.post("/quiz/report", { question_id: q.id, reason: reportReason.trim() });
            toast.success("Reported — thanks for flagging it");
            setReportOpen(false);
            setReportReason("");
        } catch {
            toast.error("Couldn't submit report");
        } finally {
            setReportSubmitting(false);
        }
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
                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] shrink-0">{mode.replace("_", " ")}</span>
                    {q.is_pyq && q.year && (
                        <span className="font-mono text-xs text-[var(--warning)] shrink-0">PYQ {q.year}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setNavigatorOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] text-xs font-bold transition"
                        data-testid="open-navigator-btn">
                        <List className="w-3.5 h-3.5" />
                        {answeredCount}/{questions.length}
                    </button>
                    {timeLeft !== null && <CountdownRing timeLeft={timeLeft} totalTime={totalTime} size={48} />}
                    <button onClick={() => nav("/dashboard")} className="text-[var(--text-muted)] hover:text-[var(--text)]" data-testid="quit-quiz-btn">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between mb-2 font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                    <span data-testid="quiz-progress">Question {idx + 1} / {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-[var(--card-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(108,99,255,0.6)" }} />
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8 fade-up" key={q.id}>
                <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Chapter · {q.chapter}</p>
                    <button onClick={toggleMark}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                            marked.has(idx) ? "text-[var(--warning)] border-[var(--warning)]/50 bg-[var(--warning)]/10" : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
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
                            className="w-full max-h-72 object-contain rounded-xl border border-[var(--border)] bg-white"
                            data-testid="quiz-question-image"
                        />
                        <span className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-[var(--text)] text-xs font-bold opacity-90 group-hover:opacity-100 group-hover:bg-black/85 transition">
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
                    {q.options.map((opt, i) => {
                        const eliminated = hintEliminated.includes(i);
                        let extraCls = "";
                        if (checkResult) {
                            if (i === checkResult.correct_option) extraCls = "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]";
                            else if (i === selected && !checkResult.is_correct) extraCls = "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]";
                        }
                        return (
                            <button
                                key={i}
                                onClick={() => !eliminated && selectOption(i)}
                                disabled={submitting || checking || eliminated || (isPractice && !!checkResult)}
                                className={`opt-btn ${selected === i ? "selected" : ""} ${extraCls} ${eliminated ? "opacity-30 line-through" : ""}`}
                                data-testid={`quiz-option-${i}`}
                            >
                                <span className="font-mono font-bold text-[var(--accent)] mr-3">{String.fromCharCode(65 + i)}.</span>
                                {opt}
                                {checkResult && i === checkResult.correct_option && <CheckCircle2 className="w-4 h-4 inline ml-2 text-[var(--success)]" />}
                                {checkResult && i === selected && !checkResult.is_correct && <XCircle className="w-4 h-4 inline ml-2 text-[var(--danger)]" />}
                            </button>
                        );
                    })}
                </div>

                {checkResult?.explanation && (
                    <div className="mt-4 bg-[var(--card-hover)] rounded-lg p-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                        💡 {checkResult.explanation}
                    </div>
                )}

                {isPractice && (
                    <div className="flex items-center gap-2 flex-wrap mt-5 pt-5 border-t border-[var(--border)]">
                        <button onClick={handleHint} disabled={hintLoading || hintEliminated.length > 0}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[var(--warning)]/30 text-[var(--warning)] hover:bg-[var(--warning)]/10 transition disabled:opacity-40">
                            <Lightbulb className="w-3.5 h-3.5" />Hint <span className="text-[var(--text-muted)]">-1 XP</span>
                        </button>
                        <button onClick={handleBookmark}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition ${
                                bookmarked.has(q.id) ? "border-[#A8C0C9]/50 text-[#A8C0C9] bg-[#A8C0C9]/10" : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                            }`}>
                            <Bookmark className="w-3.5 h-3.5" />{bookmarked.has(q.id) ? "Bookmarked" : "Bookmark"}
                        </button>
                        <button onClick={openNote}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] transition">
                            <StickyNote className="w-3.5 h-3.5" />Add Note
                        </button>
                        <button onClick={() => setReportOpen(o => !o)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/10 transition ml-auto">
                            <AlertTriangle className="w-3.5 h-3.5" />Report Error
                        </button>
                    </div>
                )}

                {noteOpen && (
                    <div className="mt-3">
                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Write a note for this question..."
                            rows={3}
                            className="w-full bg-black/30 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]" />
                        <button onClick={saveNote} disabled={noteSaving}
                            className="mt-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--accent)] text-black disabled:opacity-50">
                            {noteSaving ? "Saving..." : "Save Note"}
                        </button>
                    </div>
                )}

                {reportOpen && (
                    <div className="mt-3">
                        <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                            placeholder="What's wrong with this question? (e.g. wrong answer, typo, unclear)"
                            rows={2}
                            className="w-full bg-black/30 border border-[var(--danger)]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--danger)]" />
                        <button onClick={submitReport} disabled={reportSubmitting || !reportReason.trim()}
                            className="mt-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--danger)] text-[var(--text)] disabled:opacity-50">
                            {reportSubmitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => goTo(Math.max(0, idx - 1))}
                        disabled={idx === 0 || submitting}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] font-bold text-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
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
                    <div className="relative w-full max-w-3xl mx-auto bg-[var(--card)] border-t border-[var(--accent)]/20 rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-4" />
                        <p className="font-bold text-sm mb-4">Questions</p>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {questions.map((_, i) => {
                                const status = questionStatus(i);
                                const styles = {
                                    current: "border-2 border-[var(--accent)] text-[var(--text)] bg-[var(--accent)]/10",
                                    answered: "bg-[var(--accent)] text-black border-transparent",
                                    marked: "bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/50",
                                    visited: "bg-[var(--card-hover)] text-[var(--text-secondary)] border border-[var(--border)]",
                                    unvisited: "bg-transparent text-[var(--text-muted)] border border-[var(--border)]",
                                };
                                return (
                                    <button key={i} onClick={() => goTo(i)}
                                        className={`aspect-square rounded-lg font-mono font-bold text-sm flex items-center justify-center transition ${styles[status]}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-[11px] text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--accent)]" />Answered</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--warning)]/30 border border-[var(--warning)]/50" />Marked</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--card-hover)] border border-[var(--border)]" />Visited</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-[var(--border)]" />Not Visited</span>
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
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-[var(--card-hover)] hover:bg-[var(--border)] flex items-center justify-center transition"
                    >
                        <X className="w-5 h-5 text-[var(--text)]" />
                    </button>
                    <img
                        src={q.image_url}
                        alt="Question diagram zoomed"
                        className="max-w-full max-h-full object-contain rounded-lg bg-white cursor-zoom-out"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-secondary)] text-xs font-mono">
                        Tap anywhere to close
                    </p>
                </div>
            )}
        </div>
    );
}
