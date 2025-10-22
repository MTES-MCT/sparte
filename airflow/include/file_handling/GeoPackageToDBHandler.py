"""
Handler pour ingérer des fichiers GeoPackage dans une base de données PostgreSQL via ogr2ogr.

Ce handler se concentre uniquement sur l'ingestion de fichiers .gpkg déjà disponibles
localement. Il ne gère pas le téléchargement ni l'extraction.
"""

import logging
import subprocess
from typing import Optional

from ..utils import (
    get_shapefile_or_geopackage_first_layer_name,
    multiline_string_to_single_line,
)

logger = logging.getLogger(__name__)


class GeoPackageToDBHandler:
    """
    Handler bas niveau pour ingérer des GeoPackages dans PostgreSQL.

    Utilise ogr2ogr pour l'ingestion avec :
    - Détection automatique du nom de la couche
    - Support des colonnes supplémentaires (normalisation)
    - Préservation du SRS source
    - Gestion d'erreurs détaillée
    """

    def __init__(self, gdal_connection_string: str):
        """
        Initialise le handler avec la chaîne de connexion PostgreSQL.

        Args:
            gdal_connection_string: Chaîne de connexion au format GDAL/OGR
        """
        self.gdal_connection_string = gdal_connection_string

    def ingest_geopackage(
        self,
        gpkg_path: str,
        table_name: str,
        extra_columns: Optional[dict[str, str]] = None,
        mode: str = "append",
    ) -> None:
        """
        Ingère un GeoPackage dans PostgreSQL via ogr2ogr.

        Args:
            gpkg_path: Chemin local vers le fichier .gpkg
            table_name: Nom de la table PostgreSQL de destination
            extra_columns: Colonnes supplémentaires à ajouter pour normaliser les données
                          (ex: {"departement": "01", "annee": "2021"})
            mode: Mode d'ingestion ("append" ou "overwrite")

        Raises:
            RuntimeError: Si ogr2ogr échoue
        """
        # Détecter automatiquement le nom de la couche dans le GeoPackage
        layer_name = get_shapefile_or_geopackage_first_layer_name(gpkg_path)
        logger.info(f"Couche détectée: {layer_name}")

        # Construire la requête SQL avec les colonnes supplémentaires
        select_cols = "*"
        if extra_columns:
            # Ajouter les colonnes de normalisation (ex: département, année)
            cols_sql = ", ".join([f"'{v}' as {k}" for k, v in extra_columns.items()])
            select_cols = f"*, {cols_sql}"

        sql = f"SELECT {select_cols} FROM {layer_name}"
        sql = multiline_string_to_single_line(sql)

        logger.info(f"SQL: {sql}")

        # Construire la commande ogr2ogr avec les options optimales
        cmd = [
            "ogr2ogr",
            "-f",
            '"PostgreSQL"',
            f'"{self.gdal_connection_string}"',
            f"-{mode}",  # append ou overwrite
            "-lco",
            "GEOMETRY_NAME=geom",  # Nom de la colonne géométrique
            "-nln",
            table_name,  # Nom de la table de destination
            "-nlt",
            "MULTIPOLYGON",  # Forcer en MULTIPOLYGON
            "-nlt",
            "PROMOTE_TO_MULTI",  # Promouvoir POLYGON en MULTIPOLYGON
            gpkg_path,
            "--config",
            "PG_USE_COPY",  # Utiliser COPY au lieu d'INSERT (plus rapide)
            "YES",
            "-sql",
            f'"{sql}"',  # Requête SQL avec colonnes supplémentaires
        ]

        logger.info("Exécution de ogr2ogr...")

        # Exécuter la commande ogr2ogr
        result = subprocess.run(
            " ".join(cmd),
            shell=True,
            check=False,
            capture_output=True,
            text=True,
        )

        # Gestion des erreurs avec affichage détaillé
        if result.returncode != 0:
            error_msg = f"""
╔══════════════════════════════════════════════════════════════════
║ ERREUR ogr2ogr
╠══════════════════════════════════════════════════════════════════
║ Code de retour: {result.returncode}
╠══════════════════════════════════════════════════════════════════
║ STDOUT:
║ {result.stdout}
╠══════════════════════════════════════════════════════════════════
║ STDERR:
║ {result.stderr}
╠══════════════════════════════════════════════════════════════════
║ Commande:
║ {" ".join(cmd)}
╚══════════════════════════════════════════════════════════════════
"""
            logger.error(error_msg)
            raise RuntimeError(f"ogr2ogr a échoué (code {result.returncode})")

        logger.info("✓ Ingestion réussie")
