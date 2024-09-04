"""
Ce dag met à jour les données de l'application à partir des données de l'entrepôt de données.
"""

from airflow.decorators import dag, task
from airflow.models.param import Param
from gdaltools import PgConnectionString, ogr2ogr
from include.container import Container
from pendulum import datetime

STAGING = "staging"
PRODUCTION = "production"
DEV = "dev"

GDAL = "gdal"
PSYCOPG = "psycopg"


def get_database_connection_string(environment: str) -> PgConnectionString:
    return {
        STAGING: {GDAL: Container().gdal_staging_conn(), PSYCOPG: Container().psycopg2_staging_conn()},
        PRODUCTION: {GDAL: Container().gdal_prod_conn(), PSYCOPG: Container().psycopg2_prod_conn()},
        DEV: {GDAL: Container().gdal_dev_conn(), PSYCOPG: Container().psycopg2_dev_conn()},
    }[environment]


def get_spatial_index_request(table_name: str, column_name: str):
    idx_name = f"{table_name.replace('.', '')}_{column_name}_idx"
    return f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table_name} USING GIST ({column_name});"


def get_btree_index_request(table_name: str, columns_name: list[str]):
    idx_name = f"{table_name.replace('.', '')}_{'_'.join(columns_name)}_idx"
    return f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table_name} USING btree ({', '.join(columns_name)});"


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

    connections = get_database_connection_string(environment)

    ogr.set_output(connections[GDAL], table_name=to_table)
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()

    index_requests = []

    if spatial_index_column:
        index_requests.append(get_spatial_index_request(to_table, spatial_index_column))

    if btree_index_columns:
        for columns in btree_index_columns:
            index_requests.append(get_btree_index_request(to_table, columns))

    conn = connections[PSYCOPG]
    cur = conn.cursor()
    for request in index_requests:
        cur.execute(request)
    conn.commit()
    conn.close()

    return {"index_requests": index_requests, "ogr2ogr_request": ogr.safe_args}


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
            btree_index_columns=[
                ["zone_urba"],
                ["year"],
            ],
        )

    @task.python
    def copy_public_data_commune(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_commune",
            to_table="public.public_data_commune",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
            btree_index_columns=[
                ["insee"],
            ],
        )

    @task.python
    def copy_public_data_departement(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_departement",
            to_table="public.public_data_departement",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
            btree_index_columns=[
                ["source_id"],
            ],
        )

    @task.python
    def copy_public_data_communesol(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_communesol",
            to_table="public.public_data_communesol",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["city_id"],
                ["matrix_id"],
                ["year"],
            ],
        )

    @task.python
    def copy_public_data_ocsgediff(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_ocsgediff",
            to_table="public.public_data_ocsgediff",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
            btree_index_columns=[
                ["year_old"],
                ["year_new"],
                ["departement"],
                ["cs_new"],
                ["cs_old"],
                ["us_new"],
                ["us_old"],
            ],
        )

    @task.python
    def copy_public_data_communediff(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_communediff",
            to_table="public.public_data_communediff",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["year_old"],
                ["year_new"],
                ["city_id"],
            ],
        )

    @task.python
    def copy_public_data_zoneconstruite(**context):
        return copy_table_from_dw_to_app(
            from_table="public_ocsge.for_app_zoneconstruite",
            to_table="public.public_data_zoneconstruite",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
            btree_index_columns=[
                ["millesime"],
                ["year"],
                ["departement"],
            ],
        )

    @task.python
    def copy_public_data_zoneurba(**context):
        return copy_table_from_dw_to_app(
            from_table="public_gpu.for_app_zoneurba",
            to_table="public.public_data_zoneurba",
            environment=context["params"]["environment"],
            spatial_index_column="mpoly",
            btree_index_columns=[
                ["checksum"],
                ["libelle"],
                ["typezone"],
            ],
        )

    (
        copy_public_data_artificialarea()
        >> copy_public_data_artifareazoneurba()
        >> copy_public_data_commune()
        >> copy_public_data_departement()
        >> copy_public_data_communesol()
        >> copy_public_data_ocsgediff()
        >> copy_public_data_communediff()
        >> copy_public_data_zoneconstruite()
        >> copy_public_data_ocsge()
        >> copy_public_data_zoneurba()
    )


update_app()
