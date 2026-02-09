from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

source_to_table = [
    {
        "source": "https://www.data.gouv.fr/api/1/datasets/r/0debc675-369e-4d32-aec6-8716d48d64e7",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_communales_logements.csv",
        "table": "sitadel_donnees_annuelles_communales_logements",
    },
    {
        "source": "https://www.data.gouv.fr/api/1/datasets/r/ae0d7970-0860-4418-a1b7-874eca038c11",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_departements_logements.csv",
        "table": "sitadel_donnees_annuelles_departements_logements",
    },
    {
        "source": "https://www.data.gouv.fr/api/1/datasets/r/79c41b99-be89-485c-bf74-170c03111252",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_epci_logements.csv",
        "table": "sitadel_donnees_annuelles_epci_logements",
    },
]


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["SITADEL"],
    params={
        "skip_dbt": Param(default=False, type="boolean", description="Skip dbt build step"),
        "if_not_exists": Param(default=True, type="boolean", description="Skip download if file already exists on S3"),
    },
)
def ingest_sitadel():
    bucket_name = InfraContainer().bucket_name()

    @task.python()
    def download(**context):
        if_not_exists = context["params"].get("if_not_exists", True)
        files = []

        for source in source_to_table:
            files.append(
                Container()
                .remote_to_s3_file_handler()
                .download_http_file_and_upload_to_s3(
                    url=source["source"],
                    s3_key=source["filename"],
                    s3_bucket=bucket_name,
                    if_not_exists=if_not_exists,
                )
            )

        return files

    @task.python()
    def ingest():
        inserted_rows = 0

        for source in source_to_table:
            inserted_rows += (
                Container()
                .s3_csv_file_to_db_table_handler()
                .ingest_s3_csv_file_to_db_table(
                    s3_bucket=bucket_name,
                    s3_key=source["filename"],
                    table_name=source["table"],
                    skiprows=0,
                )
            )

        return inserted_rows

    @task.bash(pool=DBT_POOL)
    def dbt_build(**context):
        if context["params"].get("skip_dbt"):
            return "echo 'Skipping dbt build'"
        return get_dbt_command_from_directory(cmd="dbt build -s sitadel+")

    download() >> ingest() >> dbt_build()


ingest_sitadel()
