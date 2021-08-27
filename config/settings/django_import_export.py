"""
Parameter for django-import-export
"""
from .base import INSTALLED_APPS

# Add crispy to installed app
INSTALLED_APPS += ["import_export"]

IMPORT_EXPORT_USE_TRANSACTIONS = True
