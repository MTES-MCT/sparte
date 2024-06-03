"""
Share user's data with thrid parties.

Brevo : e-mailing and CRM functionalities
"""
from datetime import datetime
from typing import Any, Dict

import requests
from django.conf import settings

from home.models import Newsletter
from project.models import Project, Request, RequestedDocumentChoices
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
        self.default_headers = {
            "accept": "application/json",
            "api-key": settings.SENDINBLUE_API_KEY,
            "content-type": "application/json",
        }

    def __format_date(self, date: datetime) -> str:
        return date.strftime("%Y/%m/%d")

    def _post(
        self, end_point: str, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None
    ) -> requests.Response:
        """Send user's data to Brevo."""
        response = requests.post(f"{self.url}/{end_point}", json=data, headers=headers or self.default_headers)
        if not response.ok:
            raise BrevoException("Error while sending user's data to Brevo.", response=response)
        return response

    def after_subscription(self, user: User) -> None:
        """Send user's data to Brevo after subscription."""
        date_creation_compte = user.date_joined if user.date_joined else datetime.now()
        data = {
            "attributes": {
                "NOM": user.last_name or "",
                "PRENOM": user.first_name or "",
                "ORGANISME": user.organism or "",
                "FONCTION": user.function or "",
                "DATE_CREATION_COMPTE": self.__format_date(date_creation_compte),
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
                "LAST_DATE_DIAG_CREATED": self.__format_date(project.created_date),
            },
            "updateEnabled": True,
            "email": project.user.email,
        }
        self._post("contacts", data=data)

    def after_diagnostic_request(self, request: Request) -> None:
        """Send user's data to Brevo after requesting a diagnostic."""

        is_rapport_complet = request.requested_document == RequestedDocumentChoices.RAPPORT_COMPLET
        is_rapport_local = request.requested_document == RequestedDocumentChoices.RAPPORT_LOCAL
        project: Project = request.project

        attributes = {
            "NOM": request.last_name or "",
            "PRENOM": request.first_name or "",
            "ORGANISME": request.organism or "",
            "FONCTION": request.function or "",
            "NOM_TERRITOIRE": project.territory_name or "",
            "LAST_DATE_DIAG_CREATED": self.__format_date(project.created_date),
            "LAST_DATE_DL_DIAG": self.__format_date(request.created_date),
            "A_TELECHARGE_BILAN": "OUI" if is_rapport_complet else "NON",
            "A_TELECHARGE_RAPPORT_TRIENNAL": "OUI" if is_rapport_local else "NON",
            "VERSION_DERNIER_RAPPORT_TELECHARGE": settings.OFFICIAL_VERSION,
            "LAST_DPT_DIAGNOSTIC": ", ".join(
                project.cities.all().values_list("departement__source_id", flat=True).distinct(),
            ),
        }

        if is_rapport_local:
            attributes["DATE_DERNIER_RAPPORT_LOCAL_TELECHARGE"] = self.__format_date(request.created_date)

        user: User = request.user

        if user:
            attributes.update(
                {
                    "DATE_CREATION_COMPTE": self.__format_date(user.date_joined),
                    "FONCTION": user.function or request.function or "",
                    "NB_DIAG_CREES": user.project_set.count(),
                    "NB_DIAG_TELECHARGES": user.request_set.count(),
                }
            )

        data = {
            "attributes": attributes,
            "updateEnabled": True,
            "email": request.email,
        }

        self._post("contacts", data=data)

    def after_newsletter_subscription_confirmation(self, newsletter_sub: Newsletter) -> None:
        """Send user's data to Brevo after newsletter subscription."""
        data = {
            "attributes": {
                "EST_INSCRIT_NEWSLETTER": "OUI",
                "DATE_INSCRIPTION_NEWSLETTER": self.__format_date(newsletter_sub.created_date),
                "DATE_CONFIRMATION_INSCRIPTION_NEWSLETTER": self.__format_date(newsletter_sub.confirmation_date),
            },
            "updateEnabled": True,
            "email": newsletter_sub.email,
        }
        self._post("contacts", data=data)
