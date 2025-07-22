from typing import Any, Dict

import requests


class BrevoException(Exception):
    pass


class Brevo:
    """Send user's data to enable automation in Brevo.
    API References: https://developers.brevo.com/reference"""

    def __init__(self, url: str, api_key: str, env: str):
        self.url = url
        self.default_headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        }

    def __post(
        self,
        endpoint: str,
        data: Dict[str, Any],
    ) -> requests.Response:
        """Send user's data to Brevo."""
        response = requests.post(f"{self.url}/{endpoint}", json=data, headers=self.default_headers)
        if not response.ok:
            print(response.text)
            raise BrevoException("Error while sending user's data to Brevo.", response.text)
        return response.json()

    def import_contacts(self, contact_csv_str: str, list_ids: list) -> None:
        data = {
            "emailBlacklist": False,
            "disableNotification": False,
            "smsBlacklist": False,
            "updateExistingContacts": True,
            "emptyContactsAttributes": False,
            "fileBody": contact_csv_str,
            "listIds": list_ids,
        }
        return self.__post("contacts/import", data=data)
