"""
Handler de haut niveau pour télécharger, extraire et ingérer des GeoPackages compressés.

Ce handler orchestre un workflow complet :
1. Télécharge un fichier .7z depuis une URL vers S3
2. Télécharge le .7z depuis S3 localement
3. Extrait le .gpkg du fichier compressé
4. Upload le .gpkg vers S3
5. Ingère le .gpkg dans PostgreSQL
6. Nettoie les fichiers temporaires
"""

import logging
import tempfile
from pathlib import Path
from typing import Optional

from .BaseS3Handler import BaseS3Handler
from .CompressedFileHandler import CompressedFileHandler
from .GeoPackageToDBHandler import GeoPackageToDBHandler
from .RemoteToS3FileHandler import RemoteToS3FileHandler

logger = logging.getLogger(__name__)


class CompressedRemoteGeoPackageToDBHandler:
    """
    Handler de haut niveau pour orchestrer l'ingestion de GeoPackages compressés.

    Ce handler compose plusieurs handlers bas niveau (injection de dépendances)
    pour réaliser un workflow complet depuis le téléchargement jusqu'à l'ingestion.
    """

    def __init__(
        self,
        remote_to_s3_handler: RemoteToS3FileHandler,
        s3_handler: BaseS3Handler,
        compression_handler: CompressedFileHandler,
        db_handler: GeoPackageToDBHandler,
    ):
        """
        Initialise le handler avec injection des dépendances.

        Args:
            remote_to_s3_handler: Handler pour télécharger depuis HTTP vers S3
            s3_handler: Handler pour les opérations S3
            compression_handler: Handler pour extraire les fichiers compressés
            db_handler: Handler pour ingérer les GeoPackages dans PostgreSQL
        """
        self.remote_to_s3_handler = remote_to_s3_handler
        self.s3_handler = s3_handler
        self.compression_handler = compression_handler
        self.db_handler = db_handler

    def download_extract_and_ingest(
        self,
        url: str,
        table_name: str,
        s3_bucket: str,
        s3_key_compressed: str,
        s3_key_extracted: str,
        extra_columns: Optional[dict[str, str]] = None,
        mode: str = "append",
    ) -> None:
        """
        Télécharge, extrait et ingère un GeoPackage compressé.

        Args:
            url: URL du fichier .7z
            table_name: Nom de la table PostgreSQL de destination
            s3_bucket: Nom du bucket S3
            s3_key_compressed: Clé S3 pour le fichier .7z
            s3_key_extracted: Clé S3 pour le fichier .gpkg extrait
            extra_columns: Colonnes supplémentaires à ajouter (ex: {"departement": "01", "annee": "2021"})
            mode: Mode d'ingestion ("append" ou "overwrite")

        Raises:
            Exception: Si une étape du workflow échoue
        """
        extract_dir = None

        try:
            # 1. Télécharger le fichier .7z depuis l'URL HTTP et l'archiver sur S3
            logger.info(f"Téléchargement de {url}...")
            self.remote_to_s3_handler.download_http_file_and_upload_to_s3(
                url=url,
                s3_key=s3_key_compressed,
                s3_bucket=s3_bucket,
            )

            # 2. Récupérer le .7z depuis S3 dans un répertoire temporaire local
            extract_dir = tempfile.mkdtemp()
            local_compressed_path = Path(extract_dir) / Path(s3_key_compressed).name

            logger.info("Téléchargement depuis S3 vers le système local...")
            self.s3_handler.download_file(
                s3_key=s3_key_compressed,
                local_file_path=str(local_compressed_path),
                s3_bucket=s3_bucket,
            )

            # 3. Extraire le fichier .gpkg du fichier .7z
            logger.info("Extraction du GeoPackage...")
            gpkg_path = self.compression_handler.extract_and_find(
                archive_path=str(local_compressed_path),
                extract_dir=extract_dir,
                target_extension=".gpkg",
                cleanup_archive=True,
            )

            # 4. Archiver le .gpkg extrait sur S3
            logger.info(f"Upload du .gpkg vers S3: s3://{s3_bucket}/{s3_key_extracted}")
            self.s3_handler.upload_file(
                local_file_path=gpkg_path,
                s3_key=s3_key_extracted,
                s3_bucket=s3_bucket,
            )

            # 5. Ingérer le .gpkg dans PostgreSQL via ogr2ogr
            logger.info(f"Ingestion dans la table {table_name}...")
            self.db_handler.ingest_geopackage(
                gpkg_path=gpkg_path,
                table_name=table_name,
                extra_columns=extra_columns,
                mode=mode,
            )

            logger.info("✓ Workflow terminé avec succès")

        finally:
            # 6. Nettoyage des fichiers temporaires
            if extract_dir:
                self.compression_handler.cleanup_directory(extract_dir)
