from airflow.decorators import dag, task
from dependencies.container import Container
from gdaltools import ogr2ogr
from pendulum import datetime


def ingest_table(source_table_name: str, destination_table_name: str):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_preserve_fid(True)
    ogr.set_input(Container().gdal_app_conn(), table_name=source_table_name, srs="EPSG:4326")
    ogr.set_output(Container().gdal_dw_conn(), table_name=destination_table_name, srs="EPSG:4326")
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["app"],
)
def ingest_app_dependencies():
    @task.python
    def ingest_region():
        ingest_table(source_table_name="public_data_region", destination_table_name="app_region")

    @task.python
    def ingest_departement():
        ingest_table(source_table_name="public_data_departement", destination_table_name="app_departement")

    @task.python
    def ingest_commune():
        ingest_table(source_table_name="public_data_commune", destination_table_name="app_commune")

    @task.python
    def ingest_epci():
        ingest_table(source_table_name="public_data_epci", destination_table_name="app_epci")

    @task.python
    def ingest_scot():
        ingest_table(source_table_name="public_data_scot", destination_table_name="app_scot")

    ingest_region()
    ingest_departement()
    ingest_commune()
    ingest_epci()
    ingest_scot()


ingest_app_dependencies()
