import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import { Trophy, Loader2, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Privacy: Initials only
function Avatar({ name }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "??";
    const colors = ["#7C3AED", "#2563EB", "#059669", "#DC2626", "#D97706", "#DB2777"];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white border border-white/20 flex-shrink-0"
            style={{ background: colors[idx] }}>
            {initials}
        </div>
    );
}

const TABS = [
    { id: "all_time", label: "All-Time" },
    { id: "biweekly", label: "14-Day 🏆", special: true },
    { id: "weekly", label: "Weekly" },
    { id: "daily", label: "Daily" },
];

export default function Leaderboard() {
    const [period, setPeriod] = useState("all_time");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [daysLeft, setDaysLeft] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.get("/leaderboard", { params: { period } });
                setRows(r.data);
                // Calculate days left in 14-day cycle
                if (period === "biweekly") {
                    const now = new Date();
                    const dayOfCycle = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % 14;
                    setDaysLeft(14 - dayOfCycle);
                }
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [period]);

    const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

    // 14-day leaderboard: show level change indicators
    const getLevelChange = (rank) => {
        if (rank <= 6) return { icon: <TrendingUp className="w-3 h-3" />, color: "#39FF14", label: "Level Up!" };
        if (rank <= 8) return { icon: <Minus className="w-3 h-3" />, color: "#FFD700", label: "Same" };
        if (rank <= 12) return { icon: <TrendingDown className="w-3 h-3" />, color: "#FF3B30", label: "Level Down" };
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="fade-up mb-8">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Hall of NEET</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black">
                    Leader<span className="text-[#39FF14] glow-text">board</span>
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setPeriod(t.id)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                            period === t.id
                                ? "bg-[#39FF14] text-black"
                                : "border border-[#39FF14]/30 text-white/70 hover:text-white"
                        }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* 14-day Banner */}
            {period === "biweekly" && (
                <div className="glass-card p-4 mb-6 border border-[#FFD700]/30 bg-[#FFD700]/5">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#FFD700]" />
                        <div>
                            <div className="font-bold text-[#FFD700] text-sm">14-Day Leaderboard Reset</div>
                            <div className="text-white/50 text-xs mt-0.5">
                                {daysLeft} days left • Top 6 → Level UP ⬆️ • Rank 8-12 → Level DOWN ⬇️
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-[#39FF14]">
                            <TrendingUp className="w-3 h-3" /> Rank 1-6 → Level Up
                        </div>
                        <div className="flex items-center gap-1.5 text-[#FFD700]">
                            <Minus className="w-3 h-3" /> Rank 7-8 → Same
                        </div>
                        <div className="flex items-center gap-1.5 text-[#FF3B30]">
                            <TrendingDown className="w-3 h-3" /> Rank 9-12 → Level Down
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
                </div>
            ) : rows.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="font-mono uppercase tracking-widest text-sm text-white/50">No rankings yet.</p>
                    <p className="text-[#A1BBA1] mt-2">Be the first — go play!</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[#39FF14]/15 font-mono text-xs uppercase tracking-widest text-white/40">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Player</div>
                        <div className="col-span-3 text-center">Level</div>
                        <div className="col-span-2 text-right">XP</div>
                    </div>

                    {rows.map((r, i) => {
                        const change = period === "biweekly" ? getLevelChange(i + 1) : null;
                        return (
                            <div key={r.user_id}
                                className="grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-white/5 hover:bg-[#39FF14]/5 transition">
                                {/* Rank */}
                                <div className="col-span-1 font-mono font-bold text-lg"
                                    style={{ color: i < 3 ? podiumColors[i] : "#fff" }}>
                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                                </div>

                                {/* Player — Privacy: Initials only, no Google photo */}
                                <div className="col-span-6 flex items-center gap-3 min-w-0">
                                    <Avatar name={r.name} />
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">@{r.username}</div>
                                        <div className="font-mono text-xs text-[#A1BBA1]">
                                            {r.questions_answered || 0} answered
                                        </div>
                                    </div>
                                </div>

                                {/* Level */}
                                <div className="col-span-3 flex flex-col items-center gap-1">
                                    <LevelBadge level={r.level} size="sm" />
                                    {change && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold"
                                            style={{ color: change.color }}>
                                            {change.icon} {change.label}
                                        </div>
                                    )}
                                </div>

                                {/* XP */}
                                <div className="col-span-2 text-right font-mono font-bold text-[#39FF14]">
                                    {(r.xp || r.total_xp || 0).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
