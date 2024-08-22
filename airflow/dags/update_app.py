from airflow.decorators import dag, task
from airflow.models.param import Param
from dependencies.container import Container
from gdaltools import ogr2ogr
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


mapping = [
    {
        "from_table": "public_ocsge.for_app_ocsge",
        "to_table": "public.public_data_ocsge",
    },
    {
        "from_table": "public_ocsge.for_app_artificialarea",
        "to_table": "public.public_data_artificialarea",
    },
    {
        "from_table": "public_ocsge.for_app_artifareazoneurba",
        "to_table": "public.public_data_artifareazoneurba",
    },
    {
        "from_table": "public_ocsge.for_app_commune",
        "to_table": "public.public_data_commune",
    },
    {
        "from_table": "public_ocsge.for_app_departement",
        "to_table": "public.public_data_departement",
    },
    {
        "from_table": "public_ocsge.for_app_communesol",
        "to_table": "public.public_data_communesol",
    },
    {
        "from_table": "public_ocsge.for_app_ocsgediff",
        "to_table": "public.public_data_ocsgediff",
    },
    {
        "from_table": "public_ocsge.for_app_communediff",
        "to_table": "public.public_data_communediff",
    },
    {
        "from_table": "public_gpu.for_app_zoneurba",
        "to_table": "public.public_data_zoneurba",
    },
    {
        "from_table": "public_ocsge.for_app_zoneconstruite",
        "to_table": "public.public_data_zoneconstruite",
    },
]


params = {map["to_table"]: Param(True) for map in mapping}


# Define the basic parameters of the DAG, like schedule and start_date
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
    tasks = []
    for map in mapping:
        to_table_str = map["to_table"].split(".")[1]

        @task.python(task_id=f"copy_{to_table_str}", retries=0)
        def copy_table(from_table=map["from_table"], to_table=map["to_table"], **context):
            if context["params"][to_table]:
                copy_table_from_dw_to_app(from_table, to_table)
            else:
                print(f"Skipping {to_table_str}")

        tasks.append(copy_table())


# Instantiate the DAG
update_app()
