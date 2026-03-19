import os

import pandas as pd
from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://www.insee.fr/fr/statistiques/fichier/5359146/dossier_complet.zip"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["INSEE"],
)
def ingest_dossier_complet():
    bucket_name = InfraContainer().bucket_name()
    s3_key = "insee/dossier_complet.csv"

    @task.python
    def download() -> str:
        return (
            Container()
            .remote_zip_to_s3_file_handler()
            .download_zip_extract_and_upload_to_s3(
                url=URL,
                s3_key=s3_key,
                s3_bucket=bucket_name,
                target_extension=".csv",
            )
        )

    @task.python
    def ingest() -> int | None:
        """Unpivot le CSV (1900+ colonnes) en format EAV (codgeo, variable, value)
        pour contourner la limite de 1600 colonnes PostgreSQL."""
        s3_path = f"{bucket_name}/{s3_key}"
        tmp_localpath = "/tmp/dossier_complet.csv"

        InfraContainer().s3().get_file(s3_path, tmp_localpath)

        engine = InfraContainer().sqlalchemy_dbt_conn()
        table_name = "insee_dossier_complet"
        chunk_size = 5000
        total_rows = 0

        for i, chunk in enumerate(pd.read_csv(tmp_localpath, sep=";", dtype=str, chunksize=chunk_size)):
            melted = chunk.melt(
                id_vars=["CODGEO"],
                var_name="variable",
                value_name="value",
            )
            melted = melted.dropna(subset=["value"])
            row_count = melted.to_sql(
                name=table_name,
                con=engine,
                if_exists="replace" if i == 0 else "append",
                index=False,
            )
            total_rows += row_count if row_count else len(melted)

        os.remove(tmp_localpath)
        return total_rows

    download() >> ingest()


ingest_dossier_complet()
