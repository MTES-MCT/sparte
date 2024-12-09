import requests
from include.domain.file_handling import BaseHTTPFileHandler


class HTTPFileHandler(BaseHTTPFileHandler):
    def download_file(self, url: str, local_file_path: str) -> str:
        request = requests.get(url)

        with open(local_file_path, "wb") as f:
            f.write(request.content)

        return local_file_path
