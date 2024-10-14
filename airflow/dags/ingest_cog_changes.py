"""
Ce dag télécharge et importe les données de l'IGN Admin Express dans une base de données PostgreSQL,
puis lance un job dbt pour les transformer.
"""

import os
from urllib.request import URLopener

import pandas as pd
from airflow.decorators import dag, task
from airflow.models.param import Param
from include.container import Container
from pendulum import datetime

urls = {
    "2024": "https://www.insee.fr/fr/statistiques/fichier/7766585/v_mvt_commune_2024.csv",
}


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["INSEE"],
    params={
        "year": Param(
            default="2024",
            description="Année des changements",
            type="string",
            enum=list(urls.keys()),
        ),
    },
)
def ingest_cog_changes():
    bucket_name = "airflow-staging"
    tmp_localpath = "/tmp/cog_changes"

    @task.python
    def download_change_file(**context) -> str:
        year = context["params"]["year"]
        filename = urls[year].split("/")[-1]
        path_on_bucket = f"{bucket_name}/{filename}"
        opener = URLopener()
        opener.addheader("User-Agent", "Mozilla/5.0")
        opener.retrieve(url=urls[year], filename=filename)
        Container().s3().put_file(filename, path_on_bucket)
        os.remove(filename)
        return path_on_bucket

    @task.python
    def ingest(path_on_bucket, **context) -> int | None:
        Container().s3().get_file(path_on_bucket, tmp_localpath)
        df = pd.read_csv(tmp_localpath)
        table_name = f"insee_cog_changes_{context['params']['year']}"
        row_count = df.to_sql(table_name, con=Container().sqlalchemy_dbt_conn(), if_exists="replace")
        os.remove(tmp_localpath)
        return row_count

    path_on_bucket = download_change_file()
    ingest(path_on_bucket)


ingest_cog_changes()
