import logging
import os
from typing import Any, Union

from flask_appbuilder.security.manager import AUTH_OAUTH

from airflow.providers.fab.auth_manager.security_manager.override import (
    FabAirflowSecurityManagerOverride,
)

log = logging.getLogger(__name__)

AUTH_TYPE = AUTH_OAUTH
AUTH_ROLES_SYNC_AT_LOGIN = True
AUTH_USER_REGISTRATION = True

DEV_ROLE = "Dev"

AUTH_ROLES_MAPPING = {
    DEV_ROLE: ["Admin"],
}

OAUTH_PROVIDERS = [
    {
        "name": "github",
        "icon": "fa-github",
        "token_key": "access_token",
        "remote_app": {
            "client_id": os.getenv("GITHUB_OAUTH_APP_ID"),
            "client_secret": os.getenv("GITHUB_OAUTH_APP_SECRET"),
            "api_base_url": "https://api.github.com",
            "client_kwargs": {"scope": "read:user, read:org, user:email"},
            "access_token_url": "https://github.com/login/oauth/access_token",
            "authorize_url": "https://github.com/login/oauth/authorize",
            "request_token_url": None,
        },
    },
]

"""
Pour un meilleur suivi des permissions, il faudrait remplacer les ids utilisateurs
par des ids de teams. Pour cela, il faut que l'application Oauth soit
validée sur l'organisation du MTE.

ID de la team de dev de MonDiagArtif : 12444060
"""
DEV_IDS = [
    16051000,  # Alexis
    16525551,  # Sofian
]


def map_roles(user_id: int, two_factor_enabled: bool) -> list[str]:
    """
    Retourne une liste de noms de rôles.

    Airflow mappera cette liste vers les rôles airflow qui correspondent,
    en utilisant la map AUTH_ROLES_MAPPING.

    Dans le cas où un utilisateur github n'a pas activé le 2FA,
    cette fonction ne retourne aucun groupe.
    """
    roles = []

    if not two_factor_enabled:
        return roles

    if user_id in DEV_IDS:
        roles.append(DEV_ROLE)

    return roles


class CustomSecurityManager(FabAirflowSecurityManagerOverride):
    def get_oauth_user_info(self, provider: str, resp: Any) -> dict[str, Union[str, list[str]]]:
        remote_app = self.appbuilder.sm.oauth_remotes[provider]
        me = remote_app.get("user")
        user_data = me.json()

        user_id = user_data.get("id")
        two_factor_enabled = user_data.get("two_factor_authentication")

        roles = map_roles(
            user_id=user_id,
            two_factor_enabled=two_factor_enabled,
        )

        return {
            "username": "github_" + user_data.get("login"),
            "email": user_data.get("email"),
            "role_keys": roles,
            "firstname": user_data.get("name"),
        }


SECURITY_MANAGER_CLASS = CustomSecurityManager
