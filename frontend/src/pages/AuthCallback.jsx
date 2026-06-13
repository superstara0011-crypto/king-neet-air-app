import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AuthCallback() {
    const nav = useNavigate();
    const loc = useLocation();
    const { setUser } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;
        (async () => {
            // Get code from URL params (Google OAuth returns ?code=...)
            const params = new URLSearchParams(loc.search);
            const code = params.get("code");
            const state = params.get("state");
            
            if (!code) { nav("/"); return; }

            try {
                const r = await api.post("/auth/google/callback", { code, state });
                setUser(r.data.user);
                window.history.replaceState(null, "", "/dashboard");
                try {
                    const me = await api.get("/auth/me");
                    setUser(me.data);
                } catch {}
                nav("/dashboard", { replace: true });
            } catch (e) {
                console.error(e);
                nav("/", { replace: true });
            }
        })();
    }, []); // eslint-disable-line

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#39FF14]/30 border-t-[#39FF14] animate-spin" />
                <p className="font-mono text-sm uppercase tracking-widest text-[#39FF14]">Signing in with Google…</p>
            </div>
        </div>
    );
}
