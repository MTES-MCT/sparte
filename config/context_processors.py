from django.conf import settings


def add_settings_to_context(request):
    return {
        "debug": settings.DEBUG,
        "GOOGLE_ADWORDS_ACTIVATE": settings.GOOGLE_ADWORDS_ACTIVATE,
        "FAQ_URL": settings.FAQ_URL,
        "METABASE_URL": settings.METABASE_URL,
        "WEBINAIRE_URL": settings.WEBINAIRE_URL,
        "STATS_URL": settings.STATS_URL,
        "STATS_HEIGHT": settings.STATS_HEIGHT,
    }
