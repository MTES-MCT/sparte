from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task

URL_COMMUNE = "https://www.data.gouv.fr/api/1/datasets/r/61541a0f-e9b0-43dc-bace-6c3905714400"
URL_EPCI = "https://www.data.gouv.fr/api/1/datasets/r/d07e259a-4e9a-43d4-924a-e76b50f47d3b"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["SUDOCUH"],
)
def ingest_plan_communal():
    bucket_name = InfraContainer().bucket_name()
    commune_filename = "sudocuh_commune.xlsx"
    commune_table_name = "sudocuh_commune"
    epci_filename = "sudocuh_epci.xlsx"
    epci_table_name = "sudocuh_epci"

    @task.python
    def download_commune() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=URL_COMMUNE,
                s3_key=commune_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_commune() -> int | None:
        return (
            Container()
            .s3_xlsx_file_to_db_table_handler()
            .ingest_s3_xlsx_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=commune_filename,
                table_name=commune_table_name,
                sheet_name=2,
            )
        )

    @task.python
    def download_epci() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=URL_EPCI,
                s3_key=epci_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_epci() -> int | None:
        return (
            Container()
            .s3_xlsx_file_to_db_table_handler()
            .ingest_s3_xlsx_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=epci_filename,
                table_name=epci_table_name,
                sheet_name="Liste_EP",
            )
        )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(
            cmd="dbt build -s source:sparte.public.sudocuh_commune+ source:sparte.public.sudocuh_epci+"
        )

    dbt = dbt_build()
    download_commune() >> ingest_commune() >> dbt
    download_epci() >> ingest_epci() >> dbt


ingest_plan_communal()
