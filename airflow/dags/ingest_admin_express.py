import os
import subprocess
from urllib.request import URLopener

import py7zr
from airflow.decorators import dag, task
from include.container import Container
from pendulum import datetime


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Admin Express"],
)
def ingest_admin_express():
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

    @task.python
    def ingest() -> str:
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
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt run -s admin_express'

    download_admin_express() >> ingest() >> dbt_run()


# Instantiate the DAG
ingest_admin_express()
