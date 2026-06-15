import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Trophy, Sparkles, BookOpen, Zap, Target, Star, Users, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { API, api } from "@/lib/api";

export default function Landing() {
    const nav = useNavigate();
    const { user, loading } = useAuth();
    const [topRankers, setTopRankers] = useState([]);
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        if (!loading && user) nav("/dashboard");
    }, [user, loading, nav]);

    useEffect(() => {
        api.get("/leaderboard?limit=5").then(r => setTopRankers(r.data?.slice(0, 5) || [])).catch(() => {});
    }, []);

    const handleLogin = async () => {
        setLoginLoading(true);
        try {
            const resp = await fetch(`${API}/auth/google/url`);
            const data = await resp.json();
            if (data.url) {
                sessionStorage.setItem("oauth_state", data.state);
                window.location.href = data.url;
            }
        } catch (e) {
            console.error("Login failed", e);
        } finally {
            setLoginLoading(false);
        }
    };

    const levelTeasers = [
        { name: "Seed", emoji: "🌱", xp: "0–500", color: "#88FF88" },
        { name: "Aspirant", emoji: "⚡", xp: "500–1.5k", color: "#00FFCC" },
        { name: "Scholar", emoji: "🎓", xp: "1.5k–5k", color: "#00A3FF" },
        { name: "Warrior", emoji: "⚔️", xp: "5k–10k", color: "#B900FF" },
        { name: "Champion", emoji: "🏆", xp: "10k–20k", color: "#FF007A" },
        { name: "KING NEET", emoji: "👑", xp: "20k–50k", color: "#FF3B30" },
        { name: "AIR LEGEND", emoji: "🌟", xp: "50k+", color: "#FFD700" },
    ];

    const features = [
        { icon: <BookOpen className="w-6 h-6" />, title: "Chapter-wise Practice", desc: "Practice topic-wise questions from all 3 subjects" },
        { icon: <FileText className="w-6 h-6" />, title: "NEET PYQs", desc: "Previous year questions help you score more" },
        { icon: <Zap className="w-6 h-6" />, title: "Daily Challenge", desc: "Solve daily questions and boost your rank" },
        { icon: <Star className="w-6 h-6" />, title: "Rank Boost", desc: "Compete with thousands of aspirants" },
        { icon: <Trophy className="w-6 h-6" />, title: "Level Up", desc: "Earn XP and become the KING of NEET" },
        { icon: <Crown className="w-6 h-6" />, title: "Premium", desc: "Unlock premium features at just ₹30/month" },
    ];

    const premiumFeatures = [
        "Extra Daily Questions",
        "Advanced PYQs",
        "Detailed Analysis",
        "Premium Badge",
        "Ad-free Experience",
    ];

    const stats = [
        { value: "50,000+", label: "Practice Questions" },
        { value: "10,000+", label: "PYQs" },
        { value: "100+", label: "Mock Tests" },
        { value: "50,000+", label: "Aspirants" },
    ];

    const levelColors = {
        "Seed": "#88FF88", "Aspirant": "#00FFCC", "Scholar": "#00A3FF",
        "Warrior": "#B900FF", "Champion": "#FF007A", "KING NEET": "#FF3B30", "AIR LEGEND": "#FFD700",
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #050B1F 0%, #0A0F2E 50%, #050B1F 100%)" }}>
            {/* NAV */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10" style={{ background: "rgba(5,11,31,0.85)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-2">
                    <Crown className="w-7 h-7 text-yellow-400" />
                    <span className="font-black text-xl tracking-tight">
                        KING NEET <span className="text-yellow-400">AIR</span>
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white/70">
                    <a href="#home" className="hover:text-white transition">Home</a>
                    <a href="#features" className="hover:text-white transition">Practice</a>
                    <a href="#levels" className="hover:text-white transition">Levels</a>
                    <a href="#how" className="hover:text-white transition">How it works</a>
                    <a href="#premium" className="text-yellow-400 hover:text-yellow-300 transition">Premium</a>
                </nav>
                <button onClick={handleLogin} disabled={loginLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-white text-gray-900 hover:bg-gray-100 transition">
                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                    {loginLoading ? "Loading..." : "Login with Google"}
                </button>
            </header>

            {/* HERO */}
            <section id="home" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-start">
                {/* Left */}
                <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono text-xs uppercase tracking-widest text-yellow-400">No coins. Just rank.</span>
                    </div>

                    <div className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">WELCOME TO</div>
                    <h1 className="font-black leading-[0.9] tracking-tighter mb-6" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
                        KING <span className="text-yellow-400">NEET</span> AIR
                    </h1>

                    <p className="text-lg font-bold text-purple-300 mb-2 uppercase tracking-wide">
                        Practice Today, Achieve Tomorrow, Become the King of NEET
                    </p>
                    <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
                        Chapter-wise Practice • PYQs • Daily Challenge • Mock Tests • Rankings
                    </p>

                    <button onClick={handleLogin} disabled={loginLoading}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-lg text-white transition-all hover:scale-105 mb-8"
                        style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        {loginLoading ? "Loading..." : "Continue with Google"}
                    </button>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <div className="font-black text-2xl text-white mb-1">{s.value}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Top Rankers + Premium */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Top Rankers */}
                    <div className="rounded-2xl p-5 border border-yellow-400/20" style={{ background: "rgba(255,215,0,0.05)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="font-black uppercase tracking-widest text-xs text-yellow-400">Top Rankers Today</span>
                        </div>
                        <div className="space-y-3">
                            {topRankers.length > 0 ? topRankers.map((u, i) => (
                                <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-400 text-black" : "bg-white/10 text-white"}`}>
                                        {i + 1}
                                    </div>
                                    {u.picture && <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">@{u.username || u.name}</div>
                                        <div className="text-xs" style={{ color: levelColors[u.level?.name] || "#888" }}>Lv. {u.level?.name}</div>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-yellow-400">XP {u.total_xp?.toLocaleString()}</div>
                                </div>
                            )) : (
                                // Placeholder rankers
                                [
                                    { rank: 1, name: "@neet_king", level: "KING NEET", xp: "52,680" },
                                    { rank: 2, name: "@bio_master", level: "Champion", xp: "41,230" },
                                    { rank: 3, name: "@physics_pro", level: "Champion", xp: "38,750" },
                                    { rank: 4, name: "@dr_surgical", level: "Scholar", xp: "29,420" },
                                    { rank: 5, name: "@chem_legend", level: "Scholar", xp: "27,890" },
                                ].map((u) => (
                                    <div key={u.rank} className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${u.rank === 1 ? "bg-yellow-400 text-black" : u.rank === 2 ? "bg-gray-300 text-black" : u.rank === 3 ? "bg-orange-400 text-black" : "bg-white/10 text-white"}`}>
                                            {u.rank}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{u.name}</div>
                                            <div className="text-xs text-white/40">Lv. {u.level}</div>
                                        </div>
                                        <div className="font-mono text-xs font-bold text-yellow-400">XP {u.xp}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={handleLogin} className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-400 border border-yellow-400/30 rounded-xl hover:bg-yellow-400/10 transition">
                            View Full Leaderboard →
                        </button>
                    </div>

                    {/* Premium Card */}
                    <div id="premium" className="rounded-2xl p-5 border border-purple-500/30" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))" }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="font-black text-yellow-400 uppercase tracking-widest text-xs">Unlock Premium</span>
                        </div>
                        <div className="font-black text-2xl mb-1">Just <span className="text-yellow-400">₹30</span> <span className="text-white/50 text-base font-normal">/ Month</span></div>
                        <div className="space-y-2 mb-4">
                            {premiumFeatures.map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleLogin}
                            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                            ⚡ Upgrade Now
                        </button>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <p className="font-mono text-xs uppercase tracking-widest text-purple-400 mb-3">Why King NEET AIR?</p>
                    <h2 className="font-black text-3xl sm:text-4xl">Everything you need to <span className="text-yellow-400">crack NEET</span></h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div key={f.title} className="p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition group" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:text-yellow-400 transition" style={{ background: "rgba(124,58,237,0.15)" }}>
                                {f.icon}
                            </div>
                            <h3 className="font-black text-lg mb-2">{f.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* LEVELS */}
            <section id="levels" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <p className="font-mono text-xs uppercase tracking-widest text-yellow-400 mb-3">Level Path</p>
                    <h2 className="font-black text-3xl sm:text-4xl">Climb the <span className="text-yellow-400">Throne</span></h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {levelTeasers.map((l) => (
                        <div key={l.name} className="p-5 rounded-2xl border transition hover:scale-105"
                            style={{ borderColor: l.color + "30", background: l.color + "08" }}>
                            <div className="text-4xl mb-3">{l.emoji}</div>
                            <div className="font-black text-lg mb-1" style={{ color: l.color }}>{l.name}</div>
                            <div className="font-mono text-xs text-white/40">{l.xp} XP</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <h2 className="font-black text-3xl sm:text-4xl">How it <span className="text-purple-400">works</span></h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { step: "01", icon: <Zap className="w-6 h-6" />, title: "Pick a mode", body: "PYQ Practice, Daily Quiz, or full Mock Test across Bio/Physics/Chem." },
                        { step: "02", icon: <Sparkles className="w-6 h-6" />, title: "Earn XP", body: "+4 per correct answer, -1 per wrong, +10 chapter & daily bonuses." },
                        { step: "03", icon: <Trophy className="w-6 h-6" />, title: "Rank up", body: "Climb 7 levels from Seed to AIR LEGEND. Top the leaderboards." },
                    ].map((c) => (
                        <div key={c.title} className="p-6 rounded-2xl border border-white/10 relative" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="absolute top-4 right-4 font-black text-4xl text-white/5">{c.step}</div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400" style={{ background: "rgba(124,58,237,0.15)" }}>
                                {c.icon}
                            </div>
                            <h3 className="font-black text-xl mb-2">{c.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{c.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-20 text-center">
                <h2 className="font-black text-3xl sm:text-5xl mb-4">Ready to become <span className="text-yellow-400">KING</span>?</h2>
                <p className="text-white/50 mb-8 text-lg">Join 50,000+ aspirants crushing NEET with XP</p>
                <button onClick={handleLogin} disabled={loginLoading}
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" />
                    {loginLoading ? "Loading..." : "Start for Free →"}
                </button>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 px-4 sm:px-8 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="font-black text-lg">KING NEET <span className="text-yellow-400">AIR</span></span>
                </div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
                    Stay Consistent · Stay Confident · Crack NEET
                </p>
            </footer>
        </div>
    );
}
