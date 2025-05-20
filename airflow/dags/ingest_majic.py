import shutil
import subprocess
from typing import List
from zipfile import ZipFile

from include.container import Container
from include.domain.data.majic.sources import sources
from include.pools import DBT_POOL
from include.utils import (
    get_dbt_command_from_directory,
    get_first_shapefile_path_in_dir,
)
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.operators.python import PythonOperator

BUCKET_NAME = "airflow-staging"
TMP_PATH = "/tmp/majic"


def load_shapefile_to_postgres(source: dict):
    shapefile_on_s3 = source["shapefile_on_s3"]
    srid = source["srid"]
    table_name = source["table_name"]
    path_on_bucket = f"{BUCKET_NAME}/{shapefile_on_s3}"

    with Container().s3().open(path_on_bucket, "rb") as f:
        zip_file = ZipFile(f)
        tmp_path = f"{TMP_PATH}/{table_name}"
        zip_file.extractall(tmp_path)
        shapefile_path = get_first_shapefile_path_in_dir(tmp_path)
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
            shapefile_path,
            "--config",
            "PG_USE_COPY",
            "YES",
        ]
        subprocess.run(" ".join(cmd), shell=True, check=True)

    shutil.rmtree(TMP_PATH)
    return source


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Majic", "Cerema"],
)
def ingest_majic():
    # Les fichiers de consommation d'espace sont sur le dropbox du Cerema
    # Ils ne sont pas acessibles programmatiquement, donc il faut les télécharger manuellement
    # et les mettre dans le bucket airflow-staging, dans le dossier majic

    ingest_tasks: List[PythonOperator] = []

    for source in sources:
        ingest_task = PythonOperator(
            task_id=f"ingest_{source['table_name']}",
            python_callable=load_shapefile_to_postgres,
            op_kwargs={"source": source},
        )
        ingest_tasks.append(ingest_task)

    @task.bash(pool=DBT_POOL)
    def dbt_build() -> str:
        return get_dbt_command_from_directory(cmd="dbt build -s +consommation.sql+")

    @task.bash()
    def cleanup() -> str:
        return f"rm -rf {TMP_PATH}"

    for i in range(len(ingest_tasks) - 1):
        ingest_tasks[i] >> ingest_tasks[i + 1]

    build = dbt_build()
    cleanup_task = cleanup()

    # Build the models and clean up the temporary files
    # after all the ingest tasks have completed
    ingest_tasks[-1].set_downstream(build)
    build.set_downstream(cleanup_task)


ingest_majic()
