import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
    Loader2, Download, Upload, FileText, X, BookOpen, Target, Beaker, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = [
    { id: "all", label: "All" },
    { id: "biology", label: "Biology", icon: BookOpen },
    { id: "physics", label: "Physics", icon: Target },
    { id: "chemistry", label: "Chemistry", icon: Beaker },
];

const TYPE_LABEL = { notes: "Chapter Notes", formula_sheet: "Formula Sheet", revision: "Quick Revision" };

export default function Notes() {
    const { user } = useAuth();
    const [notes, setNotes] = useState(null);
    const [subject, setSubject] = useState("all");
    const [uploadOpen, setUploadOpen] = useState(false);

    const load = () => {
        api.get("/notes", { params: { subject } }).then(r => setNotes(r.data.notes)).catch(() => setNotes([]));
    };

    useEffect(() => { load(); }, [subject]); // eslint-disable-line

    const handleDownload = async (note) => {
        api.post(`/notes/${note.note_id}/download`).catch(() => {});
        window.open(note.file_url, "_blank");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6 fade-up">
                <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-1">Study Library</p>
                    <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--text)]">Notes</h1>
                </div>
                {user?.is_admin && (
                    <button onClick={() => setUploadOpen(true)} className="neon-btn flex items-center gap-2 text-sm">
                        <Upload className="w-4 h-4" />Upload
                    </button>
                )}
            </div>

            {/* Subject filter */}
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

            {/* Notes grid */}
            {!notes ? (
                <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" /></div>
            ) : notes.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Sparkles className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)]">No notes uploaded yet for this subject.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {notes.map(n => (
                        <div key={n.note_id} className="glass-card p-4 flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-[var(--accent)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] mb-0.5">
                                    {TYPE_LABEL[n.note_type] || "Notes"}
                                </div>
                                <div className="font-bold text-sm text-[var(--text)] truncate">{n.title}</div>
                                <div className="text-xs text-[var(--text-muted)] capitalize">{n.subject}{n.chapter ? ` · ${n.chapter}` : ""}</div>
                            </div>
                            <button onClick={() => handleDownload(n)}
                                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onUploaded={() => { setUploadOpen(false); load(); }} />}
        </div>
    );
}

// ─── Admin upload modal ───────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }) {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("biology");
    const [chapter, setChapter] = useState("");
    const [noteType, setNoteType] = useState("notes");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // NOTE: adjust CLOUD_NAME / UPLOAD_PRESET to match your existing Cloudinary
    // setup (same values used for question-image uploads in the Admin panel).
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    const submit = async () => {
        if (!title.trim() || !file) { toast.error("Add a title and choose a file"); return; }
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            toast.error("Cloudinary isn't configured — check REACT_APP_CLOUDINARY_* env vars");
            return;
        }
        setUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            form.append("upload_preset", UPLOAD_PRESET);
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
                method: "POST",
                body: form,
            });
            const cloudData = await cloudRes.json();
            if (!cloudData.secure_url) throw new Error("Upload failed");

            await api.post("/notes", {
                title: title.trim(),
                subject,
                chapter: chapter.trim(),
                note_type: noteType,
                file_url: cloudData.secure_url,
                file_type: file.type.includes("pdf") ? "pdf" : "image",
            });
            toast.success("Note uploaded!");
            onUploaded();
        } catch (e) {
            toast.error("Upload failed — try again");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading text-xl font-bold text-[var(--text)]">Upload Note</h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-3">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Cell Structure Notes)"
                        className="input-base w-full text-sm" />

                    <div className="grid grid-cols-2 gap-3">
                        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-base text-sm">
                            <option value="biology">Biology</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                        <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="input-base text-sm">
                            <option value="notes">Chapter Notes</option>
                            <option value="formula_sheet">Formula Sheet</option>
                            <option value="revision">Quick Revision</option>
                        </select>
                    </div>

                    <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Chapter (optional)"
                        className="input-base w-full text-sm" />

                    <label className="block">
                        <span className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">File (PDF or image)</span>
                        <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-[var(--text-secondary)]" />
                    </label>

                    <button onClick={submit} disabled={uploading} className="neon-btn w-full text-sm mt-2">
                        {uploading ? "Uploading..." : "Upload Note"}
                    </button>
                </div>
            </div>
        </div>
    );
}
