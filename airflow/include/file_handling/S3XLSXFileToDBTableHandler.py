import logging
import os

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator
from .XLSXFileIngestor import XLSXFileIngestor

logger = logging.getLogger(__name__)


class S3XLSXFileToDBTableHandler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        xlsx_file_ingestor: XLSXFileIngestor,
        tmp_path_generator: BaseTmpPathGenerator,
    ) -> None:
        self.s3_handler = s3_handler
        self.xlsx_file_ingestor = xlsx_file_ingestor
        self.tmp_path_generator = tmp_path_generator

    def ingest_s3_xlsx_file_to_db_table(
        self,
        s3_bucket: str,
        s3_key: str,
        table_name: str,
        sheet_name: str | int = 0,
        skiprows: int | None = None,
    ) -> int:
        logger.info(f"Ingesting s3://{s3_bucket}/{s3_key} to table {table_name}")

        logger.info(f"Downloading file from s3://{s3_bucket}/{s3_key}")
        local_file_path = self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=self.tmp_path_generator.get_tmp_path(),
        )
        logger.info(f"File downloaded to {local_file_path}")

        logger.info(f"Ingesting file to {table_name}")
        ingested_rows = self.xlsx_file_ingestor.ingest_xlsx_to_table(
            file_path=local_file_path,
            table_name=table_name,
            sheet_name=sheet_name,
            skiprows=skiprows,
        )
        logger.info(f"Ingested {ingested_rows} rows to table {table_name}")

        logger.info(f"Deleting file {local_file_path}")
        os.remove(local_file_path)
        logger.info(f"Deleted file {local_file_path}")

        return ingested_rows
