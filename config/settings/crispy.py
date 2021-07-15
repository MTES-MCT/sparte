"""
Parameter for Crispy lib
"""
from .base import INSTALLED_APPS

# Add crispy to installed app
INSTALLED_APPS += ["crispy_forms"]

# set default rendering
CRISPY_TEMPLATE_PACK = "bootstrap4"
