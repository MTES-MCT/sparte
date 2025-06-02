import subprocess

import requests
from include.container import Container
from include.utils import multiline_string_to_single_line
from pendulum import datetime

from airflow.decorators import dag, task

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
    bucket_name = "airflow-staging"
    wfs_du_filename = "friches_surfaces2025_04_25.gpkg"
    path_on_bucket = f"{bucket_name}/cartofriches/{wfs_du_filename}"
    localpath = f"/tmp/{wfs_du_filename}"
    table_name = "cartofriches_friches"

    @task.python
    def download() -> str:
        response = requests.get(URL, allow_redirects=True)
        with open(localpath, "wb") as file:
            file.write(response.content)

        Container().s3().put_file(localpath, path_on_bucket)

        return path_on_bucket

    @task.bash
    def info():
        return f"ogrinfo -so {localpath}"

    @task.python
    def ingest():
        Container().s3().get_file(path_on_bucket, localpath)
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

    @task.bash
    def dbt_build() -> str:
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt build -s friche.sql+'

    @task.bash
    def cleanup() -> str:
        return f"rm -f {localpath}"

    download() >> info() >> ingest() >> dbt_build() >> cleanup()


ingest_cartofriches()
