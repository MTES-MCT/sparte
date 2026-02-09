import logging
import os
import zipfile

from .BaseHTTPFileHandler import BaseHTTPFileHandler
from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class RemoteZipToS3FileHandler:
    def __init__(
        self,
        http_file_handler: BaseHTTPFileHandler,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
    ):
        self.http_file_handler = http_file_handler
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator

    def download_zip_extract_and_upload_to_s3(
        self,
        url: str,
        s3_key: str,
        s3_bucket: str,
        target_extension: str = ".xlsx",
        if_not_exists: bool = False,
    ) -> str:
        """
        Télécharge un fichier zip depuis une URL, extrait le premier fichier
        correspondant à l'extension cible, et l'uploade sur S3.

        Retourne le chemin du fichier uploadé sur S3.
        """
        if if_not_exists and self.s3_handler.file_exists(s3_key=s3_key, s3_bucket=s3_bucket):
            logger.info(f"File already exists on s3://{s3_bucket}/{s3_key}, skipping download")
            return f"s3://{s3_bucket}/{s3_key}"

        logger.info(f"Downloading zip from {url}")

        zip_path = self.tmp_path_generator.get_tmp_path(filename="archive.zip")
        self.http_file_handler.download_file(url=url, local_file_path=zip_path)
        logger.info(f"Zip downloaded to {zip_path}")

        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                matching_files = [name for name in zf.namelist() if name.endswith(target_extension)]

                if not matching_files:
                    raise FileNotFoundError(
                        f"No {target_extension} file found in zip archive. Contents: {zf.namelist()}"
                    )

                target_file = matching_files[0]
                logger.info(f"Extracting {target_file} from zip")

                extract_dir = self.tmp_path_generator.get_tmp_path()
                os.makedirs(extract_dir, exist_ok=True)
                zf.extract(target_file, extract_dir)
                extracted_path = os.path.join(extract_dir, target_file)
        finally:
            os.remove(zip_path)
            logger.info(f"Deleted zip file {zip_path}")

        try:
            upload_path = self.s3_handler.upload_file(
                local_file_path=extracted_path,
                s3_key=s3_key,
                s3_bucket=s3_bucket,
            )
            logger.info(f"File uploaded to {upload_path}")
        finally:
            os.remove(extracted_path)
            logger.info(f"Deleted extracted file {extracted_path}")

        return upload_path
