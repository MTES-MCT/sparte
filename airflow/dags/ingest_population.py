import os

import pandas as pd
from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://www.insee.fr/fr/statistiques/fichier/3698339/base-pop-historiques-1876-2023.xlsx"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["INSEE"],
)
def ingest_population():
    bucket_name = InfraContainer().bucket_name()
    filename = URL.split("/")[-1]
    staging_table_name = "insee_population"

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
        InfraContainer().s3().get_file(s3_path, tmp_localpath)
        df = pd.read_excel(tmp_localpath, skiprows=5)
        row_count = df.to_sql(name=staging_table_name, con=InfraContainer().sqlalchemy_dbt_conn(), if_exists="replace")
        os.remove(tmp_localpath)
        return row_count

    (download() >> ingest())


ingest_population()
