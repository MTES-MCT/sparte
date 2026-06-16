from abc import ABC, abstractmethod


class BaseArchiveHandler(ABC):
    @abstractmethod
    def extract(self, archive_path: str, extract_dir: str) -> None:
        """
        Extrait le contenu de l'archive `archive_path` dans le dossier `extract_dir`
        """
