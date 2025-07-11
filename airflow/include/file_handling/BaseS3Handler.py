from abc import ABC, abstractmethod


class BaseS3Handler(ABC):
    @abstractmethod
    def upload_file(
        self,
        local_file_path: str,
        s3_key: str,
        s3_bucket: str,
    ) -> str:
        """
        Retourne le chemin du fichier uploadé sur S3
        """

    @abstractmethod
    def file_exists(
        self,
        local_file_path: str,
        s3_key: str,
        s3_bucket: str,
    ) -> str:
        """
        Verifie si le fichier existe sur S3
        """

    @abstractmethod
    def download_file(
        self,
        s3_key: str,
        s3_bucket: str,
        local_file_path: str,
    ) -> str:
        """
        Retourne le chemin du fichier téléchargé
        """

    @abstractmethod
    def list_files(self, s3_key: str, s3_bucket: str) -> list[str]:
        """
        Retourne la liste des fichiers dans le répertoire
        """

    @abstractmethod
    def move_from_bucket_a_to_bucket_b(
        self,
        s3_key: str,
        bucket_a: str,
        bucket_b: str,
    ) -> str:
        """
        Déplace un fichier d'un bucket à un autre
        """

    @abstractmethod
    def set_key_publicly_visible(self, s3_key: str, s3_bucket: str) -> str:
        """
        Rend le fichier public
        """
