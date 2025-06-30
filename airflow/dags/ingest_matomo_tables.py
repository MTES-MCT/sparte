from gdaltools import ogr2ogr
from include.container import Container
from pendulum import datetime

from airflow.decorators import dag, task


def ingest_table(source_table_name: str, destination_table_name: str):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_preserve_fid(True)
    ogr.set_input(Container().gdal_matomo_conn(), table_name=source_table_name)
    ogr.set_output(Container().gdal_dbt_conn(), table_name=destination_table_name)
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
def ingest_matomo_tables():  # noqa: C901
    @task.python
    def ingest_log_visit():
        return ingest_table("matomo.matomo_log_visit", "matomo_log_visit")

    @task.python
    def ingest_log_link_visit_action():
        return ingest_table("matomo.matomo_log_link_visit_action", "matomo_log_link_visit_action")

    @task.python
    def ingest_log_conversion():
        return ingest_table("matomo.matomo_log_conversion", "matomo_log_conversion")

    @task.python
    def ingest_log_action():
        return ingest_table("matomo.matomo_log_action", "matomo_log_action")

    (ingest_log_visit() >> ingest_log_link_visit_action() >> ingest_log_conversion() >> ingest_log_action())


ingest_matomo_tables()
