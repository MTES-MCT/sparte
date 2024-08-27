from airflow.decorators import dag, task
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
    return ogr.safe_args


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def update_app():  # noqa: C901
    @task.python
    def copy_public_data_ocsge():
        return copy_table_from_dw_to_app("public_ocsge.for_app_ocsge", "public.public_data_ocsge")

    @task.python
    def copy_public_data_artificialarea():
        return copy_table_from_dw_to_app("public_ocsge.for_app_artificialarea", "public.public_data_artificialarea")

    @task.python
    def copy_public_data_artifareazoneurba():
        return copy_table_from_dw_to_app(
            "public_ocsge.for_app_artifareazoneurba", "public.public_data_artifareazoneurba"
        )

    @task.python
    def copy_public_data_commune():
        return copy_table_from_dw_to_app("public_ocsge.for_app_commune", "public.public_data_commune")

    @task.python
    def copy_public_data_departement():
        return copy_table_from_dw_to_app("public_ocsge.for_app_departement", "public.public_data_departement")

    @task.python
    def copy_public_data_communesol():
        return copy_table_from_dw_to_app("public_ocsge.for_app_communesol", "public.public_data_communesol")

    @task.python
    def copy_public_data_ocsgediff():
        return copy_table_from_dw_to_app("public_ocsge.for_app_ocsgediff", "public.public_data_ocsgediff")

    @task.python
    def copy_public_data_communediff():
        return copy_table_from_dw_to_app("public_ocsge.for_app_communediff", "public.public_data_communediff")

    @task.python
    def copy_public_data_zoneconstruite():
        return copy_table_from_dw_to_app("public_ocsge.for_app_zoneconstruite", "public.public_data_zoneconstruite")

    @task.python
    def copy_public_data_zoneurba():
        return copy_table_from_dw_to_app("public_gpu.for_app_zoneurba", "public.public_data_zoneurba")

    (
        copy_public_data_ocsge()
        >> copy_public_data_artificialarea()
        >> copy_public_data_artifareazoneurba()
        >> copy_public_data_commune()
        >> copy_public_data_departement()
        >> copy_public_data_communesol()
        >> copy_public_data_ocsgediff()
        >> copy_public_data_communediff()
        >> copy_public_data_zoneconstruite()
        >> copy_public_data_zoneurba()
    )


update_app()
