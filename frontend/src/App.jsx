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
import Tracker from "@/pages/Tracker";
import Mistakes from "@/pages/Mistakes";
import LiveQuizAttempt, { LiveQuizList } from "@/pages/LiveQuiz";

function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#39FF14]/30 border-t-[#39FF14] animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/" replace />;
    return (
        <>
            <NavBar />
            {children}
        </>
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
                    theme="dark"
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#0a110a",
                            border: "1px solid rgba(57,255,20,0.3)",
                            color: "#fff",
                            fontFamily: "Outfit, sans-serif",
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
