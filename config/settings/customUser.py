"""
Parameter for Crispy lib
"""
from .base import INSTALLED_APPS, TEMPLATES

# Add crispy to installed app
INSTALLED_APPS += ["users.apps.UsersConfig"]

# indicate the new User model to Django
AUTH_USER_MODEL = "users.User"

TEMPLATES[0]["OPTIONS"]["context_processors"] += [
    "users.context_processors.add_connected_user_to_context",
]

LOGIN_REDIRECT_URL = "connected"
