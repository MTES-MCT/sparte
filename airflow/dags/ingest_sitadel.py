from airflow.decorators import dag, task
from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

DONNEES_ANNUELLES_COMMUNALES_LOGEMENT_CONFIG = {
    "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/9c90a880-4ba0-49b4-b99d-d7dd6c810dd0/csv?millesime=2024-11&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
    "filename": "donnees_annuelles_communales_logements.csv",
    "table": "sitadel_donnees_annuelles_communales_logements",
}

AUTORISATIONS_URBANISMES_LOGEMENTS_CONFIG = {
    "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/8b35affb-55fc-4c1f-915b-7750f974446a/csv?millesime=2024-11&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
    "filename": "autorisations_urbanismes_logements.csv",
    "table": "sitadel_autorisations_urbanismes_logements",
}


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

    @task.python()
    def download_donnees_annuelles_communales_logements():
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=DONNEES_ANNUELLES_COMMUNALES_LOGEMENT_CONFIG["source"],
                s3_key=DONNEES_ANNUELLES_COMMUNALES_LOGEMENT_CONFIG["filename"],
                s3_bucket=bucket_name,
                if_not_exists=True,
            )
        )

    @task.python()
    def ingest_donnees_annuelles_communales_logements():
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=DONNEES_ANNUELLES_COMMUNALES_LOGEMENT_CONFIG["filename"],
                table_name=DONNEES_ANNUELLES_COMMUNALES_LOGEMENT_CONFIG["table"],
                skiprows=1,
            )
        )

    @task.python()
    def download_autorisations_urbanismes_logements():
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=AUTORISATIONS_URBANISMES_LOGEMENTS_CONFIG["source"],
                s3_key=AUTORISATIONS_URBANISMES_LOGEMENTS_CONFIG["filename"],
                s3_bucket=bucket_name,
                if_not_exists=True,
            )
        )

    @task.python()
    def ingest_autorisations_urbanismes_logements():
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=AUTORISATIONS_URBANISMES_LOGEMENTS_CONFIG["filename"],
                table_name=AUTORISATIONS_URBANISMES_LOGEMENTS_CONFIG["table"],
                skiprows=1,
            )
        )

    @task.bash(pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s sitadel+")

    (
        download_donnees_annuelles_communales_logements()
        >> ingest_donnees_annuelles_communales_logements()
        >> download_autorisations_urbanismes_logements()
        >> ingest_autorisations_urbanismes_logements()
        >> dbt_build()
    )


ingest_sitadel()
