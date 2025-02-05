from logging import getLogger

from airflow.decorators import dag, task
from include.domain.container import Container
from pendulum import datetime

logger = getLogger(__name__)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["INSEE"],
)
def update_vector_tiles():
    from_bucket_name = "airflow-staging"
    to_bucket_name = "sparte"

    @task.python
    def get_list_of_vector_tiles() -> list[str]:
        keys: list[str] = Container().s3_handler().list_files(s3_bucket=from_bucket_name, s3_key="vector_tiles")

        return [
            key.replace(from_bucket_name + "/", "")
            for key in keys
            if key.endswith(".pmtiles") and "occupation_du_sol" in key
        ]

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

    keys = get_list_of_vector_tiles()
    move_vector_tiles_from_airflow_bucket_to_prod(keys)


update_vector_tiles()
