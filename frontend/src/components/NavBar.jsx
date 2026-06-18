import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import LevelBadge from "@/components/LevelBadge";
import { LogOut } from "lucide-react";

// Privacy: Show initials avatar, never Google photo
function Avatar({ name, size = 9 }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";
    const colors = ["#7C3AED", "#2563EB", "#059669", "#DC2626", "#D97706", "#DB2777"];
    const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div
            style={{ background: colors[colorIdx] }}
            className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-black text-white border-2 border-white/20`}
        >
            {initials}
        </div>
    );
}

export default function NavBar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();

    const linkCls = (p) =>
        `px-3 py-2 text-sm uppercase tracking-wider font-bold transition ${
            loc.pathname.startsWith(p)
                ? "text-[#39FF14]"
                : "text-white/70 hover:text-white"
        }`;

    return (
        <header className="sticky top-0 z-40 border-b border-[#39FF14]/15 bg-[#050805]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src="/logo-navbar.png" alt="King NEET AIR" className="w-9 h-9 rounded-lg" />
                    <span className="font-heading font-black text-lg sm:text-xl tracking-tight">
                        KING NEET <span className="text-[#39FF14] glow-text">AIR</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link to="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>
                    <Link to="/play" className={linkCls("/play")}>Play</Link>
                    <Link to="/history" className={linkCls("/history")}>History</Link>
                    <Link to="/leaderboard" className={linkCls("/leaderboard")}>Leaderboard</Link>
                    {user?.username && (
                        <Link to={`/u/${user.username}`} className={linkCls("/u/")}>Profile</Link>
                    )}
                    {user?.is_admin && (
                        <Link to="/admin" className={`${linkCls("/admin")} text-[#FFD700]`}>Admin</Link>
                    )}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {user && (
                        <>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="font-mono text-xs text-white/60">@{user.username}</span>
                                <span className="font-mono text-sm text-[#39FF14] font-bold">{user.total_xp?.toLocaleString()} XP</span>
                            </div>
                            <LevelBadge level={user.level} size="sm" />
                            {/* ✅ Privacy: Always show initials, never Google photo */}
                            <Avatar name={user.name} />
                            <button
                                onClick={async () => { await logout(); nav("/"); }}
                                className="text-white/60 hover:text-[#FF3B30] transition"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export { Avatar };
