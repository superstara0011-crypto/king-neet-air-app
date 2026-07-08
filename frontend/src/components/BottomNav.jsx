import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Dumbbell, LineChart, Trophy, MoreHorizontal,
    User, Brain, History as HistoryIcon, ShieldCheck, LogOut, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const TABS = [
    { id: "home", label: "Home", path: "/dashboard", icon: Home },
    { id: "practice", label: "Practice", path: "/play", icon: Dumbbell },
    { id: "progress", label: "Progress", path: "/tracker", icon: LineChart },
    { id: "rank", label: "Rank", path: "/leaderboard", icon: Trophy },
];

export default function BottomNav() {
    const loc = useLocation();
    const nav = useNavigate();
    const { user, logout } = useAuth();
    const [moreOpen, setMoreOpen] = useState(false);

    const isActive = (path) => loc.pathname === path || loc.pathname.startsWith(path + "/");

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#D8A7A0]/15 bg-[#050805]/95 backdrop-blur-xl"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="flex items-center justify-around px-1 py-2">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = isActive(tab.path);
                        return (
                            <Link key={tab.id} to={tab.path} className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]">
                                <Icon className="w-5 h-5" style={{ color: active ? "#D8A7A0" : "rgba(255,255,255,0.45)" }} />
                                <span className="text-[10px] font-bold uppercase tracking-wide"
                                    style={{ color: active ? "#D8A7A0" : "rgba(255,255,255,0.45)" }}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                    <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]">
                        <MoreHorizontal className="w-5 h-5 text-white/45" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-white/45">More</span>
                    </button>
                </div>
            </nav>

            {moreOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full bg-[#0a0f0a] border-t border-[#D8A7A0]/20 rounded-t-3xl p-5"
                        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />
                        <div className="space-y-1">
                            {user?.username && (
                                <Link to={`/u/${user.username}`} onClick={() => setMoreOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition">
                                    <User className="w-5 h-5 text-white/60" /><span className="font-bold text-sm">Profile</span>
                                </Link>
                            )}
                            <Link to="/mistakes" onClick={() => setMoreOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition">
                                <Brain className="w-5 h-5 text-white/60" /><span className="font-bold text-sm">Mistake Notebook</span>
                            </Link>
                            <Link to="/history" onClick={() => setMoreOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition">
                                <HistoryIcon className="w-5 h-5 text-white/60" /><span className="font-bold text-sm">History</span>
                            </Link>
                            {user?.is_admin && (
                                <Link to="/admin" onClick={() => setMoreOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition">
                                    <ShieldCheck className="w-5 h-5 text-[#D4A574]" /><span className="font-bold text-sm text-[#D4A574]">Admin</span>
                                </Link>
                            )}
                            <button onClick={async () => { setMoreOpen(false); await logout(); nav("/"); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition text-left">
                                <LogOut className="w-5 h-5 text-[#C97064]" /><span className="font-bold text-sm text-[#C97064]">Logout</span>
                            </button>
                        </div>
                        <button onClick={() => setMoreOpen(false)} className="absolute top-4 right-4 text-white/40">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
