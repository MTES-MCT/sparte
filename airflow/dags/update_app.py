"""
Ce dag met à jour les données de l'application à partir des données de l'entrepôt de données.
"""

from gdaltools import PgConnectionString, ogr2ogr
from include.container import Container
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

STAGING = "staging"
PRODUCTION = "production"
DEV = "dev"

GDAL = "gdal"
PSYCOPG = "psycopg"

DEFAULT_SUBSET_GEOM_SELECT = "SELECT mpoly FROM public_for_app.for_app_departement WHERE source_id = '75'"


def get_database_connection_string(environment: str) -> PgConnectionString:
    return {
        STAGING: {GDAL: Container().gdal_staging_conn(), PSYCOPG: Container().psycopg2_staging_conn()},
        PRODUCTION: {GDAL: Container().gdal_prod_conn(), PSYCOPG: Container().psycopg2_prod_conn()},
        DEV: {GDAL: Container().gdal_dev_conn(), PSYCOPG: Container().psycopg2_dev_conn()},
    }[environment]


def get_btree_index_request(table_name: str, columns_name: list[str]):
    idx_name = f"{table_name.replace('.', '')}_{'_'.join(columns_name)}_idx"
    return f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table_name} USING btree ({', '.join(columns_name)});"


def copy_table_from_dw_to_app(
    from_table: str,
    to_table: str,
    environment: str,
    custom_columns_type: dict[str, str] = None,
    use_subset: bool = False,
    subset_where: str = None,
    btree_index_columns: list[list[str]] = None,
):
    ogr = ogr2ogr()
    ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
    ogr.set_input(Container().gdal_dbt_conn(), table_name=from_table)
    if use_subset:
        ogr.set_sql(f"SELECT * FROM {from_table} WHERE {subset_where}")
    # the option below will an id column to the table only if it does not exist
    ogr.layer_creation_options = {"FID": "id"}

    if custom_columns_type:
        column_type_mapping = ""

        for column, column_type in custom_columns_type.items():
            column_type_mapping += f"{column}:{column_type},"
        column_type_mapping = column_type_mapping[:-1]  # remove the last comma

        ogr.layer_creation_options = {"COLUMN_TYPES": column_type_mapping, **ogr.layer_creation_options}

    connections = get_database_connection_string(environment)

    ogr.set_output(connections[GDAL], table_name=to_table)
    ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
    ogr.execute()

    index_requests = []

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
    max_active_runs=1,
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
        ),
        "tasks": Param(
            default=[
                "copy_public_data_commune",
                "copy_public_data_departement",
                "copy_public_data_zoneurba",
                "copy_public_data_epci",
                "copy_public_data_scot",
                "copy_public_data_region",
                "copy_public_data_epci_departements",
                "copy_public_data_scot_departements",
                "copy_public_data_scot_regions",
                "copy_public_data_landconso",
                "copy_public_data_landconsocomparison",
                "copy_public_data_landconsostats",
                "copy_public_data_landpop",
                "copy_public_data_landpopstats",
                "copy_public_data_couverturesol",
                "copy_public_data_usagesol",
                "copy_public_data_couvertureusagematrix",
                "copy_public_data_logementvacant",
                "copy_public_data_autorisationlogement",
                "copy_public_data_artifzonage",
                "copy_public_data_landartifstock",
                "copy_public_data_landartifstockindex",
                "copy_public_data_landartifstockcouverturecomposition",
                "copy_public_data_landartifstockcouverturecompositionindex",
                "copy_public_data_landartifstockusagecomposition",
                "copy_public_data_landartifstockusagecompositionindex",
                "copy_public_data_land",
            ],
            type="array",
        ),
        "subset_geom": Param(default=DEFAULT_SUBSET_GEOM_SELECT, type="string"),
        "use_subset": Param(default=False, type="boolean"),
    },
)
def update_app():  # noqa: C901
    @task.python
    def copy_public_data_commune(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_commune",
            to_table="public.public_data_commune",
            use_subset=context["params"]["use_subset"],
            subset_where=f"mpoly && ({context['params']['subset_geom']})",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["insee"],
            ],
        )

    @task.python
    def copy_public_data_departement(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_departement",
            to_table="public.public_data_departement",
            use_subset=context["params"]["use_subset"],
            subset_where=f"mpoly && ({context['params']['subset_geom']})",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["source_id"],
            ],
        )

    @task.python
    def copy_public_data_zoneurba(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_zoneurba",
            to_table="public.public_data_zoneurba",
            use_subset=context["params"]["use_subset"],
            subset_where=f"mpoly && ({context['params']['subset_geom']})",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["checksum"],
                ["libelle"],
                ["typezone"],
            ],
        )

    @task.python
    def copy_public_data_epci(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_epci",
            to_table="public.public_data_epci",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["source_id"],
            ],
        )

    @task.python
    def copy_public_data_scot(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_scot",
            to_table="public.public_data_scot",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["source_id"],
            ],
        )

    @task.python
    def copy_public_data_region(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_region",
            to_table="public.public_data_region",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["source_id"],
            ],
        )

    @task.python
    def copy_public_data_epci_departements(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_epci_departements",
            to_table="public.public_data_epci_departements",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["epci_id"],
                ["departement_id"],
            ],
        )

    @task.python
    def copy_public_data_scot_departements(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_scot_departements",
            to_table="public.public_data_scot_departements",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["scot_id"],
                ["departement_id"],
            ],
        )

    @task.python
    def copy_public_data_scot_regions(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_scot_regions",
            to_table="public.public_data_scot_regions",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["scot_id"],
                ["region_id"],
            ],
        )

    @task.python
    def copy_public_data_landconso(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landconso",
            to_table="public.public_data_landconso",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_landconsocomparison(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landconsocomparison",
            to_table="public.public_data_landconsocomparison",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_landconsostats(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landconsostats",
            to_table="public.public_data_landconsostats",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_landpop(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landpop",
            to_table="public.public_data_landpop",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_landpopstats(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landpopstats",
            to_table="public.public_data_landpopstats",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_couverturesol(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_couverturesol",
            to_table="public.public_data_couverturesol",
            environment=context["params"]["environment"],
            btree_index_columns=[["id"], ["code"], ["label"], ["code_prefix"], ["parent_id"]],
        )

    @task.python
    def copy_public_data_usagesol(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_usagesol",
            to_table="public.public_data_usagesol",
            environment=context["params"]["environment"],
            btree_index_columns=[["id"], ["code"], ["label"], ["code_prefix"], ["parent_id"]],
        )

    @task.python
    def copy_public_data_couvertureusagematrix(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_couvertureusagematrix",
            to_table="public.public_data_couvertureusagematrix",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["id"],
                ["couverture_id"],
                ["usage_id"],
                ["is_artificial"],
                ["is_impermeable"],
            ],
        )

    @task.python
    def copy_public_data_logementvacant(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_logementvacant",
            to_table="public.public_data_logementvacant",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_autorisationlogement(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_autorisationlogement",
            to_table="public.public_data_autorisationlogement",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_artifzonage(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_artifzonage",
            to_table="public.public_data_artifzonage",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["zonage_type"],
            ],
        )

    @task.python
    def copy_public_data_landartifstock(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstock",
            to_table="public.public_data_landartifstock",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
            ],
        )

    @task.python
    def copy_public_data_landartifstockindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstockindex",
            to_table="public.public_data_landartifstockindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
            ],
        )

    @task.python
    def copy_public_data_landartifstockcouverturecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstockcouverturecomposition",
            to_table="public.public_data_landartifstockcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landartifstockcouverturecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstockcouverturecompositionindex",
            to_table="public.public_data_landartifstockcouverturecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landartifstockusagecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstockusagecomposition",
            to_table="public.public_data_landartifstockusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["usage"],
            ],
        )

    @task.python
    def copy_public_data_landartifstockusagecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifstockusagecompositionindex",
            to_table="public.public_data_landartifstockusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
                ["usage"],
            ],
        )

    @task.python
    def copy_public_data_land(**context):
        return (
            copy_table_from_dw_to_app(
                from_table="public_for_app.for_app_land",
                to_table="public.public_data_land",
                environment=context["params"]["environment"],
                custom_columns_type={
                    "millesimes": "jsonb[]",
                    "millesimes_by_index": "jsonb[]",
                },
                btree_index_columns=[
                    ["land_id", "land_type"],
                ],
            ),
        )

    @task.branch
    def copy_public_data_branch(**context):
        return context["params"]["tasks"]

    copy_public_data_branch() >> [
        copy_public_data_commune(),
        copy_public_data_departement(),
        copy_public_data_zoneurba(),
        copy_public_data_epci(),
        copy_public_data_scot(),
        copy_public_data_region(),
        copy_public_data_epci_departements(),
        copy_public_data_scot_departements(),
        copy_public_data_scot_regions(),
        copy_public_data_landconso(),
        copy_public_data_landconsocomparison(),
        copy_public_data_landconsostats(),
        copy_public_data_landpop(),
        copy_public_data_landpopstats(),
        copy_public_data_couverturesol(),
        copy_public_data_usagesol(),
        copy_public_data_couvertureusagematrix(),
        copy_public_data_logementvacant(),
        copy_public_data_autorisationlogement(),
        copy_public_data_artifzonage(),
        copy_public_data_landartifstock(),
        copy_public_data_landartifstockindex(),
        copy_public_data_landartifstockcouverturecomposition(),
        copy_public_data_landartifstockcouverturecompositionindex(),
        copy_public_data_landartifstockusagecomposition(),
        copy_public_data_landartifstockusagecompositionindex(),
        copy_public_data_land(),
    ]


update_app()
