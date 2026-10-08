"""
Ce dag met à jour les données de l'application à partir des données de l'entrepôt de données.
"""

import hashlib
import subprocess
from logging import getLogger

from gdaltools import PgConnectionString
from include.container import InfraContainer as Container
from pendulum import datetime
from psycopg2.extensions import connection

from airflow.decorators import dag, task
from airflow.models.param import Param
from airflow.utils.trigger_rule import TriggerRule

STAGING = "staging"
PRODUCTION = "production"
DEV = "dev"

logger = getLogger(__name__)

OGR2OGR_PATH = "/usr/bin/ogr2ogr"
# PG_USE_COPY accélère l'insertion ; OGR_TRUNCATE=NO force ogr2ogr à recréer la table
# (DROP + CREATE) plutôt qu'à la vider, ce qui nous donne le schéma du modèle amont.
OGR_CONFIG_OPTIONS = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
# Défaut du driver PostgreSQL : une table peut mêler géométries simples et multiples.
DEFAULT_GEOM_TYPE = "PROMOTE_TO_MULTI"

# Les tables sont reconstruites dans ce schéma puis basculées dans "public" en une
# seule transaction, pour éviter que l'application ne voie une table absente ou
# partielle pendant la copie.
SWAP_SCHEMA = "app_swap"
APP_SCHEMA = "public"

POSTGRES_MAX_IDENTIFIER_LENGTH = 63


def get_gdal_connection(environment: str) -> PgConnectionString:
    return {
        STAGING: Container().gdal_staging_conn,
        PRODUCTION: Container().gdal_prod_conn,
        DEV: Container().gdal_dev_conn,
    }[environment]()


def get_psycopg_connection(environment: str) -> connection:
    return {
        STAGING: Container().psycopg2_staging_conn,
        PRODUCTION: Container().psycopg2_prod_conn,
        DEV: Container().psycopg2_dev_conn,
    }[environment]()


def get_index_name(table_name: str, columns_name: list[str]) -> str:
    """Nom d'index indépendant du schéma, borné à la limite d'identifiant de Postgres.

    Le SET SCHEMA déplace l'index avec sa table : un nom construit à partir du schéma de
    bascule resterait collé à la table publiée. On le dérive donc du seul nom de table,
    pour que l'index publié porte le même nom d'un run à l'autre.
    """
    bare_table_name = table_name.split(".")[-1]
    idx_name = f"{bare_table_name}_{'_'.join(columns_name)}_idx"

    if len(idx_name) <= POSTGRES_MAX_IDENTIFIER_LENGTH:
        return idx_name

    # Au-delà de 63 octets Postgres tronque silencieusement, ce qui peut faire coïncider
    # deux index distincts. On tronque nous-mêmes, avec un suffixe déterministe.
    digest = hashlib.sha256(idx_name.encode()).hexdigest()[:8]
    return f"{idx_name[: POSTGRES_MAX_IDENTIFIER_LENGTH - len(digest) - 1]}_{digest}"


def get_btree_index_request(table_name: str, columns_name: list[str]):
    idx_name = get_index_name(table_name, columns_name)
    return f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table_name} USING btree ({', '.join(columns_name)});"


def build_ogr2ogr_command(
    from_table: str,
    to_table: str,
    target_dsn: str,
    source_dsn: str,
    geom_type: str = None,
    custom_columns_type: dict[str, str] = None,
) -> list[str]:
    # LAUNDER met les identifiants en minuscules, FID ajoute une colonne id si absente.
    layer_creation_options = {"LAUNDER": "YES"}
    if custom_columns_type:
        layer_creation_options["COLUMN_TYPES"] = ",".join(
            f"{column}:{column_type}" for column, column_type in custom_columns_type.items()
        )
    layer_creation_options["FID"] = "id"

    command = [OGR2OGR_PATH, "-overwrite", "-f", "PostgreSQL"]

    for key, value in layer_creation_options.items():
        command += ["-lco", f"{key}={value}"]

    for key, value in OGR_CONFIG_OPTIONS.items():
        command += ["--config", key, value]

    command += ["-nln", to_table]
    command += ["-nlt", geom_type or DEFAULT_GEOM_TYPE]
    # ogr2ogr attend la destination avant la source.
    command += [target_dsn, source_dsn, from_table]

    return command


def copy_table_from_datawarehouse_to_app(
    from_table: str,
    to_table: str,
    environment: str,
    geom_type=None,
    custom_columns_type: dict[str, str] = None,
    btree_index_columns: list[list[str]] = None,
):
    # to_table désigne la destination finale ; la copie, elle, atterrit dans SWAP_SCHEMA
    # et n'est publiée que par swap_tables(), une fois toutes les copies terminées.
    staging_table = f"{SWAP_SCHEMA}.{to_table.split('.')[-1]}"

    source_conn = Container().gdal_dbt_conn()
    target_conn = get_gdal_connection(environment)

    build_arguments = {
        "from_table": from_table,
        "to_table": staging_table,
        "geom_type": geom_type,
        "custom_columns_type": custom_columns_type,
    }
    command = build_ogr2ogr_command(
        target_dsn=target_conn.encode(),
        source_dsn=source_conn.encode(),
        **build_arguments,
    )
    safe_command = build_ogr2ogr_command(
        target_dsn=str(target_conn),
        source_dsn=str(source_conn),
        **build_arguments,
    )

    # Pas de check=True : CalledProcessError porterait la commande complète, mot de passe
    # compris, dans son message et finirait dans les logs Airflow.
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error("ogr2ogr a échoué : %s", " ".join(safe_command))
        logger.error("stderr : %s", result.stderr)
        raise RuntimeError(f"ogr2ogr a échoué (code {result.returncode}) pour {staging_table}")

    index_requests = []

    if btree_index_columns:
        for columns in btree_index_columns:
            index_requests.append(get_btree_index_request(staging_table, columns))

    conn = get_psycopg_connection(environment)
    try:
        with conn, conn.cursor() as cur:
            for request in index_requests:
                cur.execute(request)
    finally:
        conn.close()

    return {
        "staging_table": staging_table,
        "index_requests": index_requests,
        "ogr2ogr_request": safe_command,
    }


def reset_swap_schema(environment: str) -> None:
    """Repart d'un schéma de bascule vide.

    Le teardown nettoie déjà en fin de run, mais il peut avoir été désactivé
    (keep_swap_schema) ou ne pas s'être exécuté du tout. Sans ce nettoyage d'entrée,
    swap_tables() publierait les données périmées du run précédent.
    """
    conn = get_psycopg_connection(environment)
    try:
        with conn, conn.cursor() as cur:
            cur.execute(f"DROP SCHEMA IF EXISTS {SWAP_SCHEMA} CASCADE")
            cur.execute(f"CREATE SCHEMA {SWAP_SCHEMA}")
    finally:
        conn.close()


def swap_staged_tables(environment: str, lock_timeout: str = "30s") -> list[str]:
    """Publie toutes les tables du schéma de bascule, en une seule transaction.

    Chaque table remplace son homologue dans APP_SCHEMA. Les index, contraintes et
    séquences suivent la table lors du SET SCHEMA, il n'y a donc rien à renommer.
    """
    conn = get_psycopg_connection(environment)
    try:
        with conn, conn.cursor() as cur:
            # Si l'application tient un verrou sur une des tables, mieux vaut échouer vite
            # et tout annuler que de bloquer ses requêtes le temps de la bascule.
            cur.execute("SET lock_timeout = %s", (lock_timeout,))
            cur.execute(
                "SELECT tablename FROM pg_tables WHERE schemaname = %s ORDER BY tablename",
                (SWAP_SCHEMA,),
            )
            staged_tables = [row[0] for row in cur.fetchall()]

            if not staged_tables:
                raise ValueError(f"Aucune table à publier dans le schéma {SWAP_SCHEMA}.")

            for table_name in staged_tables:
                # Le DROP libère le nom de la table et ceux de ses index.
                cur.execute(f'DROP TABLE IF EXISTS {APP_SCHEMA}."{table_name}"')
                cur.execute(f'ALTER TABLE {SWAP_SCHEMA}."{table_name}" SET SCHEMA {APP_SCHEMA}')
    finally:
        conn.close()

    return staged_tables


def drop_swap_schema(environment: str) -> None:
    """Supprime le schéma de bascule et tout ce qu'il contient."""
    conn = get_psycopg_connection(environment)
    try:
        with conn, conn.cursor() as cur:
            cur.execute(f"DROP SCHEMA IF EXISTS {SWAP_SCHEMA} CASCADE")
    finally:
        conn.close()


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 0},
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
                "copy_public_data_land_geojson",
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
                "copy_public_data_dc_categories_socioprofessionnelles",
                "copy_public_data_dc_activite_chomage",
                "copy_public_data_dc_emplois_lieu_travail",
                "copy_public_data_dc_revenus_pauvrete",
                "copy_public_data_dc_creations_entreprises",
                "copy_public_data_dc_tourisme",
                "copy_public_data_dc_equipements_bpe",
                "copy_public_data_bivariate_land_rate",
                "copy_public_data_bivariate_conso_threshold",
                "copy_public_data_bivariate_indic_threshold",
            ],
            type="array",
        ),
        # Le teardown supprime le schéma de bascule même quand le run a échoué. Passer ce
        # paramètre à true le conserve, pour pouvoir inspecter ce qui avait été copié.
        "keep_swap_schema": Param(default=False, type="boolean"),
    },
)
def update_app():  # noqa: C901
    @task.python
    def copy_public_data_landconso(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landconso",
            to_table="public.public_data_landconso",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_landconsocomparison(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landconsocomparison",
            to_table="public.public_data_landconsocomparison",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_landconsostats(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landconsostats",
            to_table="public.public_data_landconsostats",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_landpop(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landpop",
            to_table="public.public_data_landpop",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_landpopstats(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landpopstats",
            to_table="public.public_data_landpopstats",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "from_year", "to_year"],
            ],
        )

    @task.python
    def copy_public_data_landpopulationdensity(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landpopulationdensity",
            to_table="public.public_data_landpopulationdensity",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_nearestterritories(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_nearest_territories",
            to_table="public.public_data_nearestterritories",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_logementvacant(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_logementvacant",
            to_table="public.public_data_logementvacant",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_autorisationlogement(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_autorisationlogement",
            to_table="public.public_data_autorisationlogement",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "year"],
            ],
        )

    @task.python
    def copy_public_data_artifzonage(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landimperflux",
            to_table="public.public_data_landimperflux",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["departement"]],
        )

    @task.python
    def copy_public_data_landimperfluxindex(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landimperfluxcouverturecomposition",
            to_table="public.public_data_landimperfluxcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["couverture"]],
        )

    @task.python
    def copy_public_data_landimperfluxcouverturecompositionindex(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landimperfluxusagecomposition",
            to_table="public.public_data_landimperfluxusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["usage"]],
        )

    @task.python
    def copy_public_data_landimperfluxusagecompositionindex(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landimperfluxusagecompositionindex",
            to_table="public.public_data_landimperfluxusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["millesime_old_index", "millesime_new_index"], ["usage"]],
        )

    @task.python
    def copy_public_data_landartifflux(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landartifflux",
            to_table="public.public_data_landartifflux",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["departement"]],
        )

    @task.python
    def copy_public_data_landartiffluxindex(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landartiffluxcouverturecomposition",
            to_table="public.public_data_landartiffluxcouverturecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["couverture"]],
        )

    @task.python
    def copy_public_data_landartiffluxcouverturecompositionindex(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landartiffluxusagecomposition",
            to_table="public.public_data_landartiffluxusagecomposition",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["year_old", "year_new"], ["usage"]],
        )

    @task.python
    def copy_public_data_landartiffluxusagecompositionindex(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landartiffluxusagecompositionindex",
            to_table="public.public_data_landartiffluxusagecompositionindex",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"], ["millesime_old_index", "millesime_new_index"], ["usage"]],
        )

    @task.python
    def copy_public_data_land(**context):
        return copy_table_from_datawarehouse_to_app(
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
        )

    @task.python
    def copy_public_data_land_geojson(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_land_geojson",
            to_table="public.public_data_land_geojson",
            environment=context["params"]["environment"],
            custom_columns_type={
                "geojson": "jsonb",
            },
            btree_index_columns=[
                ["land_id", "land_type", "child_land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichepollution(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichepollution",
            to_table="public.public_data_landfrichepollution",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichestatut(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichestatut",
            to_table="public.public_data_landfrichestatut",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichesurfacerank(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichesurfacerank",
            to_table="public.public_data_landfrichesurfacerank",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichetype(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichetype",
            to_table="public.public_data_landfrichetype",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezonageenvironnementale(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichezonageenvironnementale",
            to_table="public.public_data_landfrichezonageenvironnementale",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezonagetype(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichezonagetype",
            to_table="public.public_data_landfrichezonagetype",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfrichezoneactivite(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landfrichezoneactivite",
            to_table="public.public_data_landfrichezoneactivite",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_landfriche(**context):
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
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
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_landcarroyagebounds",
            to_table="public.public_data_landcarroyagebounds",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_id", "land_type", "start_year", "end_year", "destination"],
            ],
        )

    @task.python
    def copy_public_data_dc_population(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_population",
            to_table="public.public_data_dc_population",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_menages(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_menages",
            to_table="public.public_data_dc_menages",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_logement(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_logement",
            to_table="public.public_data_dc_logement",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_categories_socioprofessionnelles(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_categories_socioprofessionnelles",
            to_table="public.public_data_dc_categories_socioprofessionnelles",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_activite_chomage(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_activite_chomage",
            to_table="public.public_data_dc_activite_chomage",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_emplois_lieu_travail(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_emplois_lieu_travail",
            to_table="public.public_data_dc_emplois_lieu_travail",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_revenus_pauvrete(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_revenus_pauvrete",
            to_table="public.public_data_dc_revenus_pauvrete",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_creations_entreprises(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_creations_entreprises",
            to_table="public.public_data_dc_creations_entreprises",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_tourisme(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_tourisme",
            to_table="public.public_data_dc_tourisme",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_dc_equipements_bpe(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_dc_equipements_bpe",
            to_table="public.public_data_dc_equipements_bpe",
            environment=context["params"]["environment"],
            btree_index_columns=[["land_id", "land_type"]],
        )

    @task.python
    def copy_public_data_bivariate_land_rate(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_bivariate_land_rate",
            to_table="public.public_data_bivariate_land_rate",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["indicator", "land_type", "start_year", "end_year"],
                ["land_id", "land_type"],
            ],
        )

    @task.python
    def copy_public_data_bivariate_conso_threshold(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_bivariate_conso_threshold",
            to_table="public.public_data_bivariate_conso_threshold",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["land_type", "conso_field", "start_year", "end_year"],
            ],
        )

    @task.python
    def copy_public_data_bivariate_indic_threshold(**context):
        return copy_table_from_datawarehouse_to_app(
            from_table="public_for_app.for_app_bivariate_indic_threshold",
            to_table="public.public_data_bivariate_indic_threshold",
            environment=context["params"]["environment"],
            btree_index_columns=[
                ["indicator", "land_type", "start_year", "end_year"],
            ],
        )

    @task.python
    def prepare_swap_schema(**context):
        reset_swap_schema(context["params"]["environment"])

    @task.branch
    def copy_public_data_branch(**context):
        return context["params"]["tasks"]

    # copy_public_data_branch marque "skipped" toute copie absente du paramètre "tasks".
    # Avec la règle par défaut (all_success), un seul upstream skipped empêcherait la
    # bascule de s'exécuter : un run partiel ne publierait donc jamais rien.
    # NONE_FAILED_MIN_ONE_SUCCESS tolère les skipped, mais toujours pas les échecs.
    @task.python(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def swap_tables(**context):
        return {"swapped_tables": swap_staged_tables(context["params"]["environment"])}

    @task.python
    def cleanup_swap_schema(**context):
        if context["params"]["keep_swap_schema"]:
            return {"dropped": False, "reason": "keep_swap_schema"}

        drop_swap_schema(context["params"]["environment"])
        return {"dropped": True}

    copy_tasks = [
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
        copy_public_data_land_geojson(),
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
        copy_public_data_dc_categories_socioprofessionnelles(),
        copy_public_data_dc_activite_chomage(),
        copy_public_data_dc_emplois_lieu_travail(),
        copy_public_data_dc_revenus_pauvrete(),
        copy_public_data_dc_creations_entreprises(),
        copy_public_data_dc_tourisme(),
        copy_public_data_dc_equipements_bpe(),
        copy_public_data_bivariate_land_rate(),
        copy_public_data_bivariate_conso_threshold(),
        copy_public_data_bivariate_indic_threshold(),
    ]

    prepare = prepare_swap_schema().as_setup()
    # Teardown : s'exécute même quand une copie ou la bascule a échoué, et reste exclu du
    # calcul d'état du DAG run — c'est swap_tables qui décide si le run est en échec.
    cleanup = cleanup_swap_schema().as_teardown()

    prepare >> copy_public_data_branch() >> copy_tasks >> swap_tables() >> cleanup
    # ALL_DONE_SETUP_SUCCESS ne compte que les setups en amont direct : sans cette arête,
    # le teardown ne saurait pas que le schéma n'a jamais été créé.
    prepare >> cleanup


update_app()
