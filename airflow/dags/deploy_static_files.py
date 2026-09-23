from logging import getLogger

from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

logger = getLogger(__name__)

# Fichiers trop volumineux pour la copie côté serveur, à traiter manuellement.
EXCLUDED_FROM_COPY = "carroyage_lea"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Production"],
)
def deploy_static_files():
    from_bucket_name = InfraContainer().bucket_name()
    to_bucket_name = InfraContainer().app_bucket_name()

    @task.python
    def get_list_of_vector_tiles() -> list[str]:
        keys: list[str] = Container().s3_handler().list_files(s3_bucket=from_bucket_name, s3_key="vector_tiles")
        pmtiles = [key.replace(from_bucket_name + "/", "") for key in keys if key.endswith(".pmtiles")]

        # Le carroyage LEA pèse plus de 2 Go, et la copie côté serveur dépasse le
        # read timeout de botocore. L'échec faisait avorter la tâche entière, donc
        # toutes les tuiles suivantes dans l'ordre lexicographique — les zonages
        # d'urbanisme, notamment — n'étaient jamais copiées.
        skipped = [key for key in pmtiles if EXCLUDED_FROM_COPY in key]
        if skipped:
            logger.warning(
                "%s exclu(s) de la copie automatique : %s. "
                "À copier à la main, l'AWS CLI faisant du multipart :\n"
                "  aws --endpoint-url https://s3.fr-par.scw.cloud --region fr-par \\\n"
                "    s3 cp s3://%s/%s s3://%s/%s --acl public-read",
                len(skipped),
                ", ".join(skipped),
                from_bucket_name,
                skipped[0],
                to_bucket_name,
                skipped[0],
            )

        return [key for key in pmtiles if EXCLUDED_FROM_COPY not in key]

    @task.python
    def get_list_of_geojson_files() -> list[str]:
        keys: list[str] = Container().s3_handler().list_files(s3_bucket=from_bucket_name, s3_key="geojson")
        return [key.replace(from_bucket_name + "/", "") for key in keys if key.endswith(".geojson.gz")]

    @task.python
    def move_vector_tiles_from_airflow_bucket_to_prod(keys) -> str:
        s3 = Container().s3_handler()
        amount_of_vector_tiles = len(keys)
        logger.info(f"Moving {amount_of_vector_tiles} vector tiles from {from_bucket_name} to {to_bucket_name}")

        for idx, key in enumerate(keys):
            logger.info(f"Moving {idx + 1}/{amount_of_vector_tiles} vector tiles")
            s3.move_from_bucket_a_to_bucket_b(s3_key=key, bucket_a=from_bucket_name, bucket_b=to_bucket_name)
            s3.set_key_publicly_visible(s3_key=key, s3_bucket=to_bucket_name)
            logger.info(f"Moved {idx + 1}/{amount_of_vector_tiles} vector tiles")

        logger.info(f"Moved {amount_of_vector_tiles} vector tiles from {from_bucket_name} to {to_bucket_name}")

    @task.python
    def move_geojson_files_from_airflow_bucket_to_prod(keys) -> str:
        s3 = Container().s3_handler()
        amount_of_files = len(keys)
        logger.info(f"Moving {amount_of_files} GeoJSON files from {from_bucket_name} to {to_bucket_name}")

        for idx, key in enumerate(keys):
            logger.info(f"Moving {idx + 1}/{amount_of_files} GeoJSON files")
            s3.move_from_bucket_a_to_bucket_b(s3_key=key, bucket_a=from_bucket_name, bucket_b=to_bucket_name)
            s3.set_key_publicly_visible(s3_key=key, s3_bucket=to_bucket_name)
            logger.info(f"Moved {idx + 1}/{amount_of_files} GeoJSON files")

        logger.info(f"Moved {amount_of_files} GeoJSON files from {from_bucket_name} to {to_bucket_name}")

    pmtiles_keys = get_list_of_vector_tiles()
    geojson_keys = get_list_of_geojson_files()

    move_vector_tiles_from_airflow_bucket_to_prod(pmtiles_keys)
    move_geojson_files_from_airflow_bucket_to_prod(geojson_keys)


deploy_static_files()
