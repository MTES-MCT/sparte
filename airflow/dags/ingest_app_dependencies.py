"""
Ce dag ingère les dépendances de l'application dans une base de
données PostgreSQL, puis lance un job dbt pour les transformer.
"""

from airflow.decorators import dag, task
from gdaltools import ogr2ogr
from include.container import Container
from pendulum import datetime


def ingest_table(source_table_name: str, destination_table_name: str):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_preserve_fid(True)
    ogr.set_input(Container().gdal_prod_conn(), table_name=source_table_name, srs="EPSG:4326")
    ogr.set_output(Container().gdal_dbt_conn(), table_name=destination_table_name, srs="EPSG:4326")
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()
    return ogr.safe_args


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def ingest_app_dependencies():  # noqa: C901
    @task.python
    def ingest_app_region():
        return ingest_table("public_data_region", "app_region")

    @task.python
    def ingest_app_departement():
        return ingest_table("public_data_departement", "app_departement")

    @task.python
    def ingest_app_commune():
        return ingest_table("public_data_commune", "app_commune")

    @task.python
    def ingest_app_epci():
        return ingest_table("public_data_epci", "app_epci")

    @task.python
    def ingest_app_scot():
        return ingest_table("public_data_scot", "app_scot")

    @task.python
    def ingest_app_couverturesol():
        return ingest_table("public_data_couverturesol", "app_couverturesol")

    @task.python
    def ingest_app_usagesol():
        return ingest_table("public_data_usagesol", "app_usagesol")

    @task.python
    def ingest_app_couvertureusagematrix():
        return ingest_table("public_data_couvertureusagematrix", "app_couvertureusagematrix")

    @task.python
    def ingest_app_epci_departements():
        return ingest_table("public_data_epci_departements", "app_epci_departements")

    @task.python
    def ingest_app_scot_departements():
        return ingest_table("public_data_scot_departements", "app_scot_departements")

    @task.python
    def ingest_app_scot_regions():
        return ingest_table("public_data_scot_regions", "app_scot_regions")

    @task.bash(retries=0, trigger_rule="all_success")
    def dbt_run(**context):
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt run -s app'

    (
        ingest_app_region()
        >> ingest_app_departement()
        >> ingest_app_commune()
        >> ingest_app_epci()
        >> ingest_app_scot()
        >> ingest_app_couverturesol()
        >> ingest_app_usagesol()
        >> ingest_app_couvertureusagematrix()
        >> ingest_app_epci_departements()
        >> ingest_app_scot_departements()
        >> ingest_app_scot_regions()
        >> dbt_run()
    )


ingest_app_dependencies()
