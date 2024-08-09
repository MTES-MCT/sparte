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

from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator
from dependencies.container import Container
from pendulum import datetime


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def gpu():
    bucket_name = "airflow-staging"
    wfs_du_filename = "wfs_du.gpkg"

    @task.python
    def download() -> str:
        path_on_bucket = f"{bucket_name}/gpu/{wfs_du_filename}"
        with Container.gpu_sftp() as sftp:
            sftp.get(f"/pub/export-wfs/latest/gpkg/{wfs_du_filename}", f"/tmp/{wfs_du_filename}")

        Container().s3().put_file(f"/tmp/{wfs_du_filename}", path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest(path_on_bucket: str) -> str:
        wfs_du_temp = f"/tmp/{wfs_du_filename}"
        Container().s3().get_file(path_on_bucket, wfs_du_temp)
        cmd = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"{Container().postgres_conn_str_ogr2ogr()}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-a_srs",
            "EPSG:4236",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            wfs_du_temp,
            "zone_urba",
            "--config",
            "PG_USE_COPY",
            "YES",
        ]
        BashOperator(
            task_id="ingest_gpu",
            bash_command=" ".join(cmd),
        ).execute(context={})

    path_on_bucket = download()
    ingest(path_on_bucket)


gpu()
