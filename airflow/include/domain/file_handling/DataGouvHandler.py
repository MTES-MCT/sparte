import requests


class DataGouvException(Exception):
    pass


class DataGouvHandler:
    def __init__(
        self,
        endpoint: str,
        key: str,
    ):
        self.endpoint = endpoint
        self.key = key

    def upload_file(
        self,
        local_file_path: str,
        dataset_id: str,
        resource_id: str,
    ) -> dict:
        headers = {"X-API-KEY": self.key}
        if resource_id:
            url = f"{self.endpoint}/datasets/{dataset_id}/resources/{resource_id}/upload/"
        else:
            url = f"{self.endpoint}/datasets/{dataset_id}/upload/"

        files = {
            "file": open(local_file_path, "rb"),
        }

        response = requests.post(
            url,
            headers=headers,
            files=files,
        )

        if not response.ok:
            raise DataGouvException(response.text)

        return response.json()
