import logging
import os
import subprocess

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class S3GeopackageFileToDBTableHandler:
    """
    Ingère une couche d'un geopackage **non archivé** depuis S3 dans une table
    PostgreSQL via ogr2ogr.

    Variante « fichier simple » de S3GeopackageArchiveToDBTablesHandler (qui, lui,
    attend une archive 7z contenant le geopackage).
    """

    def __init__(
        self,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
        db_connection: str,
    ) -> None:
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator
        self.db_connection = db_connection

    def ingest_s3_geopackage_file_to_db_table(
        self,
        s3_bucket: str,
        s3_key: str,
        table_name: str,
        layer_name: str,
        srid: int = 4326,
    ) -> None:
        """
        Args:
            s3_bucket: bucket S3 contenant le geopackage
            s3_key: clé du geopackage dans le bucket
            table_name: table PostgreSQL cible
            layer_name: nom de la couche du geopackage à ingérer
            srid: code EPSG de la projection des géométries
        """
        logger.info(f"Ingesting s3://{s3_bucket}/{s3_key} (layer {layer_name}) to table {table_name}")

        local_file_path = f"{self.tmp_path_generator.get_tmp_path()}.gpkg"

        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=local_file_path,
        )
        logger.info(f"Geopackage downloaded to {local_file_path}")

        cmd = [
            "ogr2ogr",
            "-f",
            '"PostgreSQL"',
            f'"{self.db_connection}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-a_srs",
            f"EPSG:{srid}",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            table_name,
            local_file_path,
            layer_name,
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
            logger.error(f"Error while ingesting layer {layer_name}: {e}")
            logger.error(f"Command: {' '.join(cmd)}")
            if e.stdout:
                logger.error(f"stdout: {e.stdout}")
            if e.stderr:
                logger.error(f"stderr: {e.stderr}")
            raise
        finally:
            if os.path.exists(local_file_path):
                os.remove(local_file_path)

        logger.info(f"Layer {layer_name} ingested to table {table_name}")
