"""
Ce dag télécharge les données IGN Admin Express (format geopackage) et les importe
dans une base de données PostgreSQL via ogr2ogr.

Chaque zone est livrée dans une archive 7z contenant un unique fichier .gpkg
multi-couches. Les couches `commune`, `departement`, `epci` et `region` sont ingérées
chacune dans sa propre table. La construction des modèles dbt est gérée séparément.
"""

from include.container import DomainContainer, InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

# Couches du geopackage Admin Express à ingérer (une table par couche).
LAYERS = ("commune", "departement", "epci", "region")

GEOPF_DOWNLOAD_URL = "https://data.geopf.fr/telechargement/download"
ADMIN_EXPRESS_EDITION = "2025-01-01"


def admin_express_gpkg_url(product: str, projection: str, zone: str, edition: str = ADMIN_EXPRESS_EDITION) -> str:
    """Construit l'URL de l'archive 7z geopackage Admin Express sur la Géoplateforme."""
    archive = f"{product}_4-0__GPKG_{projection}_{zone}_{edition}"
    return f"{GEOPF_DOWNLOAD_URL}/{product}/{archive}/{archive}.7z"


sources = [
    {
        "name": "France Métropolitaine",
        "table_suffix": "metropole",
        "srid": 2154,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="LAMB93", zone="FXX"),
    },
    {
        "name": "Guadeloupe",
        "table_suffix": "guadeloupe",
        "srid": 32620,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="RGAF09UTM20", zone="GLP"),
    },
    {
        "name": "Martinique",
        "table_suffix": "martinique",
        "srid": 32620,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="RGAF09UTM20", zone="MTQ"),
    },
    {
        "name": "Guyane",
        "table_suffix": "guyane",
        "srid": 2972,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="UTM22RGFG95", zone="GUF"),
    },
    {
        "name": "La Réunion",
        "table_suffix": "reunion",
        "srid": 2975,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="RGR92UTM40S", zone="REU"),
    },
    {
        "name": "Mayotte",
        "table_suffix": "mayotte",
        "srid": 4471,
        "url": admin_express_gpkg_url(product="ADMIN-EXPRESS-COG", projection="RGM04UTM38S", zone="MYT"),
    },
]

zones = [source["name"] for source in sources]


def get_source_by_name(name: str) -> dict:
    return next(source for source in sources if source["name"] == name)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Admin Express"],
    params={
        "zone": Param(
            default=zones[0],
            description="Zone à ingérer",
            type="string",
            enum=zones,
        ),
        "if_not_exists": Param(
            default=True,
            type="boolean",
            description="Skip download if file already exists on S3",
        ),
    },
)
def ingest_admin_express():
    bucket_name = InfraContainer().bucket_name()

    @task.python
    def download_admin_express(**context) -> str:
        """Télécharge l'archive depuis l'IGN et la dépose sur le bucket S3."""
        url = get_source_by_name(context["params"]["zone"])["url"]
        filename = url.split("/")[-1]

        return (
            DomainContainer()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=url,
                s3_key=filename,
                s3_bucket=bucket_name,
                if_not_exists=context["params"].get("if_not_exists", True),
            )
        )

    @task.python
    def ingest(path_on_bucket: str, **context) -> None:
        """Extrait le geopackage du bucket et ingère chaque couche dans PostgreSQL."""
        source = get_source_by_name(context["params"]["zone"])
        s3_key = path_on_bucket.split("/")[-1]
        layer_to_table = {layer: f"{layer}_{source['table_suffix']}" for layer in LAYERS}

        DomainContainer().s3_geopackage_archive_to_db_tables_handler().ingest_s3_geopackage_archive_to_db_tables(
            s3_bucket=bucket_name,
            s3_key=s3_key,
            layer_to_table=layer_to_table,
            srid=source["srid"],
        )

    ingest(download_admin_express())


# Instantiate the DAG
ingest_admin_express()
