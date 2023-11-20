from django.conf import settings


def add_settings_to_context(request):
    return {"debug": settings.DEBUG}
