# 10 Level System with 14-day leaderboard reset
LEVELS = [
    (0,      500,    "Seed",         "🌱", "#88FF88"),
    (500,    2000,   "Aspirant",     "📖", "#00FFCC"),
    (2000,   5000,   "Scholar",      "🎓", "#00A3FF"),
    (5000,   10000,  "Warrior",      "⚔️", "#B900FF"),
    (10000,  20000,  "Champion",     "🏆", "#FF007A"),
    (20000,  40000,  "Elite",        "💎", "#FF6B00"),
    (40000,  70000,  "KING NEET",    "👑", "#FF3B30"),
    (70000,  110000, "AIR LEGEND",   "🌟", "#FFD700"),
    (110000, 160000, "NEET MASTER",  "🔱", "#FF00FF"),
    (160000, 10**9,  "GOD OF NEET",  "⚡", "#FFFFFF"),
]


def get_level(xp: int):
    for low, high, name, emoji, color in LEVELS:
        if low <= xp < high:
            return {
                "name": name,
                "emoji": emoji,
                "color": color,
                "current_xp": xp,
                "level_min": low,
                "level_max": high,
                "progress": round((xp - low) / (high - low), 4) if high > low else 1.0,
            }
    return {
        "name": "GOD OF NEET",
        "emoji": "⚡",
        "color": "#FFFFFF",
        "current_xp": xp,
        "level_min": 160000,
        "level_max": 10**9,
        "progress": 1.0,
    }


def get_level_name_index(name: str) -> int:
    for i, (_, _, n, _, _) in enumerate(LEVELS):
        if n == name:
            return i
    return 0


def level_up(name: str) -> str:
    """Get next level name (for top 6 in 14-day leaderboard)"""
    idx = get_level_name_index(name)
    if idx < len(LEVELS) - 1:
        return LEVELS[idx + 1][2]
    return name


def level_down(name: str) -> str:
    """Get previous level name (for rank 8-12 in 14-day leaderboard)"""
    idx = get_level_name_index(name)
    if idx > 0:
        return LEVELS[idx - 1][2]
    return name
