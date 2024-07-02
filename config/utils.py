from django.conf import settings


def version_as_int() -> int:
    return int("".join(settings.OFFICIAL_VERSION.split(".")))
