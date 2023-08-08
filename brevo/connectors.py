"""
Share user's data with thrid parties.

Brevo : e-mailing and CRM functionalities
"""
from datetime import datetime
from typing import Any, Dict

import requests
from django.conf import settings

from project.models import Project, Request
from users.models import User


class BrevoException(Exception):
    """Error while subscribing user to Brevo."""

    def __init__(self, *args, **kwargs):
        self.response = kwargs.pop("response", None)
        super().__init__(*args, **kwargs)


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
        if response.status_code != 204:
            raise BrevoException("Error while sending user's data to Brevo.", response=response)
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
        self._post("contacts", data=data)

    def after_diagnostic_creation(self, project: Project) -> None:
        """Send user's data to Brevo after creating a diagnostic."""
        qs = project.cities.all().values_list("departement__source_id", flat=True).distinct()
        data = {
            "attributes": {
                "NOM": project.user.last_name or "",
                "PRENOM": project.user.first_name or "",
                "ORGANISME": project.user.organism or "",
                "FONCTION": project.user.function or "",
                "LAST_DPT_DIAGNOSTIC": ", ".join(qs),
                "LAST_DATE_DIAG_CREATED": project.created_date.strftime("%Y/%m/%d"),
            },
            "updateEnabled": True,
            "email": project.user.email,
        }
        self._post("contacts", data=data)

    def after_request(self, request: Request) -> None:
        """Send user's data to Brevo after requesting a diagnostic."""
        data = {
            "attributes": {
                "NOM": request.last_name or "",
                "PRENOM": request.first_name or "",
                "ORGANISME": request.organism or "",
                "FONCTION": request.function or "",
                "LAST_DATE_DIAG_CREATED": request.project.created_date.strftime("%Y/%m/%d"),
                "LAST_DATE_DL_DIAG": request.created_date.strftime("%Y/%m/%d"),
                "A_TELECHARGE_BILAN": "OUI",
            },
            "updateEnabled": True,
            "email": request.email,
        }
        self._post("contacts", data=data)
