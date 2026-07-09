import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Dumbbell, LineChart, Trophy, MoreHorizontal,
    User, StickyNote, BookOpen, XCircle, MessageCircleQuestion,
    ShieldCheck, LogOut, X, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const TABS = [
    { id: "home", label: "Home", path: "/dashboard", icon: Home },
    { id: "practice", label: "Practice", path: "/play", icon: Dumbbell },
    { id: "progress", label: "Progress", path: "/tracker", icon: LineChart },
    { id: "rank", label: "Rank", path: "/leaderboard", icon: Trophy },
];

const MORE_ITEMS = [
    { label: "Tracker", path: "/tracker", icon: LineChart },
    { label: "Notes", path: "/notes", icon: StickyNote },
    { label: "Revision", path: "/revision", icon: BookOpen },
    { label: "Mistakes", path: "/mistakes", icon: XCircle },
    { label: "Leaderboards", path: "/leaderboard", icon: Trophy },
    { label: "AI Doubt Solving", path: "/doubt-solving", icon: MessageCircleQuestion },
];

export default function BottomNav() {
    const loc = useLocation();
    const nav = useNavigate();
    const { user, logout } = useAuth();
    const [moreOpen, setMoreOpen] = useState(false);

    const isActive = (path) => loc.pathname === path || loc.pathname.startsWith(path + "/");

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-xl"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="flex items-center justify-around px-1 py-2">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = isActive(tab.path);
                        return (
                            <Link key={tab.id} to={tab.path} className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]">
                                <Icon className="w-5 h-5" style={{ color: active ? "#6C63FF" : "#9CA3AF" }} />
                                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: active ? "#6C63FF" : "#9CA3AF" }}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                    <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]">
                        <MoreHorizontal className="w-5 h-5 text-[#9CA3AF]" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">More</span>
                    </button>
                </div>
            </nav>

            {moreOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="relative w-full bg-white border-t border-[#E5E7EB] rounded-t-3xl p-5 shadow-[0_-8px_30px_rgba(17,24,39,0.12)]"
                        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-[#E5E7EB] mx-auto mb-5" />
                        <div className="space-y-1">
                            {MORE_ITEMS.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.path} to={item.path} onClick={() => setMoreOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8FAFC] transition">
                                        <Icon className="w-5 h-5 text-[#6B7280]" />
                                        <span className="font-semibold text-sm text-[#111827]">{item.label}</span>
                                    </Link>
                                );
                            })}
                            {user?.username && (
                                <Link to={`/u/${user.username}`} onClick={() => setMoreOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8FAFC] transition">
                                    <User className="w-5 h-5 text-[#6B7280]" />
                                    <span className="font-semibold text-sm text-[#111827]">Profile</span>
                                </Link>
                            )}
                            <Link to="/settings" onClick={() => setMoreOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8FAFC] transition">
                                <Settings className="w-5 h-5 text-[#6B7280]" />
                                <span className="font-semibold text-sm text-[#111827]">Settings</span>
                            </Link>
                            {user?.is_admin && (
                                <Link to="/admin" onClick={() => setMoreOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FEF3C7]/40 transition">
                                    <ShieldCheck className="w-5 h-5 text-[#B45309]" />
                                    <span className="font-semibold text-sm text-[#B45309]">Admin</span>
                                </Link>
                            )}
                            <button onClick={async () => { setMoreOpen(false); await logout(); nav("/"); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FEF2F2] transition text-left">
                                <LogOut className="w-5 h-5 text-[#EF4444]" />
                                <span className="font-semibold text-sm text-[#EF4444]">Logout</span>
                            </button>
                        </div>
                        <button onClick={() => setMoreOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
