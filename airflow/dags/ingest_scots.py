from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

SCOT_ENDPOINT_DOCURBA = "https://docurba.beta.gouv.fr/api/scots"  # noqa: E501
SCOT_PERIMETRE_DOCURBA = "https://docurba.beta.gouv.fr/api/perimetres"  # noqa: E501


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
    bucket_name = InfraContainer().bucket_name()
    scot_docurba_filename = "scot_docurba.csv"
    scot_perimetre_filename = "scot_perimetre_docurba.csv"

    @task.python
    def download_scot_docurba() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=SCOT_ENDPOINT_DOCURBA,
                s3_key=scot_docurba_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_scot_docurba() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=scot_docurba_filename,
                table_name="docurba_scots",
                separator=",",
            )
        )

    @task.python
    def download_scot_perimetre() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=SCOT_PERIMETRE_DOCURBA,
                s3_key=scot_perimetre_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_scot_perimetre() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=scot_perimetre_filename,
                table_name="docurba_scots_perimetre",
                separator=",",
            )
        )

    download_scot_docurba() >> ingest_scot_docurba()
    download_scot_perimetre() >> ingest_scot_perimetre()


ingest_scots()
