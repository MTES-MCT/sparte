import logging
import os
import shutil
import subprocess

from .BaseArchiveHandler import BaseArchiveHandler
from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class S3GeopackageArchiveToDBTablesHandler:
    """
    Extrait une archive (contenant un geopackage multi-couches) depuis S3 et
    ingère chacune de ses couches dans une table PostgreSQL via ogr2ogr.
    """

    def __init__(
        self,
        s3_handler: BaseS3Handler,
        archive_handler: BaseArchiveHandler,
        tmp_path_generator: BaseTmpPathGenerator,
        db_connection: str,
    ) -> None:
        self.s3_handler = s3_handler
        self.archive_handler = archive_handler
        self.tmp_path_generator = tmp_path_generator
        self.db_connection = db_connection

    def ingest_s3_geopackage_archive_to_db_tables(
        self,
        s3_bucket: str,
        s3_key: str,
        layer_to_table: dict,
        srid: int,
    ) -> None:
        """
        Args:
            s3_bucket: bucket S3 contenant l'archive 7z
            s3_key: clé de l'archive 7z dans le bucket
            layer_to_table: mapping {nom de couche du geopackage: table PostgreSQL cible}
            srid: code EPSG de la projection des géométries
        """
        logger.info(f"Ingesting s3://{s3_bucket}/{s3_key} ({len(layer_to_table)} layers)")

        archive_path = self.tmp_path_generator.get_tmp_path(filename="archive.7z")
        extract_dir = self.tmp_path_generator.get_tmp_path()

        self.s3_handler.download_file(
            s3_key=s3_key,
            s3_bucket=s3_bucket,
            local_file_path=archive_path,
        )
        logger.info(f"Archive downloaded to {archive_path}")

        try:
            self.archive_handler.extract(archive_path, extract_dir)

            gpkg_path = self._find_gpkg(extract_dir)
            logger.info(f"Geopackage extracted to {gpkg_path}")

            for layer_name, table_name in layer_to_table.items():
                self._ingest_layer(gpkg_path, layer_name, table_name, srid)
        finally:
            self._cleanup(archive_path, extract_dir)

    @staticmethod
    def _find_gpkg(directory: str) -> str:
        for dirpath, _, filenames in os.walk(directory):
            for filename in filenames:
                if filename.endswith(".gpkg"):
                    return os.path.join(dirpath, filename)
        raise FileNotFoundError(f"No .gpkg file found in {directory}")

    def _ingest_layer(self, gpkg_path: str, layer_name: str, table_name: str, srid: int) -> None:
        logger.info(f"Ingesting layer {layer_name} to table {table_name}")
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
            gpkg_path,
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

    @staticmethod
    def _cleanup(archive_path: str, extract_dir: str) -> None:
        if os.path.exists(archive_path):
            os.remove(archive_path)
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
