import React from "react";
import { LEVEL_COLORS } from "@/lib/api";

export default function LevelBadge({ level, size = "md" }) {
    if (!level) return null;
    const color = LEVEL_COLORS[level.name] || "#39FF14";
    const sizeCls = size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider border ${sizeCls}`}
            style={{
                color,
                borderColor: `${color}80`,
                background: `${color}15`,
                textShadow: `0 0 12px ${color}`,
                boxShadow: `0 0 10px ${color}30`,
            }}
            data-testid="level-badge"
        >
            <span>{level.emoji}</span>
            <span>{level.name}</span>
        </span>
    );
}
