"""
Ce dag télécharge et importe les données de l'IGN Admin Express dans une base de données PostgreSQL,
puis lance un job dbt pour les transformer.
"""

import json
import os
import subprocess
from urllib.request import URLopener

import py7zr
from airflow.decorators import dag, task
from airflow.models.param import Param
from include.container import Container
from include.pools import DBT_POOL
from pendulum import datetime

with open("include/admin_express/sources.json", "r") as f:
    sources = json.load(f)
    zones = [source["name"] for source in sources]


def get_source_by_name(name: str) -> dict:
    return [source for source in sources if source["name"] == name][0]


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Admin Express"],
    params={
        "zone": Param(
            default=zones[0],
            description="Zone à ingérer",
            type="string",
            enum=zones,
        ),
        "refresh_source": Param(
            default=False,
            description="Rafraîchir la source",
            type="boolean",
        ),
    },
)
def ingest_admin_express():
    bucket_name = "airflow-staging"

    @task.python
    def download_admin_express(**context) -> str:
        url = get_source_by_name(context["params"]["zone"])["url"]

        filename = url.split("/")[-1]
        path_on_bucket = f"{bucket_name}/{filename}"
        print(path_on_bucket)

        file_exists = Container().s3().exists(path_on_bucket)

        if file_exists and not context["params"]["refresh_source"]:
            return path_on_bucket

        opener = URLopener()
        opener.addheader("User-Agent", "Mozilla/5.0")
        opener.retrieve(url=url, filename=filename)

        Container().s3().put_file(filename, path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest(path_on_bucket, **context) -> str:
        srid = get_source_by_name(context["params"]["zone"])["srid"]
        shp_to_table_map = get_source_by_name(context["params"]["zone"])["shapefile_to_table"]

        with Container().s3().open(path_on_bucket, "rb") as f:
            py7zr.SevenZipFile(f, mode="r").extractall()
            for dirpath, _, filenames in os.walk("."):
                for filename in filenames:
                    if filename.endswith(".shp"):
                        table_name = shp_to_table_map.get(filename)
                        if not table_name:
                            continue
                        path = os.path.abspath(os.path.join(dirpath, filename))
                        cmd = [
                            "ogr2ogr",
                            "-f",
                            '"PostgreSQL"',
                            f'"{Container().gdal_dbt_conn().encode()}"',
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
                            path,
                            "--config",
                            "PG_USE_COPY",
                            "YES",
                        ]
                        subprocess.run(" ".join(cmd), shell=True, check=True)

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_run(**context):
        dbt_selector = get_source_by_name(context["params"]["zone"])["dbt_selector"]
        dbt_run_cmd = f"dbt build -s {dbt_selector}"
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && ' + dbt_run_cmd

    path_on_bucket = download_admin_express()
    ingest_result = ingest(path_on_bucket)
    ingest_result >> dbt_run()


# Instantiate the DAG
ingest_admin_express()
