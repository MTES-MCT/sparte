from django.conf import settings


def get_url_with_domain(suffix):
    url = f"{settings.HTTP_PREFIX}://{settings.DOMAIN}"
    if settings.DOMAIN_PORT:
        url += f":{settings.DOMAIN_PORT}"
    if suffix.startswith("/"):
        suffix = suffix[1:]
    return f"{url}/{suffix}"
