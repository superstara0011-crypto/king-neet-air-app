import React from "react";
import { Crown } from "lucide-react";

export default function PremiumBadge({ size = "md" }) {
    const sizeCls = size === "sm" ? "text-[9px] px-2 py-0.5 gap-0.5" : "text-xs px-3 py-1 gap-1";
    const iconCls = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
    return (
        <span
            className={`inline-flex items-center rounded-full font-black uppercase tracking-wider border border-[#FFD700]/70 ${sizeCls}`}
            style={{
                color: "#FFD700",
                background: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,165,0,0.10))",
                textShadow: "0 0 10px rgba(255,215,0,0.8)",
                boxShadow: "0 0 12px rgba(255,215,0,0.35)",
            }}
            data-testid="premium-badge"
        >
            <Crown className={iconCls} />
            <span>Premium</span>
        </span>
    );
}
