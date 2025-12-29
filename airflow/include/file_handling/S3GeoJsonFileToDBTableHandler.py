import logging
import os
import subprocess

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class S3GeoJsonFileToDBTableHandler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
        db_connection: str,
    ) -> None:
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator
        self.db_connection = db_connection

    def ingest_s3_geojson_file_to_db_table(
        self,
        s3_bucket: str,
        s3_key: str,
        table_name: str,
        geometry_type: str = "MULTIPOLYGON",
        srid: str = "EPSG:4326",
    ) -> None:
        """
        Ingests a GeoJSON file from S3 into a PostgreSQL table using ogr2ogr.

        Args:
            s3_bucket: S3 bucket name
            s3_key: S3 object key (path within bucket)
            table_name: Target PostgreSQL table name
            geometry_type: Geometry type (default: MULTIPOLYGON)
            srid: Spatial reference system (default: EPSG:4326)
        """
        logger.info(f"Ingesting s3://{s3_bucket}/{s3_key} to table {table_name}")

        local_file_path = f"{self.tmp_path_generator.get_tmp_path()}.geojson"

        logger.info(f"Downloading file from s3://{s3_bucket}/{s3_key}")
        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=local_file_path,
        )
        logger.info(f"File downloaded to {local_file_path}")

        logger.info(f"Ingesting file to {table_name}")
        cmd = [
            "ogr2ogr",
            "-f",
            '"PostgreSQL"',
            f'"{self.db_connection}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-a_srs",
            srid,
            "-nln",
            table_name,
            "-nlt",
            geometry_type,
            "-nlt",
            "PROMOTE_TO_MULTI",
            local_file_path,
            "--config",
            "PG_USE_COPY",
            "YES",
        ]

        try:
            result = subprocess.run(
                " ".join(cmd),
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
                text=True,
            )
            if result.stdout:
                logger.info(f"ogr2ogr stdout: {result.stdout}")
            if result.stderr:
                logger.info(f"ogr2ogr stderr: {result.stderr}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error while ingesting GeoJSON: {e}")
            logger.error(f"Command: {' '.join(cmd)}")
            if e.stdout:
                logger.error(f"stdout: {e.stdout}")
            if e.stderr:
                logger.error(f"stderr: {e.stderr}")
            raise e

        logger.info(f"File ingested to table {table_name}")

        logger.info(f"Deleting file {local_file_path}")
        os.remove(local_file_path)
        logger.info(f"Deleted file {local_file_path}")
