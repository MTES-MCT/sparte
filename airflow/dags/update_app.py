from airflow.decorators import dag, task
from gdaltools import ogr2ogr, ogrinfo
from include.container import Container
from pendulum import datetime


def create_spatial_index(table_name: str, column_name="mpoly"):
    sql = f"CREATE INDEX IF NOT EXISTS ON {table_name} USING GIST ({column_name});"
    return ogrinfo(Container().gdal_app_conn(), sql=sql)


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
        to_table = "public.public_data_ocsge"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_ocsge", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_artificialarea():
        to_table = "public.public_data_artificialarea"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_artificialarea", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_artifareazoneurba():
        return copy_table_from_dw_to_app(
            "public_ocsge.for_app_artifareazoneurba", "public.public_data_artifareazoneurba"
        )

    @task.python
    def copy_public_data_commune():
        to_table = "public.public_data_commune"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_commune", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_departement():
        to_table = "public.public_data_departement"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_departement", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_communesol():
        return copy_table_from_dw_to_app("public_ocsge.for_app_communesol", "public.public_data_communesol")

    @task.python
    def copy_public_data_ocsgediff():
        to_table = "public.public_data_ocsgediff"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_ocsgediff", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_communediff():
        return copy_table_from_dw_to_app("public_ocsge.for_app_communediff", "public.public_data_communediff")

    @task.python
    def copy_public_data_zoneconstruite():
        to_table = "public.public_data_zoneconstruite"
        copy_result = copy_table_from_dw_to_app("public_ocsge.for_app_zoneconstruite", to_table)
        create_spatial_index(to_table)
        return copy_result

    @task.python
    def copy_public_data_zoneurba():
        to_table = "public.public_data_zoneurba"
        copy_result = copy_table_from_dw_to_app("public_gpu.for_app_zoneurba", to_table)
        create_spatial_index(to_table)
        return copy_result

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
