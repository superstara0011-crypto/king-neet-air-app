import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext({ user: null, loading: true, refresh: () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const r = await api.get("/auth/me");
            setUser(r.data);
        } catch (e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // CRITICAL: If returning from OAuth callback, skip the /me check.
        // AuthCallback will exchange the session_id and establish the session first.
        if (window.location.hash?.includes("session_id=")) {
            setLoading(false);
            return;
        }
        refresh();
    }, [refresh]);

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.warn("logout request failed", err);
        }
        setUser(null);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, refresh, logout, setUser }}>
            {children}
        </AuthCtx.Provider>
    );
}
