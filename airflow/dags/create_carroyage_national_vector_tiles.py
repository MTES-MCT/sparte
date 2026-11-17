"""
DAG qui produit les tuiles vectorielles allégées du carroyage de consommation d'espaces
pour la carte nationale (`/carte`, France entière et Hexagone).

Le fichier `carroyage_lea.pmtiles` des diagnostics contient tous les attributs (98 colonnes)
à tous les zooms : ses tuiles de petite échelle pèsent des dizaines de Mo, ce qui le rend
inutilisable pour afficher la France entière. Ce DAG en produit une version allégée,
`carroyage_national.pmtiles` : consommation totale par année seulement, zooms 3 à 8.

Le fichier est multi-résolution. À l'échelle du pays un carreau de 1 km fait moins d'un
pixel : les petits zooms reçoivent donc des blocs de 5 km puis 2 km de côté, calculés par le
modèle dbt `for_vector_tiles_carroyage_national`, qui portent la même densité (m² par km²)
sous les mêmes attributs que les carreaux de 1 km. Voir `ZOOMS_BY_RESOLUTION_KM`.

Le DAG produit aussi un fichier par destination de la consommation (`DESTINATIONS`), pour que
la carte ne charge que celle qui est affichée : `carroyage_national_<destination>.pmtiles`,
calculé par le modèle `for_vector_tiles_carroyage_national_<destination>` avec les mêmes
résolutions, les mêmes attributs et les mêmes options que le fichier de la consommation totale.
Chaque fichier contient une seule couche, qui porte son nom sans l'extension (voir
`get_tileset_names`).

Les sept modèles sont construits ensemble, à partir du même état de la source : les tests dbt
comparent la somme des destinations au total.

Prérequis : le DAG `ingest_carroyage_lea` a déjà tourné (le modèle
`for_vector_tiles_carroyage_lea` existe).
"""

from include import vector_tiles
from include.container import DomainContainer
from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.utils import multiline_string_to_single_line
from include.vector_tiles import get_zoom_bounds
from pendulum import datetime

from airflow.sdk import TaskGroup, dag, task

VECTOR_TILES_DIR = "vector_tiles"
VECTOR_TILES_SCHEMA = "public_for_vector_tiles"
DBT_MODEL_PREFIX = "for_vector_tiles_"

# Jeu de tuiles de la consommation totale, et destinations qui ont chacune le leur. Les
# destinations doivent être celles de la macro dbt `carroyage_national_destinations` : un test
# pytest compare les deux listes.
TOTAL_TILESET_NAME = "carroyage_national"
DESTINATIONS = ["habitat", "activite", "mixte", "route", "ferroviaire", "inconnu"]

RESOLUTION_ATTRIBUTE = "resolution_km"

# Plage de zooms de tuiles (premier, dernier) servie par chaque résolution du modèle dbt
# (côté du bloc en km). Les résolutions doivent être celles de la macro dbt
# `carroyage_national_resolutions_km` : un test pytest compare les deux listes.
#
# MapLibre affiche les tuiles du zoom z entre les zooms de carte z et z + 1, où un pixel
# couvre, à la latitude de la France (46,5° N), de 53 880 / 2^z mètres à la moitié. Côté
# d'une maille à l'écran selon le zoom de tuile :
#
#   zoom   1 km partout      résolution retenue
#   3      0,15 à 0,3 px     5 km : 0,7 à 1,5 px
#   4      0,3 à 0,6 px      5 km : 1,5 à 3 px
#   5      0,6 à 1,2 px      5 km : 3 à 6 px
#   6      1,2 à 2,4 px      2 km : 2,4 à 4,8 px
#   7      2,4 à 4,8 px      1 km : 2,4 à 4,8 px
#   8      4,8 à 9,5 px      1 km : 4,8 à 9,5 px (et davantage au-delà, en surzoom)
#
# À partir du zoom 5, chaque zoom reçoit la résolution la plus fine dont la maille fait au
# moins 2,4 px : en dessous, le détail ne se voit pas et ne fait qu'alourdir les tuiles. Aux
# zooms 3 et 4 les blocs de 5 km suffisent : tout le pays tient en 21 775 blocs (255 233
# carreaux de 1 km), qu'une vue France entière charge tous.
# Le zoom 8 est le dernier : au-delà, la carte nationale affiche un territoire et lit le
# fichier complet des diagnostics.
ZOOMS_BY_RESOLUTION_KM: dict[int, tuple[int, int]] = {
    5: (3, 5),
    2: (6, 6),
    1: (7, 8),
}


def get_destination_tileset_name(destination: str) -> str:
    return f"{TOTAL_TILESET_NAME}_{destination}"


def get_tileset_names() -> list[str]:
    """
    Retourne les noms des jeux de tuiles produits : celui de la consommation totale, puis
    celui de chaque destination.

    Tout se déduit de ce nom : le modèle dbt (`for_vector_tiles_<nom>`), l'export
    (`<nom>.geojson`), le fichier de tuiles (`<nom>.pmtiles`) et sa couche (`<nom>` :
    tippecanoe nomme la couche d'après le fichier qu'il lit).
    """
    return [TOTAL_TILESET_NAME, *(get_destination_tileset_name(destination) for destination in DESTINATIONS)]


def get_dbt_model_name(tileset_name: str) -> str:
    return f"{DBT_MODEL_PREFIX}{tileset_name}"


def get_geojson_key(tileset_name: str) -> str:
    return f"{VECTOR_TILES_DIR}/{tileset_name}.geojson"


def get_pmtiles_key(tileset_name: str) -> str:
    return f"{VECTOR_TILES_DIR}/{tileset_name}.pmtiles"


def get_resolution_by_zoom_filter(zooms_by_resolution_km: dict[int, tuple[int, int]]) -> str:
    """Filtre tippecanoe qui ne garde, dans les tuiles de chaque zoom, que les entités de la résolution prévue."""
    return vector_tiles.get_resolution_by_zoom_filter(RESOLUTION_ATTRIBUTE, zooms_by_resolution_km)


def get_tippecanoe_options(zooms_by_resolution_km: dict[int, tuple[int, int]]) -> list[str]:
    first_zoom, last_zoom = get_zoom_bounds(zooms_by_resolution_km)
    return [
        "--read-parallel",
        "--force",
        # Des carrés jointifs, d'un pixel ou moins aux plus petits zooms : on ne veut ni les
        # simplifier ni les supprimer
        "--no-simplification-of-shared-nodes",
        "--no-tiny-polygon-reduction",
        "--no-line-simplification",
        "--no-feature-limit",
        "--no-tile-size-limit",
        f"-Z{first_zoom}",
        f"-z{last_zoom}",
        f"--feature-filter={get_resolution_by_zoom_filter(zooms_by_resolution_km)}",
        # L'identifiant ne sert pas à la carte, et une chaîne unique par entité se compresse
        # mal : sans lui les tuiles pèsent 14 à 27 % de moins selon le zoom
        "--exclude=idcarreau",
    ]


TIPPECANOE_OPTIONS = get_tippecanoe_options(ZOOMS_BY_RESOLUTION_KM)


@dag(
    start_date=datetime(2026, 11, 12),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    # Sept exports puis sept passages de tippecanoe : deux à la fois au plus, pour ne pas
    # saturer l'entrepôt ni la machine qui écrit les tuiles
    max_active_tasks=2,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Majic", "Cerema", "Carte nationale"],
)
def create_carroyage_national_vector_tiles():
    bucket_name = Container().bucket_name()

    # Sans « + » : seuls les modèles allégés sont construits, pas leurs parents
    dbt_build = DbtBuild(select=[get_dbt_model_name(tileset_name) for tileset_name in get_tileset_names()], retries=0)

    @task.python
    def postgis_to_geojson(tileset_name: str):
        """Exporte un carroyage allégé, toutes résolutions empilées, vers GeoJSONSeq."""
        sql = f"""
            SELECT
                *
            FROM
                {VECTOR_TILES_SCHEMA}.{get_dbt_model_name(tileset_name)}
        """
        return (
            DomainContainer()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),
                s3_key=get_geojson_key(tileset_name),
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def geojson_to_pmtiles(tileset_name: str) -> str:
        """Convertit le GeoJSON en PMTiles avec tippecanoe et l'upload sur S3."""
        path_on_s3 = (
            DomainContainer()
            .geojson_on_s3_to_pmtiles_on_s3_handler()
            .convert_geojson_to_pmtiles_on_s3(
                s3_bucket=bucket_name,
                s3_geojson_key=get_geojson_key(tileset_name),
                s3_pmtiles_key=get_pmtiles_key(tileset_name),
                tippecanoe_options=TIPPECANOE_OPTIONS,
            )
        )
        if path_on_s3 is None:
            raise ValueError(f"Le carroyage {tileset_name} ne contient pas assez de données pour générer des tuiles")
        return path_on_s3

    @task.python
    def make_pmtiles_public(tileset_name: str):
        """Rend le fichier PMTiles accessible publiquement."""
        DomainContainer().s3_handler().set_key_publicly_visible(get_pmtiles_key(tileset_name), bucket_name)

    def publish_tileset(tileset_name: str):
        """Enchaîne l'export, la conversion et la publication d'un jeu de tuiles, après dbt."""
        (
            dbt_build
            >> postgis_to_geojson(tileset_name)
            >> geojson_to_pmtiles(tileset_name)
            >> make_pmtiles_public(tileset_name)
        )

    # Les tâches de la consommation totale gardent leur nom ; celles d'une destination sont
    # regroupées sous le sien (`habitat.postgis_to_geojson`, etc.)
    publish_tileset(TOTAL_TILESET_NAME)
    for destination in DESTINATIONS:
        with TaskGroup(group_id=destination):
            publish_tileset(get_destination_tileset_name(destination))


create_carroyage_national_vector_tiles()
