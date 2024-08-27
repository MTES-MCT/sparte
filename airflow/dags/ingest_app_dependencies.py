from airflow.decorators import dag, task
from gdaltools import ogr2ogr
from include.container import Container
from pendulum import datetime


def ingest_table(source_table_name: str, destination_table_name: str):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_preserve_fid(True)
    ogr.set_input(Container().gdal_app_conn(), table_name=source_table_name, srs="EPSG:4326")
    ogr.set_output(Container().gdal_dw_conn(), table_name=destination_table_name, srs="EPSG:4326")
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()


mapping = {
    "public_data_region": "app_region",
    "public_data_departement": "app_departement",
    "public_data_commune": "app_commune",
    "public_data_epci": "app_epci",
    "public_data_scot": "app_scot",
    "public_data_couverturesol": "app_couverturesol",
    "public_data_usagesol": "app_usagesol",
    "public_data_couvertureusagematrix": "app_couvertureusagematrix",
    "public_data_epci_departements": "app_epci_departements",
    "public_data_scot_departements": "app_scot_departements",
    "public_data_scot_regions": "app_scot_regions",
}


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def ingest_app_dependencies():
    for source_table_name, destination_table_name in mapping.items():

        @task.python(
            task_id=f"ingest_{destination_table_name}",
        )
        def ingest():
            ingest_table(source_table_name, destination_table_name)

        ingest()


ingest_app_dependencies()
