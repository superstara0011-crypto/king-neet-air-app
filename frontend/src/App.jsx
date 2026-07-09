import React from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Play from "@/pages/Play";
import ModeSelect from "@/pages/ModeSelect";
import Quiz from "@/pages/Quiz";
import Result from "@/pages/Result";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import History from "@/pages/History";
import NavBar from "@/components/NavBar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Tracker from "@/pages/Tracker";
import Mistakes from "@/pages/Mistakes";
import ComingSoon from "@/pages/ComingSoon";
import LiveQuizAttempt, { LiveQuizList } from "@/pages/LiveQuiz";

function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--card-hover)] gap-6 px-6">
            <img src="/icon-256.png" alt="King NEET AIR" className="w-24 h-24 rounded-3xl animate-pulse" />
            <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Focused. Disciplined. <span className="text-[#6C63FF]">AIR</span> Ready.
                </p>
            </div>
            <div className="w-8 h-8 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/" replace />;
    return (
        <div className="lg:flex min-h-screen bg-[var(--card-hover)]">
            <Sidebar />
            <div className="flex-1 min-w-0">
                <div className="lg:hidden">
                    <NavBar />
                </div>
                <div className="pb-20 lg:pb-0">{children}</div>
                <BottomNav />
            </div>
        </div>
    );
}

function AppRouter() {
    const location = useLocation();
    // Synchronous detection of OAuth callback - critical to handle BEFORE auth check
    if (location.hash?.includes("session_id=")) {
        return <AuthCallback />;
    }

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/play" element={<Protected><Play /></Protected>} />
            <Route path="/play/:mode" element={<Protected><ModeSelect /></Protected>} />
            <Route path="/quiz" element={<Protected><Quiz /></Protected>} />
            <Route path="/result" element={<Protected><Result /></Protected>} />
            <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
            <Route path="/history" element={<Protected><History /></Protected>} />
            <Route path="/u/:username" element={<Protected><Profile /></Protected>} />
            <Route path="/admin" element={<Protected><Admin /></Protected>} />
            <Route path="/tracker" element={<Protected><Tracker /></Protected>} />
            <Route path="/mistakes" element={<Protected><Mistakes /></Protected>} />
            <Route path="/notes" element={<Protected><ComingSoon title="Notes" /></Protected>} />
            <Route path="/revision" element={<Protected><ComingSoon title="Revision" /></Protected>} />
            <Route path="/doubt-solving" element={<Protected><ComingSoon title="AI Doubt Solving" /></Protected>} />
            <Route path="/settings" element={<Protected><ComingSoon title="Settings" /></Protected>} />
            <Route path="/live-quiz" element={<Protected><LiveQuizList /></Protected>} />
            <Route path="/live-quiz/:id" element={<Protected><LiveQuizAttempt /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRouter />
                <Toaster
                    theme="light"
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#fff",
                            border: "1px solid #E5E7EB",
                            color: "#111827",
                            fontFamily: "Inter, sans-serif",
                            boxShadow: "0 4px 20px rgba(17,24,39,0.08)",
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
