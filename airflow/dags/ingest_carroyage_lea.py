"""
DAG pour ingérer le carroyage LEA de consommation d'espaces NAF.

Source: data.gouv.fr - Consommation d'espaces naturels, agricoles et forestiers
du 1er janvier 2011 au 1er janvier 2025 (ressource `conso_carroyage.gpkg`).

Le millésime 2025 est livré en **geopackage non archivé**, contrairement au millésime
2009-2024 qui était un shapefile zippé : plus de dézippage ni de recherche de .shp, on
lit directement la première couche du gpkg. Même famille de fichiers que les
`conso_com_*.gpkg` ingérés par `ingest_majic_2025`.

La projection n'est pas forcée : celle déclarée par le geopackage fait foi (l'ancien
shapefile devait être annoté en EPSG:3035 à la main).
"""

import subprocess

import requests
from include.container import DomainContainer
from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.utils import (
    get_shapefile_or_geopackage_first_layer_name,
    multiline_string_to_single_line,
)
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://www.data.gouv.fr/api/1/datasets/r/b11c843e-d73f-45e5-88b1-dcb5e9fc6e3b"
TABLE_NAME = "majic_carroyage_lea"
TMP_PATH = "/tmp/carroyage_lea"
GPKG_FILENAME = "carroyage_lea.gpkg"
GEOJSON_FILENAME = "carroyage_lea.geojson"
PMTILES_FILENAME = "carroyage_lea.pmtiles"
VECTOR_TILES_DIR = "vector_tiles"


@dag(
    start_date=datetime(2026, 1, 28),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Majic", "Cerema"],
)
def ingest_carroyage_lea():
    bucket_name = Container().bucket_name()
    s3_key = f"majic/{GPKG_FILENAME}"
    localpath = f"{TMP_PATH}/{GPKG_FILENAME}"

    @task.python
    def download() -> str:
        """Télécharge le geopackage depuis data.gouv.fr et l'upload sur S3."""
        import os

        os.makedirs(TMP_PATH, exist_ok=True)

        response = requests.get(URL, allow_redirects=True)
        response.raise_for_status()

        with open(localpath, "wb") as f:
            f.write(response.content)

        Container().s3().put_file(localpath, f"{bucket_name}/{s3_key}")
        return s3_key

    @task.python
    def ingest() -> None:
        """Ingère la première couche du geopackage dans PostgreSQL."""
        import os
        import shutil

        os.makedirs(TMP_PATH, exist_ok=True)

        # Download from S3
        Container().s3().get_file(f"{bucket_name}/{s3_key}", localpath)

        layer_name = get_shapefile_or_geopackage_first_layer_name(localpath)

        # Load to PostgreSQL with ogr2ogr (le SRS déclaré par le geopackage fait foi)
        cmd = [
            "ogr2ogr",
            "-f",
            '"PostgreSQL"',
            f'"{Container().gdal_dbt_conn().encode()}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            TABLE_NAME,
            localpath,
            layer_name,
            "--config",
            "PG_USE_COPY",
            "YES",
        ]
        subprocess.run(" ".join(cmd), shell=True, check=True)

        # Cleanup
        shutil.rmtree(TMP_PATH)

    dbt_build = DbtBuild(select=["carroyage_lea+"], retries=0, trigger_rule="all_success")

    @task.python
    def postgis_to_geojson():
        """Exporte les données vers GeoJSONSeq."""
        sql = """
            SELECT
                *
            FROM
                public_for_vector_tiles.for_vector_tiles_carroyage_lea
        """
        return (
            DomainContainer()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),
                s3_key=f"{VECTOR_TILES_DIR}/{GEOJSON_FILENAME}",
                s3_bucket=bucket_name,
            )
        )

    @task.bash
    def geojson_to_pmtiles():
        """Convertit le GeoJSON en PMTiles avec tippecanoe."""
        local_input = f"/tmp/{GEOJSON_FILENAME}"
        local_output = f"/tmp/{PMTILES_FILENAME}"
        Container().s3().get_file(f"{bucket_name}/{VECTOR_TILES_DIR}/{GEOJSON_FILENAME}", local_input)

        cmd = [
            "tippecanoe",
            "-o",
            local_output,
            local_input,
            "--read-parallel",
            "--force",
            "--no-simplification-of-shared-nodes",
            "--no-tiny-polygon-reduction",
            "--no-line-simplification",
            "--no-feature-limit",
            "--no-tile-size-limit",
            "--detect-shared-borders",
            "--extra-detail=15",
            "-z16",
        ]
        return " ".join(cmd)

    @task.python
    def upload_pmtiles():
        """Upload le fichier PMTiles sur S3."""
        local_path = f"/tmp/{PMTILES_FILENAME}"
        path_on_s3 = f"{bucket_name}/{VECTOR_TILES_DIR}/{PMTILES_FILENAME}"
        Container().s3().put(local_path, path_on_s3)

    @task.bash
    def cleanup():
        """Supprime les fichiers temporaires."""
        return f"rm -f /tmp/{GEOJSON_FILENAME} /tmp/{PMTILES_FILENAME}"

    @task.python
    def make_pmtiles_public():
        """Rend le fichier PMTiles accessible publiquement."""
        pmtiles_key = f"{VECTOR_TILES_DIR}/{PMTILES_FILENAME}"
        s3_handler = DomainContainer().s3_handler()
        s3_handler.set_key_publicly_visible(pmtiles_key, bucket_name)

    (
        download()
        >> ingest()
        >> dbt_build
        >> postgis_to_geojson()
        >> geojson_to_pmtiles()
        >> upload_pmtiles()
        >> cleanup()
        >> make_pmtiles_public()
    )


ingest_carroyage_lea()
