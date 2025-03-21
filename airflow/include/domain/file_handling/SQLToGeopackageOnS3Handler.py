import logging
import os
import subprocess

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class SQLToGeopackageOnS3Handler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
        db_connection: str,
    ):
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator
        self.db_connection = db_connection

    def export_sql_result_to_geopackage_on_s3(
        self,
        s3_key: str,
        s3_bucket: str,
        sql_to_layer_name_mapping: dict[str, str],
    ) -> str:
        tmp_file = f"{self.tmp_path_generator.get_tmp_path()}.gpkg"

        first_layer = True

        for layer_name, sql in sql_to_layer_name_mapping.items():
            logger.info(f"Exporting SQL result to {tmp_file}")

            cmd = [
                "ogr2ogr",
                "-progress",
                "-f",
                '"GPKG"',
                tmp_file,
                f'"{self.db_connection}"',
                "public_ocsge.occupation_du_sol",
                "-update" if not first_layer else "",
                f'-sql "{sql}"',
                "-nln",
                layer_name,
            ]
            try:
                subprocess.run(" ".join(cmd), shell=True, stderr=subprocess.STDOUT, check=True)
            except subprocess.CalledProcessError as e:
                logger.error(f"Error while exporting SQL results: {e.output}")
                raise e
            logger.info(f"SQL result exported to {tmp_file}")
            first_layer = False

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
