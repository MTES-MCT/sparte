from include.domain.container import Container
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://www.insee.fr/fr/statistiques/fichier/7766585/v_mvt_commune_2024.csv"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["INSEE"],
)
def ingest_cog_changes():
    bucket_name = "airflow-staging"
    filename = "v_mvt_commune_2024.csv"

    @task.python
    def download_change_file() -> str:
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
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=filename,
                table_name="insee_cog_changes_2024",
                separator=",",
            )
        )

    download_change_file() >> ingest()


ingest_cog_changes()
