from django.apps import AppConfig

"""
    Gère les connexions OIDC-Connect via ProConnect.
"""


class OidcConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "oidc"
