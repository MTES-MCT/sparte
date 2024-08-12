from airflow.decorators import dag, task
from dependencies.container import Container
from gdaltools import ogr2ogr
from pendulum import datetime


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def copy_to_prod():
    @task.python
    def export() -> str:
        ogr = ogr2ogr()
        ogr.config_options = {"PG_USE_COPY": "YES"}

        source_schema = "public_ocsge"
        source_table_name = "occupation_du_sol"
        source_sql = f"SELECT * FROM {source_schema}.{source_table_name} WHERE departement = '75'"

        ogr.set_input(
            Container().gdal_dw_conn(schema=source_schema),
            table_name=source_table_name,
            srs="EPSG:2154",
        )
        ogr.set_sql(source_sql)

        destination_table_name = "prod_occupation_du_sol"

        ogr.set_output(
            Container().gdal_app_conn(),
            table_name=destination_table_name,
            srs="EPSG:4326",
        )
        ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_APPEND)

        ogr.execute()

    export()


copy_to_prod()
