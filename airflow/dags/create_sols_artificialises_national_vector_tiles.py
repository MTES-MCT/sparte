"""
DAG qui produit les tuiles vectorielles des sols artificialisés pour la carte nationale
(`/carte`, de la France entière jusqu'à l'EPCI).

Les tuiles OCS GE des diagnostics (`occupation_du_sol_<millésime>_<département>.pmtiles`)
contiennent tous les objets à tous les zooms : pour un seul département, chaque tuile pèse
12 à 15 Mo aux zooms 4 à 9 et encore 3 Mo au zoom 11. Elles ne peuvent servir ni à l'échelle
du pays ni à celle d'un EPCI. Ce DAG produit un fichier unique et léger,
`sols_artificialises_national.pmtiles` : la part artificialisée de mailles carrées, au
dernier millésime de chaque département.

Le fichier est multi-résolution. Le modèle dbt `for_vector_tiles_sols_artificialises_national`
empile des mailles de 250 m à 5 km de côté, qui portent toutes la même grandeur (`part_artif`,
en %) ; chaque zoom ne reçoit qu'une résolution, voir `ZOOMS_BY_RESOLUTION_M`.

Ce que le DAG écrit :
- dans l'entrepôt, les tables des deux modèles de `DBT_MODELS` (`dbt build`, tests de données
  compris). Le premier découpe les objets OCS GE du dernier millésime de tout le pays : c'est
  l'étape longue, 1 h 45 mesurée sur dix processus ;
- sur S3, `vector_tiles/sols_artificialises_national.geojson` (export intermédiaire, plusieurs
  Go) puis `vector_tiles/sols_artificialises_national.pmtiles`, rendu lisible publiquement.

Prérequis : les modèles `occupation_du_sol_commune`, `millesimes`, `commune` et
`national_map_drom_placement` sont construits. Seuls les deux modèles ci-dessus le sont ici,
pas leurs parents.

À relancer après chaque livraison d'un millésime OCS GE : la carte montrerait sinon
l'ancien millésime du département, sans le dire.

Le DAG n'a pas de planification : il ne tourne que lorsqu'on le déclenche.
"""

from include.container import DomainContainer
from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.utils import multiline_string_to_single_line
from include.vector_tiles import get_resolution_by_zoom_filter, get_zoom_bounds
from pendulum import datetime

from airflow.sdk import dag, task

TILESET_NAME = "sols_artificialises_national"
GEOJSON_KEY = f"vector_tiles/{TILESET_NAME}.geojson"
PMTILES_KEY = f"vector_tiles/{TILESET_NAME}.pmtiles"

# Nom de la couche dans les tuiles : la carte le déclare comme `source-layer`
LAYER_NAME = TILESET_NAME

# Sans « + » : seuls ces deux modèles sont construits, pas leurs parents. dbt construit
# d'abord les mailles fines, que le modèle des tuiles regroupe.
DBT_MODELS = ["artif_carroyage_commune", f"for_vector_tiles_{TILESET_NAME}"]

RESOLUTION_ATTRIBUTE = "resolution_m"

# Colonne du modèle écartée des tuiles : l'identifiant ne sert pas à la carte, et une chaîne
# unique par entité se compresse mal. C'est tippecanoe qui l'écarte (`--exclude`) et non la
# requête d'export : celle-ci devrait nommer les colonnes en majuscules entre guillemets, que
# le gestionnaire d'export perd en passant la requête à un shell.
EXCLUDED_ATTRIBUTE = "id"

# Colonnes du modèle écrites dans les tuiles : toutes, sauf l'identifiant
TILE_ATTRIBUTES = [
    RESOLUTION_ATTRIBUTE,
    "part_artif",
    "annee_min",
    "annee_max",
    "placement",
    "REGION",
    "DEPART",
    "EPCI",
]

# Plage de zooms de tuiles (premier, dernier) servie par chaque résolution du modèle dbt
# (côté de la maille en mètres). Les résolutions doivent être celles de la macro dbt
# `carroyage_artif_resolutions_m` : un test pytest compare les deux listes.
#
# MapLibre affiche les tuiles du zoom z entre les zooms de carte z et z + 1, où un pixel
# couvre, à la latitude de la France (46,5° N), de 53 880 / 2^z mètres à la moitié.
#
# Contrairement au carroyage de la consommation, toutes les mailles du territoire existent,
# y compris celles qui ne sont pas artificialisées : un écran de 1440 × 900 px charge jusqu'à
# douze tuiles, et chaque maille pèse 6 à 9 octets compressés (mesuré sur l'Ille-et-Vilaine).
# À partir du zoom 7, une maille fait donc au moins 4,8 px, soit 11 400 mailles par tuile et
# 1,3 Mo au plus par vue ; des mailles deux fois plus fines pèseraient quatre fois plus.
#
#   zoom   résolution   côté à l'écran    mailles chargées par une vue de 1440 × 900 px
#   3 à 5  5 km         0,7 à 6 px        tout le pays : 26 000, soit 0,2 Mo
#   6      2 km         2,4 à 4,8 px      presque tout le pays : 145 000, soit 1,0 Mo
#   7      2 km         4,8 à 9,5 px      82 000 au plus, soit 0,6 Mo
#   8      1 km         4,8 à 9,5 px      137 000 au plus, soit 1,3 Mo
#   9      500 m        4,8 à 9,5 px      137 000 au plus, soit 1,1 Mo
#   10     250 m        4,8 à 9,5 px      137 000 au plus, soit 1,1 Mo
#
# Le zoom 10 est le dernier : au-delà, la carte agrandit ses tuiles (une maille de 250 m fait
# 10 à 19 px au zoom 11).
ZOOMS_BY_RESOLUTION_M: dict[int, tuple[int, int]] = {
    5000: (3, 5),
    2000: (6, 7),
    1000: (8, 8),
    500: (9, 9),
    250: (10, 10),
}

FIRST_ZOOM, LAST_ZOOM = get_zoom_bounds(ZOOMS_BY_RESOLUTION_M)

TIPPECANOE_OPTIONS = [
    "--read-parallel",
    "--force",
    f"--layer={LAYER_NAME}",
    # Des carrés jointifs, de quelques pixels au plus : on ne veut ni les simplifier ni les
    # supprimer, et aucune tuile ne doit écarter des mailles parce qu'elle en contient trop
    "--no-simplification-of-shared-nodes",
    "--no-tiny-polygon-reduction",
    "--no-line-simplification",
    "--no-feature-limit",
    "--no-tile-size-limit",
    f"-Z{FIRST_ZOOM}",
    f"-z{LAST_ZOOM}",
    f"--feature-filter={get_resolution_by_zoom_filter(RESOLUTION_ATTRIBUTE, ZOOMS_BY_RESOLUTION_M)}",
    f"--exclude={EXCLUDED_ATTRIBUTE}",
]


def get_export_sql() -> str:
    """
    Requête de l'export : toutes les colonnes du modèle.

    Sans guillemets : le gestionnaire d'export place la requête entre guillemets doubles dans
    une commande shell, où ceux de la requête disparaîtraient.
    """
    return f"SELECT * FROM public_for_vector_tiles.for_vector_tiles_{TILESET_NAME}"


@dag(
    start_date=datetime(2026, 11, 13),
    # Pas de `@once` : sortir le DAG de pause créerait une exécution planifiée, en plus de
    # celle qu'on déclenche à la main
    schedule=None,
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE", "Artificialisation", "Carte nationale"],
)
def create_sols_artificialises_national_vector_tiles():
    bucket_name = Container().bucket_name()

    dbt_build = DbtBuild(select=DBT_MODELS, retries=0)

    @task.python
    def postgis_to_geojson():
        """Exporte les mailles, toutes résolutions empilées, vers GeoJSONSeq."""
        return (
            DomainContainer()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(get_export_sql()),
                s3_key=GEOJSON_KEY,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def geojson_to_pmtiles() -> str:
        """Convertit le GeoJSON en PMTiles avec tippecanoe et l'upload sur S3."""
        path_on_s3 = (
            DomainContainer()
            .geojson_on_s3_to_pmtiles_on_s3_handler()
            .convert_geojson_to_pmtiles_on_s3(
                s3_bucket=bucket_name,
                s3_geojson_key=GEOJSON_KEY,
                s3_pmtiles_key=PMTILES_KEY,
                tippecanoe_options=TIPPECANOE_OPTIONS,
            )
        )
        if path_on_s3 is None:
            raise ValueError(
                "Le modèle des sols artificialisés ne contient pas assez de données pour générer des tuiles"
            )
        return path_on_s3

    @task.python
    def make_pmtiles_public():
        """Rend le fichier PMTiles accessible publiquement."""
        DomainContainer().s3_handler().set_key_publicly_visible(PMTILES_KEY, bucket_name)

    dbt_build >> postgis_to_geojson() >> geojson_to_pmtiles() >> make_pmtiles_public()


create_sols_artificialises_national_vector_tiles()
