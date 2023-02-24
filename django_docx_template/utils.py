from pydoc import locate

from django.conf import settings


def import_from_string(class_path):
    """Return an existing datasource according to the given path.
    You don't need to list the datasource in your settings to be valid (TODO: to be
    confirmed)"""
    data_source_class = locate(class_path)
    if not data_source_class:
        raise KeyError(f"Unknow DataSource {class_path}")
    data_source = data_source_class(class_path)
    return data_source


def get_all_data_sources():
    """Return all datasources listed in the settings."""
    sources = settings.DJANGO_DOCX_TEMPLATES["data_sources"]
    return [import_from_string(source) for source in sources]


def remove_slash(part: str) -> str:
    """Remove starting and ending slash from a string"""
    if part[0] == "/":
        part = part[1:]
    if part[-1] == "/":
        part = part[:-1]
    return part


def merge_url_parts(*parts: list[str]) -> str:
    """Join part of the url with / in between. Clean each part to be sure there is no
    double // in the url."""
    url_parts = [remove_slash(parts[i]) for i in range(len(parts))]
    return "/".join(url_parts)
