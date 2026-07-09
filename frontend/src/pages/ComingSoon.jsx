import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function ComingSoon({ title = "Coming Soon" }) {
    const nav = useNavigate();
    return (
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F0EEFF] flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-[#6C63FF]" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#111827] mb-2">{title}</h1>
            <p className="text-[#6B7280] mb-8">This page is on its way. We're building it out next.</p>
            <button onClick={() => nav("/dashboard")} className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />Back to Dashboard
            </button>
        </div>
    );
}
