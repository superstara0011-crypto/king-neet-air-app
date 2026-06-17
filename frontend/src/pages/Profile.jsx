import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import LevelBadge from "@/components/LevelBadge";
import PremiumBadge from "@/components/PremiumBadge";
import { Loader2, Target, Trophy, Zap, BookOpen, Flame, Pencil, Check, X, Camera, Trash2 } from "lucide-react";

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser, refresh } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Edit states
    const [editingName, setEditingName] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [uploadingPic, setUploadingPic] = useState(false);
    const fileInputRef = useRef(null);

    const isOwnProfile = currentUser?.username === username;

    const loadProfile = async () => {
        setLoading(true);
        try {
            const r = await api.get(`/profile/${username}`);
            setData(r.data);
            setNameInput(r.data.name || "");
            setUsernameInput(r.data.username || "");
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    // ── Save name ──────────────────────────────────────────────────────────
    async function saveName() {
        const trimmed = nameInput.trim();
        if (!trimmed || trimmed.length < 2) {
            setErrMsg("Name kam se kam 2 characters ka hona chahiye");
            return;
        }
        setSaving(true);
        setErrMsg("");
        try {
            await api.put("/auth/profile", { name: trimmed });
            setData(d => ({ ...d, name: trimmed }));
            setEditingName(false);
            await refresh();
        } catch (e) {
            setErrMsg(e.response?.data?.detail || "Name update fail hua");
        } finally {
            setSaving(false);
        }
    }

    // ── Save username ──────────────────────────────────────────────────────
    async function saveUsername() {
        const trimmed = usernameInput.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
            setErrMsg("Username 3-20 characters: a-z, 0-9, underscore only");
            return;
        }
        setSaving(true);
        setErrMsg("");
        try {
            await api.put("/auth/username", { username: trimmed });
            setData(d => ({ ...d, username: trimmed }));
            setEditingUsername(false);
            await refresh();
            // Redirect to new username URL
            window.history.replaceState(null, "", `/u/${trimmed}`);
        } catch (e) {
            setErrMsg(e.response?.data?.detail || "Username already taken ya invalid hai");
        } finally {
            setSaving(false);
        }
    }

    // ── Upload picture ────────────────────────────────────────────────────
    async function handlePictureSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrMsg("Image 5MB se kam honi chahiye");
            return;
        }

        setUploadingPic(true);
        setErrMsg("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const r = await api.post("/auth/profile/picture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setData(d => ({ ...d, picture: r.data.picture }));
            await refresh();
        } catch (e) {
            setErrMsg(e.response?.data?.detail || "Picture upload fail hua");
        } finally {
            setUploadingPic(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function removePicture() {
        setUploadingPic(true);
        setErrMsg("");
        try {
            await api.delete("/auth/profile/picture");
            setData(d => ({ ...d, picture: "" }));
            await refresh();
        } catch (e) {
            setErrMsg("Picture remove nahi hui");
        } finally {
            setUploadingPic(false);
        }
    }

    if (loading) return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
            <p className="font-heading text-2xl mb-2">Profile not found</p>
            <p className="text-[#A1BBA1]">No user with @{username}</p>
        </div>
    );

    const level = data.level;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="glass-card p-8 fade-up relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#39FF14]/15 blur-3xl rounded-full pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start gap-6">

                    {/* ── Avatar with edit overlay ── */}
                    <div className="relative group flex-shrink-0">
                        {data.picture ? (
                            <img src={data.picture} alt="" className="w-24 h-24 rounded-2xl border-2 border-[#39FF14]/50 object-cover" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-[#39FF14]/15 border-2 border-[#39FF14]/50 flex items-center justify-center text-4xl font-black">
                                {data.name?.[0]?.toUpperCase()}
                            </div>
                        )}

                        {isOwnProfile && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPic}
                                    className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                    {uploadingPic
                                        ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        : <Camera className="w-6 h-6 text-white" />
                                    }
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handlePictureSelect}
                                />
                                {data.picture && (
                                    <button
                                        onClick={removePicture}
                                        disabled={uploadingPic}
                                        title="Remove picture"
                                        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex-1 w-full">

                        {/* ── Name (editable) ── */}
                        {editingName ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    autoFocus
                                    value={nameInput}
                                    onChange={e => setNameInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && saveName()}
                                    className="font-heading text-2xl sm:text-3xl font-black bg-white/5 border border-[#39FF14]/40 rounded-lg px-3 py-1 outline-none focus:border-[#39FF14] text-white w-full max-w-sm"
                                    maxLength={40}
                                />
                                <button onClick={saveName} disabled={saving} className="p-2 rounded-lg bg-[#39FF14]/15 hover:bg-[#39FF14]/25 transition">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#39FF14]" /> : <Check className="w-4 h-4 text-[#39FF14]" />}
                                </button>
                                <button onClick={() => { setEditingName(false); setNameInput(data.name); setErrMsg(""); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                    <X className="w-4 h-4 text-white/60" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="font-heading text-3xl sm:text-4xl font-black" data-testid="profile-name">{data.name}</h1>
                                {isOwnProfile && (
                                    <button onClick={() => setEditingName(true)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition">
                                        <Pencil className="w-4 h-4 text-white/40" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ── Username (editable) ── */}
                        {editingUsername ? (
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-mono text-sm text-[#A1BBA1]">@</span>
                                <input
                                    autoFocus
                                    value={usernameInput}
                                    onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                    onKeyDown={e => e.key === "Enter" && saveUsername()}
                                    className="font-mono text-sm bg-white/5 border border-[#39FF14]/40 rounded-lg px-3 py-1 outline-none focus:border-[#39FF14] text-white w-48"
                                    maxLength={20}
                                />
                                <button onClick={saveUsername} disabled={saving} className="p-1.5 rounded-lg bg-[#39FF14]/15 hover:bg-[#39FF14]/25 transition">
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#39FF14]" /> : <Check className="w-3.5 h-3.5 text-[#39FF14]" />}
                                </button>
                                <button onClick={() => { setEditingUsername(false); setUsernameInput(data.username); setErrMsg(""); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                    <X className="w-3.5 h-3.5 text-white/60" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 group mt-1">
                                <p className="font-mono text-sm text-[#A1BBA1]" data-testid="profile-username">@{data.username}</p>
                                {isOwnProfile && (
                                    <button onClick={() => setEditingUsername(true)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition">
                                        <Pencil className="w-3 h-3 text-white/40" />
                                    </button>
                                )}
                            </div>
                        )}

                        {errMsg && (
                            <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 inline-block">
                                {errMsg}
                            </div>
                        )}

                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <LevelBadge level={level} size="lg" />
                            {data.is_premium && <PremiumBadge size="md" />}
                            <span className="font-mono text-sm text-white/60">Global Rank: <span className="text-[#39FF14] font-bold" data-testid="profile-rank">#{data.rank}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <Stat icon={<Zap />} label="Total XP" value={data.total_xp} color="#39FF14" testid="profile-xp" />
                <Stat icon={<Flame />} label="Day Streak" value={data.streak ?? 0} color="#FF6B00" testid="profile-streak" />
                <Stat icon={<Target />} label="Accuracy" value={`${data.accuracy}%`} color="#00F0FF" testid="profile-accuracy" />
                <Stat icon={<Trophy />} label="Correct" value={data.correct_answers} color="#FFD700" testid="profile-correct" />
                <Stat icon={<BookOpen />} label="Answered" value={data.questions_answered} color="#B900FF" testid="profile-answered" />
            </div>

            {data.chapters_completed?.length > 0 && (
                <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold mb-3 uppercase tracking-wider">Chapters Completed</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.chapters_completed.map((c) => (
                            <span key={c} className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#39FF14]/30 bg-[#39FF14]/10 text-[#39FF14]">
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ icon, label, value, color, testid }) {
    return (
        <div className="glass-card p-5" data-testid={testid}>
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
                <span className="w-4 h-4">{icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
            </div>
            <div className="font-mono text-2xl font-bold">{value}</div>
        </div>
    );
}
