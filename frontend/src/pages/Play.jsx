import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, Clock, Crown, Atom, FlaskConical, Leaf, Layers, BookOpen } from "lucide-react";

export default function Play() {
    const nav = useNavigate();
    const modes = [
        { id: "pyq", title: "PYQ Practice", desc: "Real previous year NEET MCQs · pick a subject", icon: <Trophy className="w-7 h-7" />, color: "#39FF14" },
        { id: "chapter", title: "Chapter Practice", desc: "Drill a single chapter of any subject", icon: <BookOpen className="w-7 h-7" />, color: "#FFD700" },
        { id: "daily_quiz", title: "Daily Quiz", desc: "10 mixed questions · +10 XP daily bonus", icon: <Calendar className="w-7 h-7" />, color: "#00F0FF" },
        { id: "mock_test", title: "Mock Test", desc: "25 mixed questions · timed (1 min/Q)", icon: <Clock className="w-7 h-7" />, color: "#B900FF" },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
            <div className="fade-up">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Practice Hub</p>
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
        </div>
    );
}
