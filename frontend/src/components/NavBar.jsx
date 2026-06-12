import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import LevelBadge from "@/components/LevelBadge";
import { LogOut, Crown } from "lucide-react";

export default function NavBar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const linkCls = (p) =>
        `px-3 py-2 text-sm uppercase tracking-wider font-bold transition ${
            loc.pathname.startsWith(p) ? "text-[#39FF14]" : "text-white/70 hover:text-white"
        }`;

    return (
        <header className="sticky top-0 z-40 border-b border-[#39FF14]/15 bg-[#050805]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <Link to="/dashboard" className="flex items-center gap-2" data-testid="brand-link">
                    <Crown className="w-6 h-6 text-[#39FF14]" />
                    <span className="font-heading font-black text-lg sm:text-xl tracking-tight">
                        KING NEET <span className="text-[#39FF14] glow-text">AIR</span>
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-2">
                    <Link to="/dashboard" className={linkCls("/dashboard")} data-testid="nav-dashboard">Dashboard</Link>
                    <Link to="/play" className={linkCls("/play")} data-testid="nav-play">Play</Link>
                    <Link to="/history" className={linkCls("/history")} data-testid="nav-history">History</Link>
                    <Link to="/leaderboard" className={linkCls("/leaderboard")} data-testid="nav-leaderboard">Leaderboard</Link>
                    {user?.username && (
                        <Link to={`/u/${user.username}`} className={linkCls("/u/")} data-testid="nav-profile">Profile</Link>
                    )}
                    {user?.is_admin && (
                        <Link to="/admin" className={linkCls("/admin")} data-testid="nav-admin">Admin</Link>
                    )}
                </nav>
                <div className="flex items-center gap-3">
                    {user && (
                        <>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="font-mono text-xs text-white/60">@{user.username}</span>
                                <span className="font-mono text-sm text-[#39FF14]" data-testid="navbar-xp">{user.total_xp} XP</span>
                            </div>
                            <LevelBadge level={user.level} size="sm" />
                            {user.picture ? (
                                <img src={user.picture} alt="" className="w-9 h-9 rounded-full border border-[#39FF14]/40" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/40 flex items-center justify-center text-sm font-bold">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                            <button
                                onClick={async () => { await logout(); nav("/"); }}
                                className="text-white/60 hover:text-[#FF3B30] transition"
                                title="Logout"
                                data-testid="logout-btn"
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
