import os

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Emails that are automatically granted admin access on login (comma-separated env)
ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.environ.get('supersara0011@gmail.com', '').split(',')
    if e.strip()
}

# XP rules
XP_PER_CORRECT = 4
XP_PER_WRONG = -1
CHAPTER_BONUS = 10
DAILY_BONUS = 10
PREMIUM_TOP_N = 3

# Cost control: max AI-generated questions per calendar day across all admins
AI_DAILY_CAP = int(os.environ.get('AI_DAILY_CAP', '50'))
