"""
## Astronaut ETL example DAG

This DAG queries the list of astronauts currently in space from the
Open Notify API and prints each astronaut's name and flying craft.

There are two tasks, one to get the data from the API and save the results,
and another to print the results. Both tasks are written in Python using
Airflow's TaskFlow API, which allows you to easily turn Python functions into
Airflow tasks, and automatically infer dependencies and pass data.

The second task uses dynamic task mapping to create a copy of the task for
each Astronaut in the list retrieved from the API. This list will change
depending on how many Astronauts are in space, and the DAG will adjust
accordingly each time it runs.

For more explanation and getting started instructions, see our Write your
first DAG tutorial: https://docs.astronomer.io/learn/get-started-with-airflow
"""

import os
import subprocess
from urllib.request import URLopener

import py7zr
from airflow.decorators import dag, task
from dependencies.container import Container
from pendulum import datetime

from airflow import Dataset


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Admin Express"],
)
def admin_express():
    admin_express_archive_file = "admin_express.7z"
    bucket_name = "airflow-staging"
    path_on_bucket = f"{bucket_name}/{admin_express_archive_file}"

    @task.python
    def download_admin_express() -> str:
        url = "https://data.geopf.fr/telechargement/download/ADMIN-EXPRESS-COG/ADMIN-EXPRESS-COG_3-2__SHP_LAMB93_FXX_2024-02-22/ADMIN-EXPRESS-COG_3-2__SHP_LAMB93_FXX_2024-02-22.7z"  # noqa: E501

        opener = URLopener()
        opener.addheader("User-Agent", "Mozilla/5.0")
        opener.retrieve(url=url, filename=admin_express_archive_file)

        with open(admin_express_archive_file, "rb") as local_file:
            with Container().s3().open(path_on_bucket, "wb") as distant_file:
                distant_file.write(local_file.read())

    @task(
        outlets=[
            Dataset("arrondissement"),
            Dataset("arrondissement_municipal"),
            Dataset("canton"),
            Dataset("collectivite_territoriale"),
            Dataset("commune"),
            Dataset("commune_associee_ou_deleguee"),
            Dataset("departement"),
            Dataset("epci"),
            Dataset("region"),
        ]
    )
    def ingest_admin_express() -> str:
        with Container().s3().open(path_on_bucket, "rb") as f:
            py7zr.SevenZipFile(f, mode="r").extractall()
            for dirpath, _, filenames in os.walk("."):
                for filename in filenames:
                    if filename.endswith(".shp"):
                        path = os.path.abspath(os.path.join(dirpath, filename))
                        cmd = f'ogr2ogr -f "PostgreSQL" "{Container().gdal_dw_conn_str()}" -overwrite -lco GEOMETRY_NAME=geom -a_srs EPSG:2154 -nlt MULTIPOLYGON -nlt PROMOTE_TO_MULTI {path} --config PG_USE_COPY YES'  # noqa: E501
                        subprocess.run(cmd, shell=True, check=True)

    @task.bash(retries=0, trigger_rule="all_success")
    def dbt_run(**context):
        return 'cd "${AIRFLOW_HOME}/sql/sparte" && dbt run -s admin_express'

    download_admin_express() >> ingest_admin_express() >> dbt_run()


# Instantiate the DAG
admin_express()
