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

    def store_file_to_data_gouv(
        self,
        s3_key: str,
        s3_bucket: str,
        data_gouv_filename: str,
        data_gouv_dataset_id: str,
        data_gouv_resource_id: str,
    ) -> str:
        tmp_file = self.tmp_path_generator.get_tmp_path(filename=data_gouv_filename)

        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=tmp_file,
        )

        self.data_gouv_handler.upload_file(
            local_file_path=tmp_file,
            dataset_id=data_gouv_dataset_id,
            resource_id=data_gouv_resource_id,
        )

        os.remove(tmp_file)
