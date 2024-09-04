from airflow.decorators import dag, task
from airflow.models.param import Param
from gdaltools import PgConnectionString, ogr2ogr, ogrinfo
from include.container import Container
from pendulum import datetime

STAGING = "staging"
PRODUCTION = "production"
DEV = "dev"


def get_database_connection_string(environment: str) -> PgConnectionString:
    return {
        STAGING: Container().gdal_staging_conn(),
        PRODUCTION: Container().gdal_prod_conn(),
        DEV: Container().gdal_dev_conn(),
    }[environment]


def create_spatial_index(table_name: str, column_name: str, conn: PgConnectionString):
    sql = f"CREATE INDEX IF NOT EXISTS ON {table_name} USING GIST ({column_name});"
    return ogrinfo(conn, sql=sql)


def create_btree_index(table_name: str, columns_name: list[str], conn: PgConnectionString):
    sql = f"CREATE INDEX IF NOT EXISTS ON {table_name} ({', '.join(columns_name)});"
    return ogrinfo(conn, sql=sql)


def copy_table_from_dw_to_app(
    from_table: str,
    to_table: str,
    environment: str,
    spatial_index_column: str = None,
    btree_index_columns: list[list[str]] = None,
):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_input(Container().gdal_dbt_conn(), table_name=from_table)
    # the option below will an id column to the table only if it does not exist
    ogr.layer_creation_options = {"FID": "id"}

    conn = get_database_connection_string(environment)
    ogr.set_output(conn, table_name=to_table)
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()

    if spatial_index_column:
        create_spatial_index(
            table_name=to_table,
            column_name=spatial_index_column,
            conn=conn,
        )

    if btree_index_columns:
        for columns in btree_index_columns:
            create_btree_index(table_name=to_table, columns_name=columns, conn=conn)

    return ogr.safe_args


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
    params={
        "environment": Param(
            default=DEV,
            type="string",
            enum=[
                STAGING,
                PRODUCTION,
                DEV,
            ],
        )
    },
)
def update_app():  # noqa: C901
    @task.python
    def copy_public_data_ocsge(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_ocsge",
            to_table="public.public_data_ocsge",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_artificialarea(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_artificialarea",
            to_table="public.public_data_artificialarea",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_artifareazoneurba(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_artifareazoneurba",
            to_table="public.public_data_artifareazoneurba",
            environment=context["params"]["environment"],
        )

    @task.python
    def copy_public_data_commune(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_commune",
            to_table="public.public_data_commune",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_departement(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_departement",
            to_table="public.public_data_departement",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_communesol(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_communesol",
            to_table="public.public_data_communesol",
            environment=context["params"]["environment"],
        )

    @task.python
    def copy_public_data_ocsgediff(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_ocsgediff",
            to_table="public.public_data_ocsgediff",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_communediff(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_communediff",
            to_table="public.public_data_communediff",
            environment=context["params"]["environment"],
        )

    @task.python
    def copy_public_data_zoneconstruite(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_zoneconstruite",
            to_table="public.public_data_zoneconstruite",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

    @task.python
    def copy_public_data_zoneurba(**context):
        return copy_table_from_dw_to_app(
            from_table="public_gpu.for_app_zoneurba",
            to_table="public.public_data_zoneurba",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
        )

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
