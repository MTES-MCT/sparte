"""
DAG pour ingérer le carroyage LEA de consommation d'espaces NAF.

Source: data.gouv.fr - Consommation d'espaces naturels, agricoles et forestiers (2009-2024)
"""

import subprocess
from zipfile import ZipFile

import requests
from include.container import DomainContainer
from include.container import InfraContainer as Container
from include.pools import DBT_POOL
from include.utils import (
    get_dbt_command_from_directory,
    get_first_shapefile_path_in_dir,
    multiline_string_to_single_line,
)
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://www.data.gouv.fr/api/1/datasets/r/088789cb-a9c0-4069-a4b4-7d8078911d38"
TABLE_NAME = "majic_carroyage_lea"
TMP_PATH = "/tmp/carroyage_lea"
ZIP_FILENAME = "carroyage_lea.zip"
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
    s3_key = f"majic/{ZIP_FILENAME}"
    localpath = f"{TMP_PATH}/{ZIP_FILENAME}"

    @task.python
    def download() -> str:
        """Télécharge le fichier zip depuis data.gouv.fr et l'upload sur S3."""
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
        """Extrait le shapefile et l'ingère dans PostgreSQL."""
        import os
        import shutil

        os.makedirs(TMP_PATH, exist_ok=True)

        # Download from S3
        Container().s3().get_file(f"{bucket_name}/{s3_key}", localpath)

        # Extract zip
        extract_path = f"{TMP_PATH}/extracted"
        with ZipFile(localpath, "r") as zip_file:
            zip_file.extractall(extract_path)

        # Find shapefile
        shapefile_path = get_first_shapefile_path_in_dir(extract_path)

        # Load to PostgreSQL with ogr2ogr (source is in EPSG:3035)
        cmd = [
            "ogr2ogr",
            "-f",
            '"PostgreSQL"',
            f'"{Container().gdal_dbt_conn().encode()}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-lco",
            "SRID=3035",
            "-a_srs",
            "EPSG:3035",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            TABLE_NAME,
            shapefile_path,
            "--config",
            "PG_USE_COPY",
            "YES",
        ]
        subprocess.run(" ".join(cmd), shell=True, check=True)

        # Cleanup
        shutil.rmtree(TMP_PATH)

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s carroyage_lea for_vector_tiles_carroyage_lea")

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
            "-zg",
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
        >> dbt_build()
        >> postgis_to_geojson()
        >> geojson_to_pmtiles()
        >> upload_pmtiles()
        >> cleanup()
        >> make_pmtiles_public()
    )


ingest_carroyage_lea()
