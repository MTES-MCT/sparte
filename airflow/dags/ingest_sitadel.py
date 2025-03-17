from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task

source_to_table = [
    {
        "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/9c90a880-4ba0-49b4-b99d-d7dd6c810dd0/csv?millesime=2024-11&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_communales_logements.csv",
        "table": "sitadel_donnees_annuelles_communales_logements",
    },
    {
        "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/a0ae7112-5184-4ad7-842d-87b09fd27df1/csv?millesime=2024-12&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_departements_logements.csv",
        "table": "sitadel_donnees_annuelles_departements_logements",
    },
    {
        "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/cb3c0612-e7d9-4a87-91be-cc0fb6448a4f/csv?millesime=2024-12&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
        "filename": "donnees_annuelles_epci_logements.csv",
        "table": "sitadel_donnees_annuelles_epci_logements",
    },
    {
        "source": "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/8b35affb-55fc-4c1f-915b-7750f974446a/csv?millesime=2024-11&withColumnName=true&withColumnDescription=true&withColumnUnit=false",  # noqa: E501 (line too long)
        "filename": "autorisations_urbanismes_logements.csv",
        "table": "sitadel_autorisations_urbanismes_logements",
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
)
def ingest_sitadel():
    bucket_name = "airflow-staging"

    @task.python()
    def download():
        files = []

        for source in source_to_table:
            files.append(
                Container()
                .remote_to_s3_file_handler()
                .download_http_file_and_upload_to_s3(
                    url=source["source"],
                    s3_key=source["filename"],
                    s3_bucket=bucket_name,
                    if_not_exists=True,
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
                    skiprows=1,
                )
            )

        return inserted_rows

    @task.bash(pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s sitadel+")

    download() >> ingest() >> dbt_build()


ingest_sitadel()
