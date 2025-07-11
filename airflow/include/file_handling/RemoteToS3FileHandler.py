import logging
import os

from .BaseHTTPFileHandler import BaseHTTPFileHandler
from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class RemoteToS3FileHandler:
    def __init__(
        self,
        http_file_handler: BaseHTTPFileHandler,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
    ):
        self.http_file_handler = http_file_handler
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator

    def download_http_file_and_upload_to_s3(
        self,
        url: str,
        s3_key: str,
        s3_bucket: str,
        tmp_local_file=None,
        if_not_exists=False,
    ) -> str:
        """
        Retourne le chemin du fichier téléchargé sur S3
        """
        if if_not_exists and self.s3_handler.file_exists(s3_key=s3_key, s3_bucket=s3_bucket):
            logger.info(f"File already exists on s3://{s3_bucket}/{s3_key}, skipping download")
            return f"s3://{s3_bucket}/{s3_key}"

        logger.info(f"Downloading file from {url} and uploading to s3://{s3_bucket}/{s3_key}")

        local_file_path = self.tmp_path_generator.get_tmp_path(filename=tmp_local_file)
        path = self.http_file_handler.download_file(url=url, local_file_path=local_file_path)

        logger.info(f"File downloaded to {path}")

        upload_path = self.s3_handler.upload_file(
            local_file_path=path,
            s3_key=s3_key,
            s3_bucket=s3_bucket,
        )
        logger.info(f"File uploaded to {upload_path}")

        os.remove(local_file_path)
        logger.info(f"Deleted file {path}")

        return upload_path
