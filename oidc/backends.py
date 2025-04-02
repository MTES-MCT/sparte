import requests
from mozilla_django_oidc.auth import OIDCAuthenticationBackend


class ProConnectAuthenticationBackend(OIDCAuthenticationBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_userinfo(self, access_token, id_token, payload):
        # On surcharge la méthode get_userinfo pour ProConnect qui retourne un JWT et non un JSON.
        user_response = requests.get(
            self.OIDC_OP_USER_ENDPOINT,
            headers={"Authorization": "Bearer {0}".format(access_token)},
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        user_response.raise_for_status()

        if user_response.headers.get("content-type", "").startswith("application/jwt"):
            # Si les claims user sont un JWT
            return self.verify_token(user_response.text)

        # Sinon on retourne le JSON
        return user_response.json()
