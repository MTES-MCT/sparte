"""
Ce dag ingère les dépendances de l'application dans une base de
données PostgreSQL, puis lance un job dbt pour les transformer.
"""

from airflow.decorators import dag, task
from gdaltools import ogr2ogr
from include.container import Container
from include.pools import DBT_POOL
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
    def ingest_app_couverturesol():
        return ingest_table("public_data_couverturesol", "app_couverturesol")

    @task.python
    def ingest_app_usagesol():
        return ingest_table("public_data_usagesol", "app_usagesol")

    @task.python
    def ingest_app_couvertureusagematrix():
        return ingest_table("public_data_couvertureusagematrix", "app_couvertureusagematrix")

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_run(**context):
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt run -s app'

    (ingest_app_couverturesol() >> ingest_app_usagesol() >> ingest_app_couvertureusagematrix() >> dbt_run())


ingest_app_dependencies()
