from airflow.decorators import dag, task
from airflow.models.param import Param
from gdaltools import ogr2ogr
from include.container import Container
from pendulum import datetime


def copy_table_from_dw_to_app(
    from_table: str,
    to_table: str,
):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_input(Container().gdal_dw_conn(), table_name=from_table)
    # the option below will an id column to the table only if it does not exist
    ogr.layer_creation_options = {"FID": "id"}
    ogr.set_output(Container().gdal_app_conn(), table_name=to_table)
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()


mapping = {
    "public_ocsge.for_app_ocsge": "public.public_data_ocsge",
    "public_ocsge.for_app_artificialarea": "public.public_data_artificialarea",
    "public_ocsge.for_app_artifareazoneurba": "public.public_data_artifareazoneurba",
    "public_ocsge.for_app_commune": "public.public_data_commune",
    "public_ocsge.for_app_departement": "public.public_data_departement",
    "public_ocsge.for_app_communesol": "public.public_data_communesol",
    "public_ocsge.for_app_ocsgediff": "public.public_data_ocsgediff",
    "public_ocsge.for_app_communediff": "public.public_data_communediff",
    "public_gpu.for_app_zoneurba": "public.public_data_zoneurba",
    "public_ocsge.for_app_zoneconstruite": "public.public_data_zoneconstruite",
}


params = {table: Param(True) for table in mapping.values()}


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
    params=params,
)
def update_app():
    for from_table, to_table in mapping.items():
        to_table_short_name = to_table.split(".")[1]

        @task.python(task_id=f"copy_{to_table_short_name}", retries=0)
        def copy_table(from_table=from_table, to_table=to_table, **context):
            copy_table_from_dw_to_app(from_table, to_table)

        copy_table()


update_app()
