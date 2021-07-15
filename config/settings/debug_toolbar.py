""" Activate debug toolbar if DEBUG=True"""
from .base import INSTALLED_APPS, DEBUG, MIDDLEWARE

if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE += [
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    ]

    # bypass check of internal IPs
    def show_toolbar(request):
        return True

    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_TOOLBAR_CALLBACK": show_toolbar,
    }
