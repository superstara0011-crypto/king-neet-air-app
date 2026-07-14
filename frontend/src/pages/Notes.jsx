import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    Loader2, Download, FileText, Image as ImageIcon, BookOpen, Target, Beaker,
    Sparkles, X, ChevronDown, ChevronUp,
} from "lucide-react";

const SUBJECTS = [
    { id: "all", label: "All" },
    { id: "biology", label: "Biology", icon: BookOpen },
    { id: "physics", label: "Physics", icon: Target },
    { id: "chemistry", label: "Chemistry", icon: Beaker },
];

// Cloudinary serves files inline by default; fl_attachment forces a real download.
const toDownloadUrl = (url) => url.replace("/upload/", "/upload/fl_attachment/");

export default function Notes() {
    const [notes, setNotes] = useState(null);
    const [subject, setSubject] = useState("all");
    const [expanded, setExpanded] = useState(null);
    const [imageViewer, setImageViewer] = useState(null);

    useEffect(() => {
        api.get("/notes", { params: { subject } }).then(r => setNotes(r.data)).catch(() => setNotes([]));
    }, [subject]);

    const handleDownload = (note) => {
        const a = document.createElement("a");
        a.href = toDownloadUrl(note.file_url);
        a.download = note.file_name || note.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6 fade-up">
                <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-1">Study Library</p>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--text)]">Notes</h1>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => setSubject(s.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
                            subject === s.id ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                        }`}>
                        {s.icon && <s.icon className="w-3.5 h-3.5" />}
                        {s.label}
                    </button>
                ))}
            </div>

            {!notes ? (
                <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" /></div>
            ) : notes.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Sparkles className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)]">No notes uploaded yet for this subject.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {notes.map(n => {
                        const hasFile = !!n.file_url;
                        const hasImage = !!n.image_url && !hasFile;
                        const hasContent = !!n.content?.trim();
                        const isExpanded = expanded === n.id;

                        return (
                            <div key={n.id} className="glass-card p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                                        {hasFile ? <FileText className="w-5 h-5 text-[var(--accent)]" /> : <ImageIcon className="w-5 h-5 text-[var(--accent)]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-[var(--text)] truncate">{n.title}</div>
                                        <div className="text-xs text-[var(--text-muted)] capitalize">{n.subject}{n.chapter ? ` · ${n.chapter}` : ""}</div>
                                    </div>
                                    {hasFile && (
                                        <button onClick={() => handleDownload(n)}
                                            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {hasImage && (
                                    <button onClick={() => setImageViewer(n.image_url)} className="block mt-3 w-full">
                                        <img src={n.image_url} alt={n.title} className="w-full max-h-40 object-cover rounded-xl border border-[var(--border)]" />
                                    </button>
                                )}

                                {hasContent && (
                                    <div className="mt-3">
                                        <button onClick={() => setExpanded(isExpanded ? null : n.id)}
                                            className="flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
                                            {isExpanded ? "Hide" : "Read"} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                        {isExpanded && (
                                            <p className="mt-2 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{n.content}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {imageViewer && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setImageViewer(null)}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <img src={imageViewer} alt="" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
