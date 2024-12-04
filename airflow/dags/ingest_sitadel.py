from airflow.decorators import dag, task
from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

DONNEES_ANNUELLES_COMMUNALES_LOGEMENTS_ENDPOINT = "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/9c90a880-4ba0-49b4-b99d-d7dd6c810dd0/csv?millesime=2024-11&withColumnName=true&withColumnDescription=true&withColumnUnit=false"  # noqa: E501 (line too long)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["SITADEL"],
)
def ingest_sitadel():
    bucket_name = "airflow-staging"
    autorisation_urbanisme_logement_filename = "donnees_annuelles_communales_logements.csv"

    @task.python(retries=5)
    def download_donnees_annuelles_communales_logements() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=DONNEES_ANNUELLES_COMMUNALES_LOGEMENTS_ENDPOINT,
                s3_key=autorisation_urbanisme_logement_filename,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_donnees_annuelles_communales_logements() -> int:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=autorisation_urbanisme_logement_filename,
                table_name="sitadel_donnees_annuelles_communales_logements",
            )
        )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s sitadel+")

    (
        download_donnees_annuelles_communales_logements()
        >> ingest_donnees_annuelles_communales_logements()
        >> dbt_build()
    )


ingest_sitadel()
