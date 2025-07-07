"""
Ce dag ingère les dépendances de l'application dans une base de
données PostgreSQL, puis lance un job dbt pour les transformer.
"""

from gdaltools import ogr2ogr
from include.container import Container
from pendulum import datetime

from airflow.decorators import dag, task


def ingest_table(source_table_name: str, destination_table_name: str):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_preserve_fid(True)
    ogr.set_input(Container().gdal_prod_conn(), table_name=source_table_name)
    ogr.set_output(Container().gdal_dbt_conn(), table_name=destination_table_name)
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()
    return ogr.safe_args


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@weekly",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def ingest_app_tables():  # noqa: C901
    @task.python
    def ingest_user():
        return ingest_table("users_user", "app_user")

    @task.python
    def ingest_request():
        return ingest_table("project_request", "app_request")

    @task.python
    def ingest_project():
        return ingest_table("project_project", "app_project")

    @task.python
    def ingest_newsletter():
        return ingest_table("home_newsletter", "app_newsletter")

    @task.python
    def ingest_satisfaction_form_entry():
        return ingest_table("home_satisfactionformentry", "app_satisfactionformentry")

    (
        ingest_user()
        >> ingest_request()
        >> ingest_newsletter()
        >> ingest_project()
        >> ingest_satisfaction_form_entry()
        # >> dbt_run()
    )


ingest_app_tables()
