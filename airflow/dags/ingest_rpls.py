import os

import pandas as pd
from airflow.decorators import dag, task
from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

URL = "https://www.statistiques.developpement-durable.gouv.fr/media/6897/download?inline"
# COG 2022


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["RPLS"],
)
def ingest_rpls():
    bucket_name = "airflow-staging"
    filename = "rpls.xlsx"

    sheet_to_table_map = [
        {
            "table_name": "rpls_rpls_commune",
            "sheet_name": "Commune",
        },
        {
            "table_name": "rpls_rpls_departement",
            "sheet_name": "Département",
        },
        {
            "table_name": "rpls_rpls_region",
            "sheet_name": "Région",
        },
    ]

    @task.python
    def download() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=URL,
                s3_key=filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest() -> int | None:
        s3_path = f"{bucket_name}/{filename}"
        tmp_localpath = f"/tmp/{filename}"
        Container().s3().get_file(s3_path, tmp_localpath)

        row_count = 0

        for sheet_to_table in sheet_to_table_map:
            df = pd.read_excel(tmp_localpath, skiprows=4, sheet_name=sheet_to_table["sheet_name"], index_col=False)
            row_count += df.to_sql(
                name=sheet_to_table["table_name"], con=Container().sqlalchemy_dbt_conn(), if_exists="replace"
            )

        os.remove(tmp_localpath)
        return row_count

    @task.bash(pool=DBT_POOL)
    def dbt_build() -> str:
        return get_dbt_command_from_directory(cmd="dbt build -s rpls+")

    (download() >> ingest() >> dbt_build())


ingest_rpls()
