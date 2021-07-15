"""
Settings for app "carto"
"""
from .base import INSTALLED_APPS

# Add crispy to installed app
INSTALLED_APPS += ["carto.apps.CartoConfig"]
