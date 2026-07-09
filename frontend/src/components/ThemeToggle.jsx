import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function getInitialTheme() {
    try {
        const saved = localStorage.getItem("theme");
        return saved === "dark" || saved === "light" ? saved : "light";
    } catch {
        return "light";
    }
}

export function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
}

export default function ThemeToggle({ variant = "icon" }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));

    if (variant === "full") {
        return (
            <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
            >
                {theme === "light" ? <Moon className="w-[18px] h-[18px] shrink-0" /> : <Sun className="w-[18px] h-[18px] shrink-0" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text)] transition-all"
        >
            {theme === "light" ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </button>
    );
}
