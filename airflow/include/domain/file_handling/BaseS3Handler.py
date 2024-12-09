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
