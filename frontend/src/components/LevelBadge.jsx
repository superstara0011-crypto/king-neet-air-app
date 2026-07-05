import React from "react";

// Maps level name -> badge image number (1-10), matching LEVELS order in backend/levels.py
const LEVEL_BADGE_INDEX = {
    "Seed": 1,
    "Sprout": 2,
    "Leaf": 3,
    "Sapling": 4,
    "Scholar": 5,
    "Medic": 6,
    "Healer": 7,
    "Elite": 8,
    "NEET Titan": 9,
    "GOD OF NEET": 10,
};

export default function LevelBadge({ level, size = "md" }) {
    if (!level) return null;
    const color = level.color || "#39FF14";
    const badgeIdx = LEVEL_BADGE_INDEX[level.name] || 1;
    const imgCls = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-9 h-9" : "w-6 h-6";
    const sizeCls = size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${sizeCls}`}
            style={{
                color,
                borderColor: `${color}80`,
                background: `${color}15`,
                textShadow: `0 0 12px ${color}`,
                boxShadow: `0 0 10px ${color}30`,
            }}
            data-testid="level-badge"
        >
            <img
                src={`/badges/badge-level-${badgeIdx}.png`}
                alt=""
                className={`${imgCls} object-contain shrink-0`}
                onError={(e) => { e.target.style.display = "none"; }}
            />
            <span>{level.name}</span>
        </span>
    );
}
