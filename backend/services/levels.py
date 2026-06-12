LEVELS = [
    (0, 500, "Seed", "🌱"),
    (500, 1500, "Aspirant", "📖"),
    (1500, 5000, "Scholar", "🎓"),
    (5000, 10000, "Warrior", "⚔️"),
    (10000, 20000, "Champion", "🏆"),
    (20000, 50000, "KING NEET", "👑"),
    (50000, 10**9, "AIR LEGEND", "🌟"),
]


def get_level(xp: int):
    for low, high, name, emoji in LEVELS:
        if low <= xp < high:
            return {
                "name": name, "emoji": emoji, "current_xp": xp,
                "level_min": low, "level_max": high,
                "progress": (xp - low) / (high - low) if high > low else 1.0,
            }
    return {
        "name": "AIR LEGEND", "emoji": "🌟", "current_xp": xp,
        "level_min": 50000, "level_max": 10**9, "progress": 1.0,
    }
