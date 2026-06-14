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
            // ✅ Clear token if session expired
            if (e.response?.status === 401) {
                localStorage.removeItem("session_token");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (window.location.pathname === "/auth/callback") {
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
        // ✅ Clear token on logout
        localStorage.removeItem("session_token");
        setUser(null);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, refresh, logout, setUser }}>
            {children}
        </AuthCtx.Provider>
    );
}
