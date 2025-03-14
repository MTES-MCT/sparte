from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task

URL = "https://api-aln.datahub.din.developpement-durable.gouv.fr/sudocuh/enquetes/ref/plan/communal/CSV?annee_cog=2024"


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
    bucket_name = "airflow-staging"
    plan_communal_filename = "plan_communal.csv"
    table_name = "sudocuh_plan_communal"

    @task.python
    def download_plan_communal() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=URL,
                s3_key=plan_communal_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_plan_communal() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=plan_communal_filename,
                table_name=table_name,
            )
        )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s sudocuh+")

    (download_plan_communal() >> ingest_plan_communal() >> dbt_build())


ingest_plan_communal()
