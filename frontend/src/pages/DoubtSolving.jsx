import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Sparkles, Send, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function DoubtSolving() {
    const [messages, setMessages] = useState([]); // [{ role: 'user'|'ai', text }]
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [remaining, setRemaining] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        api.get("/doubt/history").then(r => {
            const hist = [];
            r.data.history.forEach(h => {
                hist.push({ role: "user", text: h.question });
                hist.push({ role: "ai", text: h.answer });
            });
            setMessages(hist);
        }).catch(() => {}).finally(() => setLoadingHistory(false));
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const send = async () => {
        const question = input.trim();
        if (!question || sending) return;
        setInput("");
        setMessages(m => [...m, { role: "user", text: question }]);
        setSending(true);
        try {
            const r = await api.post("/doubt/ask", { question });
            setMessages(m => [...m, { role: "ai", text: r.data.answer }]);
            setRemaining(r.data.remaining_today);
        } catch (e) {
            const msg = e.response?.data?.detail || "Something went wrong — try again";
            toast.error(msg);
            setMessages(m => [...m, { role: "ai", text: `⚠️ ${msg}` }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
            <div className="mb-4 fade-up">
                <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-1">Stuck on something?</p>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text)] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[var(--accent)]" />AI Doubt Solving
                </h1>
                {remaining !== null && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">{remaining} questions left today</p>
                )}
            </div>

            <div className="flex-1 glass-card p-4 sm:p-5 mb-4 overflow-y-auto space-y-4" style={{ maxHeight: "60vh" }}>
                {loadingHistory ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <Sparkles className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-[var(--text-secondary)] text-sm">Ask any Biology, Physics, or Chemistry doubt — I'll explain it NEET-style.</p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-[var(--accent)]" : "bg-[var(--accent)]/10"}`}>
                                {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-[var(--accent)]" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                                m.role === "user" ? "bg-[var(--accent)] text-white" : "bg-[var(--card-hover)] text-[var(--text)]"
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))
                )}
                {sending && (
                    <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        <div className="bg-[var(--card-hover)] rounded-2xl px-4 py-2.5">
                            <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="e.g. Why is the Krebs cycle called amphibolic?"
                    disabled={sending}
                    className="input-base flex-1 text-sm"
                />
                <button onClick={send} disabled={sending || !input.trim()}
                    className="neon-btn px-4 shrink-0 disabled:opacity-40">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
