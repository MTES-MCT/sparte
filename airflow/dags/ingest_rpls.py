import os

import pandas as pd
from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

URL = "https://www.statistiques.developpement-durable.gouv.fr/media/8938/download?inline"
# COG ?


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["RPLS"],
    params={"skip_dbt": Param(default=False, type="boolean", description="Skip dbt build step")},
)
def ingest_rpls():
    bucket_name = InfraContainer().bucket_name()
    filename = "rpls.xlsx"

    sheet_to_table_map = [
        {
            "table_name": "rpls_rpls_commune",
            "sheet_name": "COMMUNE",
        },
        {
            "table_name": "rpls_rpls_departement",
            "sheet_name": "DEPARTEMENT",
        },
        {
            "table_name": "rpls_rpls_region",
            "sheet_name": "REGION",
        },
    ]

    @task.python
    def download() -> str:
        return (
            Container()
            .remote_zip_to_s3_file_handler()
            .download_zip_extract_and_upload_to_s3(
                url=URL,
                s3_key=filename,
                s3_bucket=bucket_name,
                target_extension=".xlsx",
            )
        )

    @task.python
    def ingest() -> int | None:
        s3_path = f"{bucket_name}/{filename}"
        tmp_localpath = f"/tmp/{filename}"
        InfraContainer().s3().get_file(s3_path, tmp_localpath)

        row_count = 0

        for sheet_to_table in sheet_to_table_map:
            df = pd.read_excel(tmp_localpath, skiprows=5, sheet_name=sheet_to_table["sheet_name"], index_col=False)
            row_count += df.to_sql(
                name=sheet_to_table["table_name"], con=InfraContainer().sqlalchemy_dbt_conn(), if_exists="replace"
            )

        os.remove(tmp_localpath)
        return row_count

    @task.bash(pool=DBT_POOL)
    def dbt_build(**context) -> str:
        if context["params"].get("skip_dbt"):
            return "echo 'Skipping dbt build'"
        return get_dbt_command_from_directory(cmd="dbt build -s rpls+")

    downloaded = download()
    ingested = ingest()
    dbt = dbt_build()

    downloaded >> ingested >> dbt


ingest_rpls()
