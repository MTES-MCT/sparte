"""
Settings for app "public_data" app
"""
from .base import INSTALLED_APPS

# Add crispy to installed app
INSTALLED_APPS += ["public_data.apps.PublicDataConfig"]
