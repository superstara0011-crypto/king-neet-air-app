import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import LevelBadge from "@/components/LevelBadge";
import ThemeToggle from "@/components/ThemeToggle";
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
            className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-black text-white`}
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
        `px-3 py-2 text-sm font-semibold transition rounded-lg ${
            loc.pathname.startsWith(p)
                ? "text-[#6C63FF] bg-[var(--accent)]/10"
                : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]"
        }`;

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src="/logo-navbar.png" alt="King NEET AIR" className="w-9 h-9 rounded-full" />
                    <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-[var(--text)]">
                        KING NEET <span className="text-[#6C63FF]">AIR</span>
                    </span>
                </Link>

                {/* Nav Links — tablet-range fallback (Sidebar takes over at lg+) */}
                <nav className="hidden md:flex lg:hidden items-center gap-1">
                    <Link to="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>
                    <Link to="/play" className={linkCls("/play")}>Play</Link>
                    <Link to="/tracker" className={linkCls("/tracker")}>Tracker</Link>
                    <Link to="/leaderboard" className={linkCls("/leaderboard")}>Leaderboard</Link>
                    <Link to="/mistakes" className={linkCls("/mistakes")}>Mistakes</Link>
                    {user?.username && (
                        <Link to={`/u/${user.username}`} className={linkCls("/u/")}>Profile</Link>
                    )}
                    {user?.is_admin && (
                        <Link to="/admin" className={`${linkCls("/admin")} text-[#B45309]`}>Admin</Link>
                    )}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {user && (
                        <>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs text-[var(--text-muted)]">@{user.username}</span>
                                <span className="text-sm text-[#6C63FF] font-bold">{user.total_xp?.toLocaleString()} XP</span>
                            </div>
                            <LevelBadge level={user.level} size="sm" />
                            {/* ✅ Privacy: Always show initials, never Google photo */}
                            <Avatar name={user.name} />
                            <button
                                onClick={async () => { await logout(); nav("/"); }}
                                className="text-[var(--text-muted)] hover:text-[#EF4444] transition"
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
