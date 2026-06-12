import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Atom, FlaskConical, Leaf, Layers, Loader2, ArrowLeft } from "lucide-react";
import { api, SUBJECT_COLORS } from "@/lib/api";

const SUBJECTS = [
    { id: "biology", icon: <Leaf className="w-8 h-8" />, label: "Biology", desc: "Cells · Genetics · Physiology · Ecology" },
    { id: "physics", icon: <Atom className="w-8 h-8" />, label: "Physics", desc: "Mechanics · EM · Optics · Modern" },
    { id: "chemistry", icon: <FlaskConical className="w-8 h-8" />, label: "Chemistry", desc: "Organic · Inorganic · Physical" },
];

export default function ModeSelect() {
    const { mode } = useParams();
    const nav = useNavigate();
    const [subject, setSubject] = useState(null); // for chapter mode 2nd step
    const [chapters, setChapters] = useState(null);

    const modeMeta = {
        pyq: { title: "PYQ Practice", desc: "Previous Year NEET Questions" },
        daily_quiz: { title: "Daily Quiz", desc: "10 mixed questions · +10 XP bonus on completion" },
        mock_test: { title: "Mock Test", desc: "Timed mixed-syllabus test · 1 min/question" },
        chapter: { title: "Chapter Practice", desc: "Pick a subject, then drill a single chapter" },
    }[mode] || { title: "Quiz", desc: "" };

    const isMixed = mode === "daily_quiz" || mode === "mock_test";
    const isChapter = mode === "chapter";

    useEffect(() => {
        if (isChapter && subject) {
            setChapters(null);
            api.get("/chapters", { params: { subject } })
                .then((r) => setChapters(r.data))
                .catch(() => setChapters([]));
        }
    }, [isChapter, subject]);

    const startChapter = (ch) => {
        nav(`/quiz?mode=chapter&subject=${subject}&chapter=${encodeURIComponent(ch)}&limit=10`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
            <div className="fade-up">
                <p className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-2">{mode?.replace("_", " ")}</p>
                <h1 className="font-heading text-3xl sm:text-5xl font-black mb-3">{modeMeta.title}</h1>
                <p className="text-[#A1BBA1] text-base sm:text-lg mb-10">{modeMeta.desc}</p>
            </div>

            {isMixed ? (
                <div className="fade-up glass-card p-8 text-center">
                    <Layers className="w-12 h-12 text-[#39FF14] mx-auto mb-4" />
                    <h2 className="font-heading text-2xl font-bold mb-2">Mixed Subjects</h2>
                    <p className="text-[#A1BBA1] mb-6">{mode === "daily_quiz" ? "10 random questions across Biology, Physics & Chemistry." : "25 question timed mock test covering the full syllabus."}</p>
                    <button
                        className="neon-btn"
                        onClick={() => nav(`/quiz?mode=${mode}&limit=${mode === "mock_test" ? 25 : 10}`)}
                        data-testid="start-mixed-quiz-btn"
                    >
                        Start Now →
                    </button>
                </div>
            ) : isChapter && subject ? (
                <>
                    <button onClick={() => setSubject(null)} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#39FF14] mb-4" data-testid="chapter-back-btn">
                        <ArrowLeft className="w-4 h-4" /> Back to subjects
                    </button>
                    <h2 className="font-heading text-xl font-bold mb-4 uppercase tracking-wider">Pick a chapter</h2>
                    {chapters === null ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 text-[#39FF14] animate-spin" /></div>
                    ) : chapters.length === 0 ? (
                        <p className="text-[#A1BBA1]">No chapters found for this subject.</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {chapters.map((c) => {
                                const color = SUBJECT_COLORS[subject];
                                return (
                                    <button
                                        key={c.chapter}
                                        onClick={() => startChapter(c.chapter)}
                                        className="glass-card p-4 text-left transition hover:-translate-y-1 flex items-center justify-between gap-3"
                                        style={{ borderColor: `${color}25` }}
                                        data-testid={`pick-chapter-${c.chapter}`}
                                    >
                                        <span className="font-bold">{c.chapter}</span>
                                        <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>{c.count} Q</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <h2 className="font-heading text-xl font-bold mb-4 uppercase tracking-wider">Pick a subject</h2>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {SUBJECTS.map((s) => {
                            const color = SUBJECT_COLORS[s.id];
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => isChapter ? setSubject(s.id) : nav(`/quiz?mode=${mode}&subject=${s.id}&limit=10`)}
                                    className="glass-card p-6 text-left transition hover:-translate-y-1 fade-up"
                                    style={{ borderColor: `${color}30` }}
                                    data-testid={`pick-subject-${s.id}`}
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
                                    >
                                        {s.icon}
                                    </div>
                                    <h3 className="font-heading text-xl font-bold mb-1">{s.label}</h3>
                                    <p className="text-sm text-[#A1BBA1]">{s.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
