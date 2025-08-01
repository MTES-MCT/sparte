from gdaltools import ogr2ogr
from include.container import InfraContainer as Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
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
    schedule="@daily",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def ingest_matomo_tables():  # noqa: C901
    @task.python
    def ingest_action_types():
        return ingest_table("matomo.actions_types", "matomo_action_types")

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

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_run() -> str:
        return get_dbt_command_from_directory(
            "dbt build -s matomo+",
        )

    (
        ingest_log_visit()
        >> ingest_log_link_visit_action()
        >> ingest_log_conversion()
        >> ingest_log_action()
        >> ingest_action_types()
        >> dbt_run()
    )


ingest_matomo_tables()
