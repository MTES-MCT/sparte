"""
Ce dag met à jour les données de l'application à partir des données de l'entrepôt de données.
"""

from gdaltools import PgConnectionString, ogr2ogr
from include.container import InfraContainer as Container
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

STAGING = "staging"
PRODUCTION = "production"
DEV = "dev"

GDAL = "gdal"
PSYCOPG = "psycopg"

DEFAULT_SUBSET_GEOM_SELECT = (
    "SELECT simple_geom FROM public_for_app.for_app_land WHERE land_id = '75' AND land_type = 'DEPART'"
)


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
    geom_type=None,
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

    if geom_type:
        ogr.geom_type = geom_type

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
                "copy_public_data_landconso",
                "copy_public_data_landconsocomparison",
                "copy_public_data_landconsostats",
                "copy_public_data_landpop",
                "copy_public_data_landpopstats",
                "copy_public_data_landpopulationdensity",
                "copy_public_data_nearestterritories",
                "copy_public_data_logementvacant",
                "copy_public_data_autorisationlogement",
                "copy_public_data_artifzonage",
                "copy_public_data_artifzonageindex",
                "copy_public_data_landartifstock",
                "copy_public_data_landartifstockindex",
                "copy_public_data_landartifstockcouverturecomposition",
                "copy_public_data_landartifstockcouverturecompositionindex",
                "copy_public_data_landartifstockusagecomposition",
                "copy_public_data_landartifstockusagecompositionindex",
                "copy_public_data_imperzonage",
                "copy_public_data_imperzonageindex",
                "copy_public_data_landimperstock",
                "copy_public_data_landimperstockindex",
                "copy_public_data_landimperstockcouverturecomposition",
                "copy_public_data_landimperstockcouverturecompositionindex",
                "copy_public_data_landimperstockusagecomposition",
                "copy_public_data_landimperstockusagecompositionindex",
                "copy_public_data_landimperflux",
                "copy_public_data_landimperfluxindex",
                "copy_public_data_landimperfluxcouverturecomposition",
                "copy_public_data_landimperfluxcouverturecompositionindex",
                "copy_public_data_landimperfluxusagecomposition",
                "copy_public_data_landimperfluxusagecompositionindex",
                "copy_public_data_landartifflux",
                "copy_public_data_landartiffluxindex",
                "copy_public_data_landartiffluxcouverturecomposition",
                "copy_public_data_landartiffluxcouverturecompositionindex",
                "copy_public_data_landartiffluxusagecomposition",
                "copy_public_data_landartiffluxusagecompositionindex",
                "copy_public_data_land",
                "copy_public_data_landfrichepollution",
                "copy_public_data_landfrichestatut",
                "copy_public_data_landfrichesurfacerank",
                "copy_public_data_landfrichetype",
                "copy_public_data_landfrichezonageenvironnementale",
                "copy_public_data_landfrichezonagetype",
                "copy_public_data_landfrichezoneactivite",
                "copy_public_data_landfriche",
                "copy_public_data_landfrichegeojson",
                "copy_public_data_landcarroyagebounds",
                "copy_public_data_dc_population",
                "copy_public_data_dc_menages",
                "copy_public_data_dc_logement",
                "copy_public_data_dc_mobilite_residentielle",
                "copy_public_data_dc_categories_socioprofessionnelles",
                "copy_public_data_dc_situation_conjugale",
                "copy_public_data_dc_scolarisation_diplomes",
                "copy_public_data_dc_emploi_statut",
                "copy_public_data_dc_deplacements_domicile_travail",
                "copy_public_data_dc_activite_chomage",
                "copy_public_data_dc_emplois_lieu_travail",
                "copy_public_data_dc_logement_confort",
                "copy_public_data_dc_historique",
                "copy_public_data_dc_revenus_pauvrete",
                "copy_public_data_dc_salaires",
                "copy_public_data_dc_etablissements",
                "copy_public_data_dc_creations_entreprises",
                "copy_public_data_dc_creations_etablissements",
                "copy_public_data_dc_unites_legales_actives",
                "copy_public_data_dc_tourisme",
                "copy_public_data_dc_electeurs",
                "copy_public_data_dc_equipements_bpe",
            ],
            type="array",
        ),
        "subset_geom": Param(default=DEFAULT_SUBSET_GEOM_SELECT, type="string"),
        "use_subset": Param(default=False, type="boolean"),
    },
)
def update_app():  # noqa: C901
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
    def copy_public_data_landpopulationdensity(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landpopulationdensity",
            to_table="public.public_data_landpopulationdensity",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_nearestterritories(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_nearest_territories",
            to_table="public.public_data_nearestterritories",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
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
    def copy_public_data_artifzonageindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_artifzonageindex",
            to_table="public.public_data_artifzonageindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
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
    def copy_public_data_imperzonage(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_imperzonage",
            to_table="public.public_data_imperzonage",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["zonage_type"],
            ],
        )

    @task.python
    def copy_public_data_imperzonageindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_imperzonageindex",
            to_table="public.public_data_imperzonageindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
                ["zonage_type"],
            ],
        )

    @task.python
    def copy_public_data_landimperstock(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstock",
            to_table="public.public_data_landimperstock",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
            ],
        )

    @task.python
    def copy_public_data_landimperstockindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstockindex",
            to_table="public.public_data_landimperstockindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
            ],
        )

    @task.python
    def copy_public_data_landimperstockcouverturecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstockcouverturecomposition",
            to_table="public.public_data_landimperstockcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landimperstockcouverturecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstockcouverturecompositionindex",
            to_table="public.public_data_landimperstockcouverturecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landimperstockusagecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstockusagecomposition",
            to_table="public.public_data_landimperstockusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["year"],
                ["usage"],
            ],
        )

    @task.python
    def copy_public_data_landimperstockusagecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperstockusagecompositionindex",
            to_table="public.public_data_landimperstockusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_index"],
                ["usage"],
            ],
        )

    @task.python
    def copy_public_data_landimperflux(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperflux",
            to_table="public.public_data_landimperflux",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["departement"]],
        )

    @task.python
    def copy_public_data_landimperfluxindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperfluxindex",
            to_table="public.public_data_landimperfluxindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_old_index", "millesime_new_index"],
            ],
        )

    @task.python
    def copy_public_data_landimperfluxcouverturecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperfluxcouverturecomposition",
            to_table="public.public_data_landimperfluxcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["couverture"]],
        )

    @task.python
    def copy_public_data_landimperfluxcouverturecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperfluxcouverturecompositionindex",
            to_table="public.public_data_landimperfluxcouverturecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_old_index", "millesime_new_index"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landimperfluxusagecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperfluxusagecomposition",
            to_table="public.public_data_landimperfluxusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["usage"]],
        )

    @task.python
    def copy_public_data_landimperfluxusagecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landimperfluxusagecompositionindex",
            to_table="public.public_data_landimperfluxusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["millesime_old_index", "millesime_new_index"], ["usage"]],
        )

    @task.python
    def copy_public_data_landartifflux(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartifflux",
            to_table="public.public_data_landartifflux",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["departement"]],
        )

    @task.python
    def copy_public_data_landartiffluxindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartiffluxindex",
            to_table="public.public_data_landartiffluxindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_old_index", "millesime_new_index"],
            ],
        )

    @task.python
    def copy_public_data_landartiffluxcouverturecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartiffluxcouverturecomposition",
            to_table="public.public_data_landartiffluxcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["couverture"]],
        )

    @task.python
    def copy_public_data_landartiffluxcouverturecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartiffluxcouverturecompositionindex",
            to_table="public.public_data_landartiffluxcouverturecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
                ["millesime_old_index", "millesime_new_index"],
                ["couverture"],
            ],
        )

    @task.python
    def copy_public_data_landartiffluxusagecomposition(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartiffluxusagecomposition",
            to_table="public.public_data_landartiffluxusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["usage"]],
        )

    @task.python
    def copy_public_data_landartiffluxusagecompositionindex(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landartiffluxusagecompositionindex",
            to_table="public.public_data_landartiffluxusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["millesime_old_index", "millesime_new_index"], ["usage"]],
        )

    @task.python
    def copy_public_data_land(**context):
        return (
            copy_table_from_dw_to_app(
                from_table="public_for_app.for_app_land",
                to_table="public.public_data_land",
                environment=context["params"]["environment"],
                custom_columns_type={
                    "friche_status_details": "jsonb",
                    "conso_details": "jsonb",
                    "logements_vacants_status_details": "jsonb",
                    "millesimes": "jsonb[]",
                    "millesimes_by_index": "jsonb[]",
                },
                btree_index_columns=[
                    ["land_id", "land_type", "child_land_types", "parent_keys"],
                ],
            ),
        )

    @task.python
    def copy_public_data_landfrichepollution(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichepollution",
            to_table="public.public_data_landfrichepollution",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichestatut(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichestatut",
            to_table="public.public_data_landfrichestatut",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichesurfacerank(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichesurfacerank",
            to_table="public.public_data_landfrichesurfacerank",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichetype(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichetype",
            to_table="public.public_data_landfrichetype",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezonageenvironnementale(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichezonageenvironnementale",
            to_table="public.public_data_landfrichezonageenvironnementale",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezonagetype(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichezonagetype",
            to_table="public.public_data_landfrichezonagetype",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezoneactivite(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichezoneactivite",
            to_table="public.public_data_landfrichezoneactivite",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfriche(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfriche",
            to_table="public.public_data_landfriche",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
            geom_type="POINT",
        )

    @task.python
    def copy_public_data_landfrichegeojson(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landfrichegeojson",
            to_table="public.public_data_landfrichegeojson",
            environment=context["params"]["environment"],
            custom_columns_type={
                "geojson_feature_collection": "jsonb",
                "geojson_centroid_feature_collection": "jsonb",
            },
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landcarroyagebounds(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_landcarroyagebounds",
            to_table="public.public_data_landcarroyagebounds",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "start_year", "end_year", "destination"],
            ],
        )
    @task.python
    def copy_public_data_dc_population(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_population",
            to_table="public.public_data_dc_population",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_menages(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_menages",
            to_table="public.public_data_dc_menages",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_logement(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_logement",
            to_table="public.public_data_dc_logement",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_mobilite_residentielle(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_mobilite_residentielle",
            to_table="public.public_data_dc_mobilite_residentielle",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_categories_socioprofessionnelles(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_categories_socioprofessionnelles",
            to_table="public.public_data_dc_categories_socioprofessionnelles",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_situation_conjugale(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_situation_conjugale",
            to_table="public.public_data_dc_situation_conjugale",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_scolarisation_diplomes(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_scolarisation_diplomes",
            to_table="public.public_data_dc_scolarisation_diplomes",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_emploi_statut(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_emploi_statut",
            to_table="public.public_data_dc_emploi_statut",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_deplacements_domicile_travail(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_deplacements_domicile_travail",
            to_table="public.public_data_dc_deplacements_domicile_travail",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_activite_chomage(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_activite_chomage",
            to_table="public.public_data_dc_activite_chomage",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_emplois_lieu_travail(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_emplois_lieu_travail",
            to_table="public.public_data_dc_emplois_lieu_travail",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_logement_confort(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_logement_confort",
            to_table="public.public_data_dc_logement_confort",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_historique(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_historique",
            to_table="public.public_data_dc_historique",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_revenus_pauvrete(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_revenus_pauvrete",
            to_table="public.public_data_dc_revenus_pauvrete",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_salaires(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_salaires",
            to_table="public.public_data_dc_salaires",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_etablissements(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_etablissements",
            to_table="public.public_data_dc_etablissements",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_creations_entreprises(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_creations_entreprises",
            to_table="public.public_data_dc_creations_entreprises",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_creations_etablissements(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_creations_etablissements",
            to_table="public.public_data_dc_creations_etablissements",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_unites_legales_actives(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_unites_legales_actives",
            to_table="public.public_data_dc_unites_legales_actives",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_tourisme(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_tourisme",
            to_table="public.public_data_dc_tourisme",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_electeurs(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_electeurs",
            to_table="public.public_data_dc_electeurs",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_equipements_bpe(**context):
        return copy_table_from_dw_to_app(
            from_table="public_for_app.for_app_dc_equipements_bpe",
            to_table="public.public_data_dc_equipements_bpe",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.branch
    def copy_public_data_branch(**context):
        return context["params"]["tasks"]

    copy_public_data_branch() >> [
        copy_public_data_landconso(),
        copy_public_data_landconsocomparison(),
        copy_public_data_landconsostats(),
        copy_public_data_landpop(),
        copy_public_data_landpopstats(),
        copy_public_data_landpopulationdensity(),
        copy_public_data_nearestterritories(),
        copy_public_data_logementvacant(),
        copy_public_data_autorisationlogement(),
        copy_public_data_artifzonage(),
        copy_public_data_artifzonageindex(),
        copy_public_data_landartifstock(),
        copy_public_data_landartifstockindex(),
        copy_public_data_landartifstockcouverturecomposition(),
        copy_public_data_landartifstockcouverturecompositionindex(),
        copy_public_data_landartifstockusagecomposition(),
        copy_public_data_landartifstockusagecompositionindex(),
        copy_public_data_imperzonage(),
        copy_public_data_imperzonageindex(),
        copy_public_data_landimperstock(),
        copy_public_data_landimperstockindex(),
        copy_public_data_landimperstockcouverturecomposition(),
        copy_public_data_landimperstockcouverturecompositionindex(),
        copy_public_data_landimperstockusagecomposition(),
        copy_public_data_landimperstockusagecompositionindex(),
        copy_public_data_landimperflux(),
        copy_public_data_landimperfluxindex(),
        copy_public_data_landimperfluxcouverturecomposition(),
        copy_public_data_landimperfluxcouverturecompositionindex(),
        copy_public_data_landimperfluxusagecomposition(),
        copy_public_data_landimperfluxusagecompositionindex(),
        copy_public_data_landartifflux(),
        copy_public_data_landartiffluxindex(),
        copy_public_data_landartiffluxcouverturecomposition(),
        copy_public_data_landartiffluxcouverturecompositionindex(),
        copy_public_data_landartiffluxusagecomposition(),
        copy_public_data_landartiffluxusagecompositionindex(),
        copy_public_data_land(),
        copy_public_data_landfrichepollution(),
        copy_public_data_landfrichestatut(),
        copy_public_data_landfrichesurfacerank(),
        copy_public_data_landfrichetype(),
        copy_public_data_landfrichezonageenvironnementale(),
        copy_public_data_landfrichezonagetype(),
        copy_public_data_landfrichezoneactivite(),
        copy_public_data_landfriche(),
        copy_public_data_landfrichegeojson(),
        copy_public_data_landcarroyagebounds(),
        copy_public_data_dc_population(),
        copy_public_data_dc_menages(),
        copy_public_data_dc_logement(),
        copy_public_data_dc_mobilite_residentielle(),
        copy_public_data_dc_categories_socioprofessionnelles(),
        copy_public_data_dc_situation_conjugale(),
        copy_public_data_dc_scolarisation_diplomes(),
        copy_public_data_dc_emploi_statut(),
        copy_public_data_dc_deplacements_domicile_travail(),
        copy_public_data_dc_activite_chomage(),
        copy_public_data_dc_emplois_lieu_travail(),
        copy_public_data_dc_logement_confort(),
        copy_public_data_dc_historique(),
        copy_public_data_dc_revenus_pauvrete(),
        copy_public_data_dc_salaires(),
        copy_public_data_dc_etablissements(),
        copy_public_data_dc_creations_entreprises(),
        copy_public_data_dc_creations_etablissements(),
        copy_public_data_dc_unites_legales_actives(),
        copy_public_data_dc_tourisme(),
        copy_public_data_dc_electeurs(),
        copy_public_data_dc_equipements_bpe(),
    ]


update_app()
