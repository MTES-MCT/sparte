import logging
import os
import subprocess

from .BaseHTTPFileHandler import BaseHTTPFileHandler
from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class SQLToGeoJsonOnS3Handler:
    def __init__(
        self,
        http_file_handler: BaseHTTPFileHandler,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
        db_connection: str,
    ):
        self.http_file_handler = http_file_handler
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator
        self.db_connection = db_connection

    def export_sql_result_to_geojson_on_s3(
        self,
        sql: str,
        s3_key: str,
        s3_bucket: str,
    ) -> str:
        """
        Exports SQL query results to classic GeoJSON format and uploads to S3.

        Args:
            sql: SQL query string to execute
            s3_key: S3 object key (path within bucket)
            s3_bucket: S3 bucket name

        Returns:
            Path to the uploaded file on S3
        """
        tmp_file = f"{self.tmp_path_generator.get_tmp_path()}.geojson"

        logger.info(f"Exporting SQL result to {tmp_file}")

        cmd = [
            "ogr2ogr",
            "-progress",
            "-f",
            '"GeoJSON"',
            tmp_file,
            f'"{self.db_connection}"',
            f'-sql "{sql}"',
        ]
        try:
            subprocess.run(" ".join(cmd), shell=True, stderr=subprocess.STDOUT, check=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"Error while exporting SQL results: {e.output}")
            raise e
        logger.info(f"SQL result exported to {tmp_file}")

        logger.info(f"Uploading {tmp_file} to s3://{s3_bucket}/{s3_key}")

        upload_path = self.s3_handler.upload_file(
            local_file_path=tmp_file,
            s3_key=s3_key,
            s3_bucket=s3_bucket,
        )

        logger.info(f"Uploaded {tmp_file} to {upload_path}")

        logger.info(f"Deleting file {tmp_file}")

        os.remove(tmp_file)

        logger.info(f"Deleted file {tmp_file}")

        return upload_path
