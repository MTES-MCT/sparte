from django.conf import settings


def get_url_with_domain(suffix):
    url = settings.DOMAIN_URL
    if url[-1] == "/":
        url = url[:-1]
    if suffix.startswith("/"):
        suffix = suffix[1:]
    return f"{url}/{suffix}"
