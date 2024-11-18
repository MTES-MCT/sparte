import os
from urllib.request import URLopener

import pandas as pd
from airflow.decorators import dag, task
from include.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

URL = "https://www.insee.fr/fr/statistiques/fichier/3698339/base-pop-historiques-1876-2021.xlsx"


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
    bucket_name = "airflow-staging"
    tmp_localpath = "/tmp/population"
    staging_table_name = "insee_population"

    @task.python
    def download() -> str:
        filename = URL.split("/")[-1]
        path_on_bucket = f"{bucket_name}/{filename}"
        opener = URLopener()
        opener.addheader("User-Agent", "Mozilla/5.0")
        opener.retrieve(url=URL, filename=filename)
        Container().s3().put_file(filename, path_on_bucket)
        os.remove(filename)
        return path_on_bucket

    @task.python
    def ingest(path_on_bucket) -> int | None:
        Container().s3().get_file(path_on_bucket, tmp_localpath)
        df = pd.read_excel(tmp_localpath, skiprows=5)
        row_count = df.to_sql(staging_table_name, con=Container().sqlalchemy_dbt_conn(), if_exists="replace")
        os.remove(tmp_localpath)
        return row_count

    @task.bash(pool=DBT_POOL)
    def dbt_build() -> str:
        return get_dbt_command_from_directory(cmd="dbt build -s +insee+")

    path_on_bucket = download()
    ingest_task = ingest(path_on_bucket)

    path_on_bucket >> ingest_task >> dbt_build()


ingest_population()
