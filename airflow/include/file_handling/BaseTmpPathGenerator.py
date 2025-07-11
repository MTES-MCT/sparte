from abc import ABC, abstractmethod


class BaseTmpPathGenerator(ABC):
    def __init__(self, tmp_dir="/tmp"):
        self.tmp_dir = tmp_dir

    @abstractmethod
    def get_tmp_path(self, filename=None) -> str:
        """
        Retourne un chemin temporaire pour un fichier, en précisant ou non le nom du fichier
        Si le nom du fichier n'est pas précisé, un nom de fichier aléatoire est généré
        """
