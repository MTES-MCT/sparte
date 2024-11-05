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
    },
)
def ingest_admin_express():
    bucket_name = "airflow-staging"
    tmp_path = "/tmp/admin_express"

    @task.python
    def download_admin_express(**context) -> str:
        print(context["params"]["zone"])
        url = get_source_by_name(context["params"]["zone"])["url"]
        print(url)
        filename = url.split("/")[-1]
        print(filename)
        path_on_bucket = f"{bucket_name}/{filename}"
        print(path_on_bucket)
        opener = URLopener()
        opener.addheader("User-Agent", "Mozilla/5.0")
        opener.retrieve(url=url, filename=filename)
        Container().s3().put_file(filename, path_on_bucket)
        os.remove(filename)
        return path_on_bucket

    @task.python
    def ingest(path_on_bucket, **context) -> str:
        source = get_source_by_name(context["params"]["zone"])
        srid = source["srid"]
        print(srid)
        shp_to_table_map = source["shapefile_to_table"]
        print(shp_to_table_map)

        with Container().s3().open(path_on_bucket, "rb") as f:
            py7zr.SevenZipFile(f, mode="r").extractall(path=tmp_path)
            for dirpath, _, filenames in os.walk(tmp_path):
                for filename in filenames:
                    if filename.endswith(".shp"):
                        table_name = shp_to_table_map.get(filename)
                        if not table_name:
                            continue
                        path = os.path.abspath(os.path.join(dirpath, filename))
                        print(path)
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

    @task.bash
    def cleanup() -> str:
        return f"rm -rf {tmp_path}"

    path_on_bucket = download_admin_express()
    ingest_result = ingest(path_on_bucket)
    ingest_result >> cleanup()


# Instantiate the DAG
ingest_admin_express()
