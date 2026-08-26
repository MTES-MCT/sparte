"""
DAG pour ingérer l'export Brevo land_organism utilisé pour un correctif de données.

Fichier source: brevo/land_organism_20_01_2026.csv
Table destination: brevo_user_organism
"""

from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.dbt import DbtBuild
from pendulum import datetime

from airflow.decorators import dag, task


@dag(
    start_date=datetime(2026, 1, 20),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["BREVO"],
)
def ingest_brevo_user_organism():
    bucket_name = InfraContainer().bucket_name()
    s3_key = "brevo/land_organism_20_01_2026.csv"

    @task.python
    def ingest() -> int | None:
        return (
            Container()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=s3_key,
                table_name="brevo_user_organism",
                separator=";",
            )
        )

    dbt_build = DbtBuild(select=["brevo_user_organism+"], retries=0, trigger_rule="all_success")

    ingest() >> dbt_build


ingest_brevo_user_organism()
