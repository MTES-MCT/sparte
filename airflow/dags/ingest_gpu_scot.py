"""
Ce DAG télécharge le geopackage des périmètres SCoT exporté depuis le GPU
(Géoportail de l'urbanisme) et l'ingère dans PostgreSQL via ogr2ogr.

Le fichier est un geopackage **non archivé** (contrairement à Admin Express, livré en
7z) : une seule couche `scot` (451 périmètres, EPSG:4326, géométrie `the_geom`). Il
fournit une géométrie de périmètre SCoT fiable et indépendante d'une liste de communes,
servant de référence au rattachement géographique commune -> SCoT.

⚠️ L'URL est un lien d'extraction GPU ponctuel : il peut expirer. Le mettre à jour ici
(ou le passer en paramètre) si le téléchargement échoue.
"""

from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param

GPU_SCOT_URL = (
    "https://data.geopf.fr/extraction/telechargement/download/"
    "extraction_1b5ca65b-d523-448d-aca9-35b3f22e19e0/data/export/"
    "schema_41f21be1_33d3_48e8_9b34_de6f32958885.scot.gpkg"
)
FILENAME = "gpu_scot.gpkg"
LAYER_NAME = "scot"
TABLE_NAME = "gpu_scot"
SRID = 4326


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU", "SCOT"],
    params={
        "url": Param(
            default=GPU_SCOT_URL,
            type="string",
            description="URL du geopackage SCoT à télécharger depuis le GPU",
        ),
        "if_not_exists": Param(
            default=True,
            type="boolean",
            description="Skip download if file already exists on S3",
        ),
    },
)
def ingest_gpu_scot():
    bucket_name = InfraContainer().bucket_name()

    @task.python
    def download(**context) -> str:
        """Télécharge le geopackage depuis le GPU et le dépose sur le bucket S3."""
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=context["params"]["url"],
                s3_key=FILENAME,
                s3_bucket=bucket_name,
                if_not_exists=context["params"].get("if_not_exists", True),
            )
        )

    @task.python
    def ingest(path_on_bucket: str) -> None:
        """Ingère la couche `scot` du geopackage dans PostgreSQL."""
        s3_key = path_on_bucket.split("/")[-1]

        Container().s3_geopackage_file_to_db_table_handler().ingest_s3_geopackage_file_to_db_table(
            s3_bucket=bucket_name,
            s3_key=s3_key,
            table_name=TABLE_NAME,
            layer_name=LAYER_NAME,
            srid=SRID,
        )

    ingest(download())


ingest_gpu_scot()
