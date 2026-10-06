import os
import subprocess
import tempfile
from logging import getLogger

import requests
from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.utils import multiline_string_to_single_line
from pendulum import datetime

from airflow.decorators import dag, task

logger = getLogger(__name__)

URL = "https://www.data.gouv.fr/fr/datasets/r/a9084493-e742-4a2f-890b-0ebc803098df"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["CEREMA"],
)
def ingest_cartofriches():
    bucket_name = Container().bucket_name()
    wfs_du_filename = "friches_surfaces2025_04_25.gpkg"
    path_on_bucket = f"{bucket_name}/cartofriches/{wfs_du_filename}"
    table_name = "cartofriches_friches"

    @task.python
    def download() -> str:
        with tempfile.TemporaryDirectory() as tmp_dir:
            localpath = os.path.join(tmp_dir, wfs_du_filename)

            with requests.get(URL, allow_redirects=True, stream=True) as response:
                response.raise_for_status()
                with open(localpath, "wb") as file:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        file.write(chunk)

            Container().s3().put_file(localpath, path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest():
        with tempfile.TemporaryDirectory() as tmp_dir:
            localpath = os.path.join(tmp_dir, wfs_du_filename)
            Container().s3().get_file(path_on_bucket, localpath)

            # Résumé des couches du geopackage dans les logs, pour le débogage
            info = subprocess.run(["ogrinfo", "-so", localpath], capture_output=True, text=True, check=True)
            logger.info(info.stdout)

            sql = """
                SELECT
                    *
                FROM
                    friches_surfaces
            """
            cmd = [
                "ogr2ogr",
                "-dialect",
                "SQLITE",
                "-f",
                '"PostgreSQL"',
                f'"{Container().gdal_dbt_conn().encode()}"',
                "-overwrite",
                "-lco",
                "GEOMETRY_NAME=geom",
                "-a_srs",
                "EPSG:4326",
                "-nln",
                table_name,
                "-nlt",
                "MULTIPOLYGON",
                "-nlt",
                "PROMOTE_TO_MULTI",
                localpath,
                "-sql",
                f'"{multiline_string_to_single_line(sql)}"',
                "--config",
                "PG_USE_COPY",
                "YES",
            ]

            subprocess.run(" ".join(cmd), shell=True, check=True)

    dbt_build = DbtBuild(select=["friche.sql+"])

    download() >> ingest() >> dbt_build


ingest_cartofriches()
