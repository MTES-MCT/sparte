"""
Parameter for Crispy lib
"""
from .base import INSTALLED_APPS

# Add crispy to installed app
INSTALLED_APPS += ["users.apps.UsersConfig"]

# indicate the new User model to Django
AUTH_USER_MODEL = "users.User"
