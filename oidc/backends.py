import logging

import requests
from django.core.exceptions import SuspiciousOperation
from mozilla_django_oidc.auth import OIDCAuthenticationBackend

logger = logging.getLogger(__name__)


class ProConnectAuthenticationBackend(OIDCAuthenticationBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_userinfo(self, access_token, id_token, payload):
        """
        Récupère les informations utilisateur depuis ProConnect.
        ProConnect retourne un JWT au lieu d'un JSON.
        """
        try:
            user_response = requests.get(
                self.OIDC_OP_USER_ENDPOINT,
                headers={"Authorization": f"Bearer {access_token}"},
                verify=self.get_settings("OIDC_VERIFY_SSL", True),
                timeout=self.get_settings("OIDC_TIMEOUT", None),
                proxies=self.get_settings("OIDC_PROXY", None),
            )
            user_response.raise_for_status()

            if user_response.headers.get("content-type", "").startswith("application/jwt"):
                # Si les claims user sont un JWT
                return self.verify_token(user_response.text)
            return user_response.json()

        except requests.RequestException as e:
            logger.error(f"Erreur lors de la récupération des informations utilisateur: {str(e)}")
            raise SuspiciousOperation("Impossible de récupérer les informations utilisateur") from e

        except Exception as e:
            logger.error(f"Erreur inattendue lors de la récupération des informations utilisateur: {str(e)}")
            raise SuspiciousOperation("Erreur lors de la validation du token") from e

    def verify_token(self, token):
        """
        Vérifie la signature et le contenu du token JWT.
        """
        try:
            return super().verify_token(token)
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du token: {str(e)}")
            raise SuspiciousOperation("Token invalide") from e
