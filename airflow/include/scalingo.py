import requests


class ScalingoClient:
    def __init__(
        self,
        api_token: str,
        app_name: str,
        addon_id: str,
        scalingo_subdomain: str,
        scalingo_subdomain_db: str,
    ):
        self.api_token = api_token
        self.app_name = app_name
        self.addon_id = addon_id
        self.scalingo_subdomain = scalingo_subdomain
        self.scalingo_subdomain_db = scalingo_subdomain_db

    @property
    def api_bearer_token(self):
        url = "https://auth.scalingo.com/v1/tokens/exchange"
        basic_auth_password = self.api_token
        basic_auth_username = ""

        response = requests.post(url, auth=(basic_auth_username, basic_auth_password))
        response.raise_for_status()
        return response.json()["token"]

    @property
    def headers(self):
        return {
            "Authorization": f"Bearer {self.api_bearer_token}",
            "Content-Type": "application/json",
        }

    @property
    def api_bearer_token_addon(self):
        url = f"https://{self.scalingo_subdomain}/v1/apps/{self.app_name}/addons/{self.addon_id}/token"

        response = requests.post(url, headers=self.headers)
        response.raise_for_status()
        return response.json()["addon"]["token"]

    @property
    def addons_headers(self):
        return {
            "Authorization": f"Bearer {self.api_bearer_token_addon}",
            "Content-Type": "application/json",
        }

    def get_backups(self):
        url = f"https://{self.scalingo_subdomain_db}/api/databases/{self.addon_id}/backups"
        response = requests.get(url, headers=self.addons_headers)
        response.raise_for_status()
        return response.json()["database_backups"]

    def get_backup_url(self, backup_id: str):
        url = f"https://{self.scalingo_subdomain_db}/api/databases/{self.addon_id}/backups/{backup_id}/archive"
        response = requests.get(url, headers=self.addons_headers)
        response.raise_for_status()
        return response.json()["download_url"]

    def get_latest_backup_url(self):
        backups = self.get_backups()
        last_backup = backups[0]
        last_backup_id = last_backup["id"]
        return self.get_backup_url(last_backup_id)
