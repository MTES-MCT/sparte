"""
DAG qui produit les tuiles vectorielles des communes de toute la France pour la carte
nationale (`/carte`, France entière et Hexagone à la maille commune).

Près de 35 000 communes ne peuvent pas être servies en GeoJSON comme les autres mailles :
la carte les lit dans un seul fichier, `communes_national.pmtiles` (couche
`communes_national`, zooms 3 à 10), et y joint ses valeurs par le code INSEE (`land_id`).
Le modèle dbt `for_vector_tiles_communes_national` fournit une ligne par commune ; les
communes d'outre-mer y sont déjà déplacées près de l'Hexagone, selon le placement du modèle
`national_map_drom_placement`.

Ce que le DAG écrit :
- dans l'entrepôt, les tables de ces deux modèles (`dbt build`, tests de données compris) ;
- sur S3, `vector_tiles/communes_national.geojson` (export intermédiaire) puis
  `vector_tiles/communes_national.pmtiles`, rendu lisible publiquement.

Prérequis : les modèles `land` et `land_national_map_geom` sont construits. Seuls les deux
modèles ci-dessus le sont ici, pas leurs parents.

À relancer après chaque rafraîchissement de `land` (nouveau millésime d'Admin Express,
changement du code officiel géographique) : la carte joint ses valeurs aux tuiles par le
code INSEE, une commune créée ou supprimée depuis la dernière génération resterait grise
ou absente.

Le DAG n'a pas de planification : il ne tourne que lorsqu'on le déclenche.
"""

from include.container import DomainContainer
from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.utils import multiline_string_to_single_line
from pendulum import datetime

from airflow.sdk import dag, task

GEOJSON_FILENAME = "communes_national.geojson"
PMTILES_FILENAME = "communes_national.pmtiles"
VECTOR_TILES_DIR = "vector_tiles"

# Nom de la couche dans les tuiles : la carte le déclare comme `source-layer`
LAYER_NAME = "communes_national"

# Sans « + » : seuls ces deux modèles sont construits, pas leurs parents. dbt construit
# d'abord le placement, que les communes lisent.
DBT_MODELS = ["national_map_drom_placement", "for_vector_tiles_communes_national"]

# Zoom 3 : celui que charge un téléphone pour afficher le pays entier. Zoom 10 : une commune
# médiane y fait déjà plus de 60 pixels de côté, la carte agrandit ces tuiles au-delà.
FIRST_ZOOM = 3
LAST_ZOOM = 10

# Chaque commune doit rester une entité à part entière à tous les zooms, puisque la carte
# colore chacune par son identifiant : aucune option qui regroupe ou supprime des entités.
# En particulier pas celles par défaut du gestionnaire (`--coalesce-densest-as-needed`,
# `-zg`), faites pour des couches où l'on peut fusionner des voisins.
#
# Mesures sur 1 266 communes (Puy-de-Dôme, Somme, Guadeloupe), tippecanoe 2.75.1 :
#
#   options                                     communes absentes         octets compressés
#                                               zoom 3      zoom 4        par commune, zoom 3
#   celles-ci                                   1           0             24,1
#   sans --low-detail=11 (détail 12)            0           0             28,1
#   --low-detail=10                             12          1             20,6
#   sans --no-tiny-polygon-reduction            319         9             23,6
#
# La commune absente au zoom 3 fait moins d'un km² : à ce zoom elle est plus petite qu'une
# maille de la grille de la tuile, soit un demi-pixel à l'écran au plus. Toutes sont là dès
# le zoom 4.
TIPPECANOE_OPTIONS = [
    "--read-parallel",
    "--force",
    f"--layer={LAYER_NAME}",
    f"-Z{FIRST_ZOOM}",
    f"-z{LAST_ZOOM}",
    # Grille de 2 048 unités par tuile sous le dernier zoom, au lieu de 4 096 : une vue du pays
    # charge toutes les communes d'un coup, et le détail perdu y est sous le pixel
    "--low-detail=11",
    # Ni entité écartée ni tuile refusée : une tuile de petit zoom contient des dizaines de
    # milliers de communes, et les plus lourdes (0,7 à 0,8 Mo estimés) dépassent la limite
    # par défaut de 500 Ko
    "--no-feature-limit",
    "--no-tile-size-limit",
    # Une frontière commune à deux communes est simplifiée de la même façon des deux côtés :
    # simplifiée séparément dans chacune, elle ne coïnciderait plus de l'une à l'autre
    "--no-simplification-of-shared-nodes",
    # Les petites communes sont gardées telles quelles, au lieu d'être remplacées par
    # quelques carrés qui en représentent plusieurs
    "--no-tiny-polygon-reduction",
]


@dag(
    start_date=datetime(2026, 11, 12),
    # Pas de `@once` comme les autres DAG de tuiles : sortir le DAG de pause créerait une
    # exécution planifiée, en plus de celle qu'on déclenche à la main
    schedule=None,
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Admin Express", "Carte nationale"],
)
def create_communes_national_vector_tiles():
    bucket_name = Container().bucket_name()

    dbt_build = DbtBuild(select=DBT_MODELS, retries=0)

    @task.python
    def postgis_to_geojson():
        """Exporte les communes, DROM déjà déplacés, vers GeoJSONSeq."""
        sql = """
            SELECT
                *
            FROM
                public_for_vector_tiles.for_vector_tiles_communes_national
        """
        return (
            DomainContainer()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),
                s3_key=f"{VECTOR_TILES_DIR}/{GEOJSON_FILENAME}",
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
                s3_geojson_key=f"{VECTOR_TILES_DIR}/{GEOJSON_FILENAME}",
                s3_pmtiles_key=f"{VECTOR_TILES_DIR}/{PMTILES_FILENAME}",
                tippecanoe_options=TIPPECANOE_OPTIONS,
            )
        )
        if path_on_s3 is None:
            raise ValueError("Le modèle des communes ne contient pas assez de données pour générer des tuiles")
        return path_on_s3

    @task.python
    def make_pmtiles_public():
        """Rend le fichier PMTiles accessible publiquement."""
        DomainContainer().s3_handler().set_key_publicly_visible(f"{VECTOR_TILES_DIR}/{PMTILES_FILENAME}", bucket_name)

    dbt_build >> postgis_to_geojson() >> geojson_to_pmtiles() >> make_pmtiles_public()


create_communes_national_vector_tiles()
