import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import PremiumBadge from "@/components/PremiumBadge";
import { Trophy, Loader2 } from "lucide-react";

const TABS = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "all_time", label: "All-Time" },
];

export default function Leaderboard() {
    const [period, setPeriod] = useState("all_time");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.get("/leaderboard", { params: { period } });
                setRows(r.data);
            } catch (e) {
                setRows([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [period]);

    const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="fade-up">
                <p className="font-mono uppercase tracking-widest text-xs text-[#39FF14] mb-2">Hall of NEET</p>
                <h1 className="font-heading text-4xl sm:text-5xl font-black mb-6">
                    Leader<span className="text-[#39FF14] glow-text">board</span>
                </h1>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setPeriod(t.id)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition ${
                            period === t.id
                                ? "bg-[#39FF14] text-black"
                                : "border border-[#39FF14]/30 text-white/70 hover:text-white hover:border-[#39FF14]/60"
                        }`}
                        data-testid={`leaderboard-tab-${t.id}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
                </div>
            ) : rows.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="font-mono uppercase tracking-widest text-sm text-white/50">No rankings yet for this period.</p>
                    <p className="text-[#A1BBA1] mt-2">Be the first — go play!</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[#39FF14]/15 font-mono text-xs uppercase tracking-widest text-white/40">
                        <div className="col-span-2 sm:col-span-1">#</div>
                        <div className="col-span-6 sm:col-span-6">Player</div>
                        <div className="col-span-2 sm:col-span-3 text-center">Level</div>
                        <div className="col-span-2 sm:col-span-2 text-right">XP</div>
                    </div>
                    {rows.map((r, i) => (
                        <Link
                            to={`/u/${r.username}`}
                            key={r.user_id}
                            className="grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-white/5 hover:bg-[#39FF14]/5 transition"
                            data-testid={`leaderboard-row-${i}`}
                        >
                            <div className="col-span-2 sm:col-span-1 font-mono font-bold text-lg" style={{ color: i < 3 ? podiumColors[i] : "#fff" }}>
                                {i < 3 ? (i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉") : r.rank}
                            </div>
                            <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0">
                                {r.picture ? (
                                    <img src={r.picture} alt="" className="w-9 h-9 rounded-full border border-[#39FF14]/30 flex-shrink-0" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {r.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="font-bold truncate flex items-center gap-2">
                                        {r.name}
                                        {r.is_premium && <PremiumBadge size="sm" />}
                                    </div>
                                    <div className="font-mono text-xs text-[#A1BBA1] truncate">@{r.username}</div>
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-3 flex justify-center">
                                <LevelBadge level={r.level} size="sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-[#39FF14]">{r.xp}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
