from abc import ABC, abstractmethod


class BaseHTTPFileHandler(ABC):
    @abstractmethod
    def download_file(self, url: str, local_file_path: str) -> str:
        """
        Retourne le chemin du fichier téléchargé
        """
