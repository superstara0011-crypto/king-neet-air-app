import React from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Trophy, Sparkles, BookOpen, Zap, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Landing() {
    const nav = useNavigate();
    const { user, loading } = useAuth();

    React.useEffect(() => {
        if (!loading && user) nav("/dashboard");
    }, [user, loading, nav]);

    const handleLogin = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + "/dashboard";
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const levelTeasers = [
        { name: "Seed", emoji: "🌱", xp: "0–500", color: "#88FF88" },
        { name: "Scholar", emoji: "🎓", xp: "1.5k–5k", color: "#00A3FF" },
        { name: "Champion", emoji: "🏆", xp: "10k–20k", color: "#FF007A" },
        { name: "KING NEET", emoji: "👑", xp: "20k–50k", color: "#FF3B30" },
        { name: "AIR LEGEND", emoji: "🌟", xp: "50k+", color: "#FFD700" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* NAV */}
            <header className="px-4 sm:px-8 py-5 flex items-center justify-between border-b border-[#39FF14]/15 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-[#39FF14]" />
                    <span className="font-heading font-black text-lg sm:text-xl tracking-tight">
                        KING NEET <span className="text-[#39FF14] glow-text">AIR</span>
                    </span>
                </div>
                <button onClick={handleLogin} className="neon-btn-ghost text-xs sm:text-sm" data-testid="header-login-btn">
                    Sign in
                </button>
            </header>

            {/* HERO */}
            <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-12 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 fade-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39FF14]/30 bg-[#39FF14]/5 mb-6">
                        <Sparkles className="w-4 h-4 text-[#39FF14]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[#39FF14]">No coins. Just rank.</span>
                    </div>
                    <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tighter">
                        Become <span className="text-[#39FF14] glow-text">KING</span><br />
                        of NEET.<br />
                        <span className="text-white/80">Rank with</span> <span className="font-mono text-[#39FF14]">XP</span>.
                    </h1>
                    <p className="mt-6 text-base sm:text-lg text-[#A1BBA1] max-w-xl leading-relaxed">
                        Practice <span className="text-white">PYQs</span>, smash <span className="text-white">Daily Quizzes</span>, take <span className="text-white">Mock Tests</span>.
                        Earn XP, climb levels from <em>Seed</em> to <em>AIR LEGEND</em>, and crush the leaderboard.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <button onClick={handleLogin} className="neon-btn" data-testid="hero-login-btn">
                            Continue with Google →
                        </button>
                        <a href="#how" className="neon-btn-ghost">How it works</a>
                    </div>

                    <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
                        <Stat icon={<BookOpen className="w-4 h-4" />} label="Subjects" value="3" />
                        <Stat icon={<Target className="w-4 h-4" />} label="Modes" value="3" />
                        <Stat icon={<Trophy className="w-4 h-4" />} label="Levels" value="7" />
                    </div>
                </div>

                <div className="lg:col-span-5 fade-up" style={{ animationDelay: "0.15s" }}>
                    <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#39FF14]/20 blur-3xl" />
                        <div className="relative">
                            <div className="font-mono text-xs uppercase tracking-widest text-[#39FF14] mb-3">Level Path</div>
                            <h3 className="font-heading text-2xl font-bold mb-6">Climb the throne</h3>
                            <div className="space-y-3">
                                {levelTeasers.map((l) => (
                                    <div key={l.name} className="flex items-center justify-between px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{l.emoji}</span>
                                            <span className="font-heading font-bold tracking-wide">{l.name}</span>
                                        </div>
                                        <span className="font-mono text-sm" style={{ color: l.color }}>{l.xp} XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* HOW */}
            <section id="how" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-[#39FF14]/10">
                <h2 className="font-heading text-3xl sm:text-4xl font-black mb-10">How it works</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { icon: <Zap className="w-6 h-6" />, title: "Pick a mode", body: "PYQ Practice, Daily Quiz, or full Mock Test across Bio/Physics/Chem." },
                        { icon: <Sparkles className="w-6 h-6" />, title: "Earn XP", body: "+4 per correct answer, -1 per wrong, +10 chapter & daily bonuses." },
                        { icon: <Trophy className="w-6 h-6" />, title: "Rank up", body: "Climb 7 levels from Seed to AIR LEGEND. Top the leaderboards." },
                    ].map((c) => (
                        <div key={c.title} className="glass-card p-6">
                            <div className="w-11 h-11 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center mb-4">
                                {c.icon}
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-2">{c.title}</h3>
                            <p className="text-[#A1BBA1] text-sm leading-relaxed">{c.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-[#39FF14]/10 px-4 sm:px-8 py-6 text-center text-xs text-white/40 font-mono">
                KING NEET AIR · Stay Consistent · Stay Confident · Crack NEET
            </footer>
        </div>
    );
}

function Stat({ icon, label, value }) {
    return (
        <div className="border border-[#39FF14]/15 rounded-lg p-3 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 text-[#39FF14] mb-1">{icon}<span className="text-[10px] uppercase tracking-widest font-mono">{label}</span></div>
            <div className="font-mono text-2xl font-bold">{value}</div>
        </div>
    );
}
