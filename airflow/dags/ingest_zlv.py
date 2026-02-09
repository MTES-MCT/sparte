from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

ZLV_OPENDATA_URLS = [
    {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/2e0417b4-902d-4c60-90e7-bf5df148cb87",
        "filename": "zlv_commune_opendata.csv",
        "table_name": "zlv_commune_opendata",
    },
    {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/42a34c0a-7c97-4463-b00e-5913ea5f7077",
        "filename": "zlv_departement_opendata.csv",
        "table_name": "zlv_departement_opendata",
    },
    {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/1471825a-4b22-4bd0-ba1a-f99e729cff66",
        "filename": "zlv_region_opendata.csv",
        "table_name": "zlv_region_opendata",
    },
]


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["ZLV"],
    params={
        "run_dbt_build": Param(
            default=True,
            description="Lancer le build dbt après l'ingestion",
            type="boolean",
        ),
    },
)
def ingest_zlv():
    bucket_name = InfraContainer().bucket_name()

    @task.python
    def download_opendata() -> None:
        for opendata in ZLV_OPENDATA_URLS:
            Container().remote_to_s3_file_handler().download_http_file_and_upload_to_s3(
                url=opendata["url"],
                s3_key=opendata["filename"],
                s3_bucket=bucket_name,
            )

    @task.python
    def ingest_opendata() -> None:
        for opendata in ZLV_OPENDATA_URLS:
            Container().s3_csv_file_to_db_table_handler().ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=opendata["filename"],
                table_name=opendata["table_name"],
                separator=";",
                encoding="latin-1",
            )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build(**context) -> str:
        if not context["params"]["run_dbt_build"]:
            return "echo 'dbt build skipped'"
        return get_dbt_command_from_directory(cmd="dbt build -s zlv")

    download_opendata() >> ingest_opendata() >> dbt_build()


ingest_zlv()
