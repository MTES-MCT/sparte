import os

import pandas as pd
import requests
from airflow.decorators import dag, task
from include.container import Container
from pendulum import datetime

SCOT_ENDPOINT = "https://api-sudocuh.datahub.din.developpement-durable.gouv.fr/sudocuh/enquetes/ref/scot/liste/CSV?annee_cog=2024"  # noqa: E501 (line too long)
SCOT_COMMUNES_ENDPOINT = "https://api-sudocuh.datahub.din.developpement-durable.gouv.fr/sudocuh/enquetes/ref/scot/communes/CSV?annee_cog=2024"  # noqa: E501 (line too long)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["DGALN"],
)
def ingest_scots():
    bucket_name = "airflow-staging"
    scot_filename = "scot.csv"
    scot_communes_filename = "scot_communes.csv"
    tmp_localpath_scot = f"/tmp/{scot_filename}"
    tmp_localpath_scot_communes = f"/tmp/{scot_communes_filename}"

    @task.python
    def download_scots() -> str:
        request = requests.get(SCOT_ENDPOINT)

        with open(tmp_localpath_scot, "wb") as f:
            f.write(request.content)

        path_on_bucket = f"{bucket_name}/{scot_filename}"

        Container().s3().put_file(tmp_localpath_scot, path_on_bucket)
        os.remove(tmp_localpath_scot)
        return path_on_bucket

    @task.python
    def download_scot_communes() -> str:
        request = requests.get(SCOT_COMMUNES_ENDPOINT)

        with open(tmp_localpath_scot_communes, "wb") as f:
            f.write(request.content)

        path_on_bucket = f"{bucket_name}/{scot_communes_filename}"

        Container().s3().put_file(tmp_localpath_scot_communes, path_on_bucket)
        os.remove(tmp_localpath_scot_communes)
        return path_on_bucket

    @task.python
    def ingest_scots(path_on_bucket) -> int | None:
        Container().s3().get_file(path_on_bucket, tmp_localpath_scot)
        df = pd.read_csv(tmp_localpath_scot, sep=";")
        table_name = "dgaln_scot"
        row_count = df.to_sql(table_name, con=Container().sqlalchemy_dbt_conn(), if_exists="replace")
        os.remove(tmp_localpath_scot)
        return row_count

    @task.python
    def ingest_scot_communes(path_on_bucket) -> int | None:
        Container().s3().get_file(path_on_bucket, tmp_localpath_scot_communes)
        df = pd.read_csv(tmp_localpath_scot_communes, sep=";")
        table_name = "dgaln_scot_communes"
        row_count = df.to_sql(table_name, con=Container().sqlalchemy_dbt_conn(), if_exists="replace")
        os.remove(tmp_localpath_scot_communes)
        return row_count

    scots_path = download_scots()
    scot_communes_path = download_scot_communes()

    ingest_scots(scots_path)
    ingest_scot_communes(scot_communes_path)


ingest_scots()
