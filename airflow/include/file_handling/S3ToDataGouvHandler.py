import logging
import os

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator
from .DataGouvHandler import DataGouvHandler

logger = logging.getLogger(__name__)


class S3ToDataGouvHandler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        data_gouv_handler: DataGouvHandler,
        tmp_path_generator: BaseTmpPathGenerator,
    ):
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator
        self.data_gouv_handler = data_gouv_handler

    def get_or_create_dataset(self, slug: str, title: str) -> dict:
        """Cherche ou crée un dataset par slug. Retourne le dataset complet."""
        return self.data_gouv_handler.get_or_create_dataset(slug=slug, title=title)

    def upload_resource_to_dataset(
        self,
        s3_key: str,
        s3_bucket: str,
        data_gouv_filename: str,
        dataset_id: str,
        resource_slug: str,
        resource_title: str,
    ) -> dict:
        """Upload un fichier S3 vers un dataset existant."""
        tmp_file = self.tmp_path_generator.get_tmp_path(filename=data_gouv_filename)

        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=tmp_file,
        )

        response = self.data_gouv_handler.upload_resource_to_dataset(
            local_file_path=tmp_file,
            dataset_id=dataset_id,
            resource_slug=resource_slug,
            resource_title=resource_title,
        )

        os.remove(tmp_file)

        return response

    def store_file_to_data_gouv(
        self,
        s3_key: str,
        s3_bucket: str,
        data_gouv_filename: str,
        dataset_slug: str,
        dataset_title: str,
        resource_slug: str,
        resource_title: str,
    ) -> dict:
        tmp_file = self.tmp_path_generator.get_tmp_path(filename=data_gouv_filename)

        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=tmp_file,
        )

        response = self.data_gouv_handler.upsert_and_upload(
            local_file_path=tmp_file,
            dataset_slug=dataset_slug,
            dataset_title=dataset_title,
            resource_slug=resource_slug,
            resource_title=resource_title,
        )

        os.remove(tmp_file)

        return response
