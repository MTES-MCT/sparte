"""
Share user's data with thrid parties.

Brevo : e-mailing and CRM functionalities
"""
from datetime import datetime
from typing import Any, Dict

import requests
from django.conf import settings

from users.models import User


class SubscribeUserException(Exception):
    """Error while subscribing user to Brevo."""

    pass


class Brevo:
    """Send user's data to enable automation in Brevo.
    API References: https://developers.brevo.com/reference"""

    def __init__(self):
        self.url = "https://api.brevo.com/v3".strip("/")
        self.api_key = settings.SENDINBLUE_API_KEY
        self.default_headers = {
            "accept": "application/json",
            "api-key": self.api_key,
            "content-type": "application/json",
        }

    def _post(
        self, end_point: str, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None
    ) -> requests.Response:
        """Send user's data to Brevo."""
        response = requests.post(f"{self.url}/{end_point}", json=data, headers=headers or self.default_headers)
        return response

    def after_subscription(self, user: User) -> None:
        """Send user's data to Brevo after subscription.
        Raise SubscribeUserException if the request fails (status code of response is not 204)."""
        date_creation_compte = user.date_joined if user.date_joined else datetime.now()
        data = {
            "attributes": {
                "NOM": user.last_name or "",
                "PRENOM": user.first_name or "",
                "ORGANISME": user.organism or "",
                "FONCTION": user.function or "",
                "DATE_CREATION_COMPTE": date_creation_compte.strftime("%Y/%m/%d"),
            },
            "updateEnabled": True,
            "email": user.email,
        }
        response = self._post("contacts", data=data)
        if response.status_code != 204:
            raise SubscribeUserException(
                f"Error while sending user's data to Brevo after subscription: {response.text}"
            )
