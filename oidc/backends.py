import logging

import requests
from django.core.exceptions import SuspiciousOperation
from mozilla_django_oidc.auth import OIDCAuthenticationBackend

logger = logging.getLogger(__name__)


class ProConnectAuthenticationBackend(OIDCAuthenticationBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def update_user(self, user, claims):
        try:
            user.first_name = claims.get("given_name", "")
            user.last_name = claims.get("usual_name", "")
            user.siret = claims.get("siret", "")
            user.proconnect = True
            user.save()

        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'utilisateur: {str(e)}")
            raise SuspiciousOperation("Impossible de mettre à jour l'utilisateur") from e

        return user

    def get_userinfo(self, access_token, id_token, payload):
        """
        On surcharge la méthode parente car ProConnect retourne un token JWT
        au format `application/jwt` au lieu de `application/json`.
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
                return self.verify_token(user_response.text)
            return user_response.json()

        except requests.RequestException as e:
            logger.error(f"Erreur lors de la récupération des informations utilisateur: {str(e)}")
            raise SuspiciousOperation("Impossible de récupérer les informations utilisateur") from e

        except Exception as e:
            logger.error(f"Erreur inattendue lors de la récupération des informations utilisateur: {str(e)}")
            raise SuspiciousOperation("Erreur lors de la validation du token") from e

    def create_user(self, claims):
        """
        Crée un nouvel utilisateur à partir des claims OIDC.
        """
        try:
            email = claims.get("email")
            if not email:
                raise SuspiciousOperation("Email manquant dans les claims")

            user = self.UserModel.objects.create_user(
                email=email,
                first_name=claims.get("given_name", ""),
                last_name=claims.get("usual_name", ""),
                siret=claims.get("siret", ""),
                proconnect=True,
            )

            return user

        except Exception as e:
            logger.error(f"Erreur lors de la création de l'utilisateur: {str(e)}")
            raise SuspiciousOperation("Impossible de créer l'utilisateur") from e
