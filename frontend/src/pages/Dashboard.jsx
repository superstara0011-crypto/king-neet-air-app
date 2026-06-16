import { useState } from "react";

const COLORS = {
  bg: "#080C1A",
  card: "#0D1226",
  border: "#1A2040",
  green: "#39FF14",
  purple: "#7C3AED",
  blue: "#2563EB",
  gold: "#FFD700",
  red: "#FF3B30",
  text: "#E2E8F0",
  muted: "#64748B",
};

const user = {
  name: "Aditya Raj",
  username: "super_star_",
  picture: "https://ui-avatars.com/api/?name=Aditya+Raj&background=7C3AED&color=fff&size=96",
  xp: 4280,
  level: "Scholar",
  streak: 7,
  rank: 42,
  accuracy: 76,
};

const subjects = [
  { name: "Biology", icon: "🧬", color: "#39FF14", chapters: 38, done: 14, questions: 18000 },
  { name: "Physics", icon: "⚛️", color: "#00F0FF", chapters: 29, done: 8, questions: 15000 },
  { name: "Chemistry", icon: "🧪", color: "#B900FF", chapters: 30, done: 11, questions: 14000 },
];

const modes = [
  { id: "pyq", icon: "📜", label: "PYQ Practice", desc: "2015–2024 papers", color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  { id: "daily", icon: "⚡", label: "Daily Challenge", desc: "Streak bonus +10 XP", color: "#39FF14", bg: "rgba(57,255,20,0.08)", badge: "TODAY" },
  { id: "mock", icon: "🎯", label: "Mock Test", desc: "180 Qs • 3 Hours", color: "#00F0FF", bg: "rgba(0,240,255,0.08)" },
  { id: "chapter", icon: "📖", label: "Chapter Quiz", desc: "Topic-wise practice", color: "#B900FF", bg: "rgba(185,0,255,0.08)" },
];

const topRankers = [
  { rank: 1, name: "neet_king", xp: 52680, level: "AIR LEGEND", avatar: "NK" },
  { rank: 2, name: "bio_master", xp: 41230, level: "KING NEET", avatar: "BM" },
  { rank: 3, name: "physics_pro", xp: 38750, level: "KING NEET", avatar: "PP" },
  { rank: 4, name: "dr_surgical", xp: 29420, level: "Champion", avatar: "DS" },
  { rank: 5, name: "chem_legend", xp: 27890, level: "Champion", avatar: "CL" },
];

const recentActivity = [
  { icon: "⚡", text: "Daily Challenge completed", xp: "+14 XP", time: "2h ago", color: "#39FF14" },
  { icon: "📖", text: "Cell Biology chapter done", xp: "+10 XP", time: "5h ago", color: "#00F0FF" },
  { icon: "🎯", text: "Mock Test #12 — 142/180", xp: "+88 XP", time: "1d ago", color: "#FFD700" },
  { icon: "🔥", text: "7-day streak achieved!", xp: "+50 XP", time: "1d ago", color: "#FF3B30" },
];

const levelPath = [
  { name: "Seed", emoji: "🌱", min: 0, max: 500, color: "#88FF88" },
  { name: "Aspirant", emoji: "⚡", min: 500, max: 1500, color: "#00FFCC" },
  { name: "Scholar", emoji: "🎓", min: 1500, max: 5000, color: "#00A3FF" },
  { name: "Warrior", emoji: "⚔️", min: 5000, max: 10000, color: "#B900FF" },
  { name: "Champion", emoji: "🏆", min: 10000, max: 20000, color: "#FF007A" },
  { name: "KING NEET", emoji: "👑", min: 20000, max: 50000, color: "#FF3B30" },
  { name: "AIR LEGEND", emoji: "🌟", min: 50000, max: 999999, color: "#FFD700" },
];

const currentLevel = levelPath.find(l => user.xp >= l.min && user.xp < l.max);
const xpProgress = ((user.xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;

export default function DashboardDesign() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSub, setActiveSub] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', sans-serif", display: "flex" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: 220, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "20px 0", position: "sticky", top: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>👑</span>
            <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.5px" }}>
              KING NEET <span style={{ color: COLORS.gold }}>AIR</span>
            </span>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <img src={user.picture} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${currentLevel.color}` }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>@{user.username}</div>
              <div style={{ fontSize: 11, color: currentLevel.color }}>{currentLevel.emoji} {currentLevel.name}</div>
            </div>
          </div>
          {/* XP Bar */}
          <div style={{ background: COLORS.border, borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{ width: `${xpProgress}%`, height: "100%", background: currentLevel.color, borderRadius: 99, transition: "width 1s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: COLORS.muted }}>{user.xp.toLocaleString()} XP</span>
            <span style={{ fontSize: 10, color: COLORS.muted }}>{currentLevel.max.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {[
            { id: "dashboard", icon: "🏠", label: "Dashboard" },
            { id: "practice", icon: "📚", label: "Practice" },
            { id: "mock", icon: "🎯", label: "Mock Tests" },
            { id: "notes", icon: "📝", label: "Notes" },
            { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
            { id: "history", icon: "📊", label: "My Progress" },
            { id: "profile", icon: "👤", label: "Profile" },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 2, border: "none", cursor: "pointer", background: activeTab === item.id ? `${COLORS.purple}22` : "transparent", color: activeTab === item.id ? "#fff" : COLORS.muted, fontWeight: activeTab === item.id ? 700 : 500, fontSize: 13, transition: "all 0.15s", borderLeft: activeTab === item.id ? `3px solid ${COLORS.purple}` : "3px solid transparent" }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {/* Streak */}
        <div style={{ margin: "12px", padding: "12px", borderRadius: 12, background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 24 }}>🔥</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: "#FF3B30" }}>{user.streak}</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Day Streak</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>Welcome back 👋</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Good Morning, {user.name.split(" ")[0]}!</h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", fontSize: 13, fontWeight: 700, color: COLORS.gold }}>
              👑 Premium
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700, color: COLORS.green }}>
              🏅 Rank #{user.rank}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total XP", value: user.xp.toLocaleString(), icon: "⚡", color: COLORS.green },
            { label: "Accuracy", value: `${user.accuracy}%`, icon: "🎯", color: "#00F0FF" },
            { label: "Global Rank", value: `#${user.rank}`, icon: "🏅", color: COLORS.gold },
            { label: "Day Streak", value: user.streak, icon: "🔥", color: "#FF3B30" },
          ].map(s => (
            <div key={s.label} style={{ background: COLORS.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            {/* Play Modes */}
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>Choose Mode</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {modes.map(m => (
                <button key={m.id} style={{ background: m.bg, border: `1px solid ${m.color}30`, borderRadius: 16, padding: "20px", textAlign: "left", cursor: "pointer", position: "relative", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  {m.badge && <span style={{ position: "absolute", top: 12, right: 12, background: m.color, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 99, letterSpacing: 1 }}>{m.badge}</span>}
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Subjects */}
            <h2 style={{ fontSize: 11, fontWeight: 800, marginBottom: 14, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase" }}>Subjects</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {subjects.map(s => (
                <div key={s.name} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer" }}
                  onClick={() => setActiveSub(s.name)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{s.questions.toLocaleString()}+ questions</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{s.done}/{s.chapters}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>Chapters</div>
                    </div>
                  </div>
                  <div style={{ background: COLORS.border, borderRadius: 99, height: 6 }}>
                    <div style={{ width: `${(s.done / s.chapters) * 100}%`, height: "100%", background: s.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <h2 style={{ fontSize: 11, fontWeight: 800, marginBottom: 14, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase" }}>Recent Activity</h2>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < recentActivity.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{a.time}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: a.color }}>{a.xp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Daily Challenge Card */}
            <div style={{ background: "linear-gradient(135deg, #1a2744, #0f1a35)", border: "1px solid rgba(57,255,20,0.2)", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: COLORS.green }}>DAILY CHALLENGE</span>
              </div>
              <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 4 }}>Today's target</div>
              <div style={{ fontWeight: 900, fontSize: 28, color: "#fff", marginBottom: 12 }}>20 Questions</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, color: COLORS.green }}>+14 XP</div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>Reward</div>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, color: "#FF3B30" }}>🔥 7</div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>Streak</div>
                </div>
              </div>
              <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: COLORS.green, color: "#000", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
                Start Challenge →
              </button>
            </div>

            {/* Leaderboard */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🏆</span>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>Top Rankers</span>
                </div>
                <span style={{ fontSize: 11, color: COLORS.purple, fontWeight: 700, cursor: "pointer" }}>View all →</span>
              </div>
              {topRankers.map((r, i) => (
                <div key={r.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < topRankers.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, background: r.rank === 1 ? COLORS.gold : r.rank === 2 ? "#9CA3AF" : r.rank === 3 ? "#F97316" : COLORS.border, color: r.rank <= 3 ? "#000" : COLORS.muted }}>
                    {r.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>@{r.name}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted }}>{r.level}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 11, color: COLORS.gold }}>{r.xp.toLocaleString()} XP</div>
                </div>
              ))}
              {/* Your rank */}
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: `${COLORS.purple}22`, border: `1px solid ${COLORS.purple}44` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>Your Rank</div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: COLORS.purple }}>#{user.rank}</div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>+3 from yesterday 📈</div>
              </div>
            </div>

            {/* Level Progress */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>🎓 Level Progress</div>
              {levelPath.map((l, i) => {
                const isActive = l.name === currentLevel.name;
                const isDone = user.xp >= l.max;
                return (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, opacity: isDone || isActive ? 1 : 0.4 }}>
                    <span style={{ fontSize: 16 }}>{l.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: isActive ? l.color : isDone ? l.color : COLORS.muted }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>{l.max >= 999999 ? "50k+" : `${l.min.toLocaleString()}–${l.max.toLocaleString()}`} XP</div>
                    </div>
                    {isDone && <span style={{ fontSize: 14 }}>✅</span>}
                    {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, boxShadow: `0 0 6px ${l.color}` }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
