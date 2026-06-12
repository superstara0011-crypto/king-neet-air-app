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
            const hash = loc.hash || window.location.hash;
            const m = hash.match(/session_id=([^&]+)/);
            if (!m) { nav("/"); return; }
            const session_id = decodeURIComponent(m[1]);
            try {
                const r = await api.post("/auth/session", { session_id });
                setUser(r.data.user);
                // Clear the hash and refetch to get level info
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
                <p className="font-mono text-sm uppercase tracking-widest text-[#39FF14]">Authenticating…</p>
            </div>
        </div>
    );
}
