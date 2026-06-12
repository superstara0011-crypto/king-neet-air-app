import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import LevelBadge from "@/components/LevelBadge";
import PremiumBadge from "@/components/PremiumBadge";
import { Loader2, Target, Trophy, Zap, BookOpen, Flame } from "lucide-react";

export default function Profile() {
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.get(`/profile/${username}`);
                setData(r.data);
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [username]);

    if (loading) return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
            <p className="font-heading text-2xl mb-2">Profile not found</p>
            <p className="text-[#A1BBA1]">No user with @{username}</p>
        </div>
    );

    const level = data.level;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="glass-card p-8 fade-up relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#39FF14]/15 blur-3xl rounded-full pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-start gap-6">
                    {data.picture ? (
                        <img src={data.picture} alt="" className="w-24 h-24 rounded-2xl border-2 border-[#39FF14]/50" />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-[#39FF14]/15 border-2 border-[#39FF14]/50 flex items-center justify-center text-4xl font-black">
                            {data.name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="font-heading text-3xl sm:text-4xl font-black" data-testid="profile-name">{data.name}</h1>
                        <p className="font-mono text-sm text-[#A1BBA1] mt-1" data-testid="profile-username">@{data.username}</p>
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <LevelBadge level={level} size="lg" />
                            {data.is_premium && <PremiumBadge size="md" />}
                            <span className="font-mono text-sm text-white/60">Global Rank: <span className="text-[#39FF14] font-bold" data-testid="profile-rank">#{data.rank}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <Stat icon={<Zap />} label="Total XP" value={data.total_xp} color="#39FF14" testid="profile-xp" />
                <Stat icon={<Flame />} label="Day Streak" value={data.streak ?? 0} color="#FF6B00" testid="profile-streak" />
                <Stat icon={<Target />} label="Accuracy" value={`${data.accuracy}%`} color="#00F0FF" testid="profile-accuracy" />
                <Stat icon={<Trophy />} label="Correct" value={data.correct_answers} color="#FFD700" testid="profile-correct" />
                <Stat icon={<BookOpen />} label="Answered" value={data.questions_answered} color="#B900FF" testid="profile-answered" />
            </div>

            {data.chapters_completed?.length > 0 && (
                <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold mb-3 uppercase tracking-wider">Chapters Completed</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.chapters_completed.map((c) => (
                            <span key={c} className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#39FF14]/30 bg-[#39FF14]/10 text-[#39FF14]">
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ icon, label, value, color, testid }) {
    return (
        <div className="glass-card p-5" data-testid={testid}>
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
                <span className="w-4 h-4">{icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
            </div>
            <div className="font-mono text-2xl font-bold">{value}</div>
        </div>
    );
}
