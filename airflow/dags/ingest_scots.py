from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task

SCOT_ENDPOINT = "https://api-sudocuh.datahub.din.developpement-durable.gouv.fr/sudocuh/enquetes/ref/scot/liste/CSV?annee_cog=2024"  # noqa: E501 (line too long)
SCOT_COMMUNES_ENDPOINT = "https://api-sudocuh.datahub.din.developpement-durable.gouv.fr/sudocuh/enquetes/ref/scot/communes/CSV?annee_cog=2024"  # noqa: E501 (line too long)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["SUDOCUH"],
)
def ingest_scots():
    bucket_name = "airflow-staging"
    scot_filename = "scot.csv"
    scot_communes_filename = "scot_communes.csv"

    @task.python
    def download_scots() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=SCOT_ENDPOINT,
                s3_key=scot_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def download_scot_communes() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=SCOT_COMMUNES_ENDPOINT,
                s3_key=scot_communes_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_scots() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=scot_filename,
                table_name="sudocuh_scot",
            )
        )

    @task.python
    def ingest_scot_communes() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=scot_communes_filename,
                table_name="sudocuh_scot_communes",
            )
        )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s sudocuh")

    (download_scots() >> ingest_scots() >> download_scot_communes() >> ingest_scot_communes() >> dbt_build())


ingest_scots()
