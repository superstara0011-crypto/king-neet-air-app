import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
    LayoutDashboard, Dumbbell, LineChart, ClipboardList, BookOpen, StickyNote,
    XCircle, Trophy, MessageCircleQuestion, User, ShieldCheck, LogOut, Crown,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Practice", path: "/play", icon: Dumbbell },
    { label: "Tracker", path: "/tracker", icon: LineChart },
    { label: "Mock Tests", path: "/play/mock_test", icon: ClipboardList },
    { label: "Revision", path: "/revision", icon: BookOpen },
    { label: "Notes", path: "/notes", icon: StickyNote },
    { label: "Mistakes", path: "/mistakes", icon: XCircle },
    { label: "Leaderboards", path: "/leaderboard", icon: Trophy },
    { label: "AI Doubt Solving", path: "/doubt-solving", icon: MessageCircleQuestion },
];

export default function Sidebar() {
    const loc = useLocation();
    const nav = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (path) => loc.pathname === path || (path !== "/dashboard" && loc.pathname.startsWith(path));

    return (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-[#E5E7EB] px-4 py-6">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 px-2 mb-8">
                <img src="/logo-navbar.png" alt="King NEET AIR" className="w-9 h-9 rounded-xl" />
                <span className="font-heading font-black text-lg text-[#111827] tracking-tight">
                    KING NEET <span className="text-[#6C63FF]">AIR</span>
                </span>
            </Link>

            {/* Nav items */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                active
                                    ? "bg-[#F0EEFF] text-[#6C63FF]"
                                    : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
                            }`}
                        >
                            <Icon className="w-[18px] h-[18px] shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}

                {user?.is_admin && (
                    <Link
                        to="/admin"
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive("/admin") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#B45309] hover:bg-[#FEF3C7]/50"
                        }`}
                    >
                        <ShieldCheck className="w-[18px] h-[18px] shrink-0" />
                        Admin
                    </Link>
                )}
            </nav>

            {/* Bottom: Profile + Premium + Logout */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-1">
                {user?.username && (
                    <Link
                        to={`/u/${user.username}`}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive("/u/") ? "bg-[#F0EEFF] text-[#6C63FF]" : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
                        }`}
                    >
                        <User className="w-[18px] h-[18px] shrink-0" />
                        Profile
                    </Link>
                )}

                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#B45309] bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A]/40">
                    <Crown className="w-[18px] h-[18px] shrink-0" />
                    Premium
                </div>

                <button
                    onClick={async () => { await logout(); nav("/"); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-all"
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
