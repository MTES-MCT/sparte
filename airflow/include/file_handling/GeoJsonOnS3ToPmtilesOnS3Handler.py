import logging
import os
import subprocess
import tempfile

from .BaseS3Handler import BaseS3Handler

logger = logging.getLogger(__name__)

# Code de sortie de tippecanoe quand il n'y a pas assez de données pour générer des tuiles :
# aucune feature, ou une seule position avec -zg (EXIT_NODATA dans errors.hpp)
TIPPECANOE_EXIT_NODATA = 110

DEFAULT_TIPPECANOE_OPTIONS = [
    "--read-parallel",
    "--force",
    "--no-simplification-of-shared-nodes",
    "--no-tiny-polygon-reduction",
    "--coalesce-densest-as-needed",
    "--no-tile-size-limit",
    "-zg",
]


class GeoJsonOnS3ToPmtilesOnS3Handler:
    def __init__(self, s3_handler: BaseS3Handler):
        self.s3_handler = s3_handler

    def convert_geojson_to_pmtiles_on_s3(
        self,
        s3_bucket: str,
        s3_geojson_key: str,
        s3_pmtiles_key: str,
        tippecanoe_options: list[str] | None = None,
    ) -> str | None:
        """
        Télécharge un GeoJSON depuis S3, le convertit en PMTiles avec tippecanoe et
        uploade le résultat sur S3. Tout se fait dans un dossier temporaire supprimé
        à la fin, pour que la tâche ne dépende d'aucun fichier laissé par une autre.

        Returns:
            Le chemin du PMTiles sur S3, ou None si tippecanoe n'a pas assez de données
        """
        if tippecanoe_options is None:
            tippecanoe_options = DEFAULT_TIPPECANOE_OPTIONS

        with tempfile.TemporaryDirectory() as tmp_dir:
            local_geojson = os.path.join(tmp_dir, os.path.basename(s3_geojson_key))
            local_pmtiles = os.path.join(tmp_dir, os.path.basename(s3_pmtiles_key))

            logger.info(f"Downloading s3://{s3_bucket}/{s3_geojson_key} to {local_geojson}")
            self.s3_handler.download_file(
                s3_bucket=s3_bucket,
                s3_key=s3_geojson_key,
                local_file_path=local_geojson,
            )

            cmd = ["tippecanoe", "-o", local_pmtiles, local_geojson, *tippecanoe_options]
            logger.info(f"Running {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.stdout:
                logger.info(f"tippecanoe stdout: {result.stdout}")
            if result.stderr:
                logger.info(f"tippecanoe stderr: {result.stderr}")

            if result.returncode == TIPPECANOE_EXIT_NODATA:
                logger.info(f"Pas assez de données dans {s3_geojson_key}, pas de PMTiles généré")
                return None
            if result.returncode != 0:
                raise RuntimeError(f"tippecanoe a échoué (code {result.returncode}) pour {s3_geojson_key}")

            logger.info(f"Uploading {local_pmtiles} to s3://{s3_bucket}/{s3_pmtiles_key}")
            return self.s3_handler.upload_file(
                local_file_path=local_pmtiles,
                s3_bucket=s3_bucket,
                s3_key=s3_pmtiles_key,
            )
