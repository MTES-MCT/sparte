import pendulum
from dags.data_gouv.Config import GeopackageConfig
from dags.data_gouv.utils import get_configs
from include.domain.container import Container

from airflow.decorators import dag, task

configs: list[GeopackageConfig] = get_configs("gpkg")


for config in configs:

    @dag(
        dag_id=config.dag_id,
        start_date=pendulum.datetime(2024, 1, 1),
        schedule="@once",
        catchup=False,
        doc_md=__doc__,
        max_active_runs=1,
        default_args={"owner": "Alexis Athlani", "retries": 3},
        max_active_tasks=10,
    )
    def create_and_publish_geopackage_to_data_gouv():
        s3_key = f"exports/geopackage/{config.filename}"
        s3_bucket = "airflow-staging"

        @task.python()
        def create_geopackage():
            return (
                Container()
                .sql_to_geopackage_on_s3_handler()
                .export_sql_result_to_geopackage_on_s3(
                    s3_key=s3_key,
                    s3_bucket=s3_bucket,
                    sql_to_layer_name_mapping=config.sql_to_layer_name_mapping,
                )
            )

        @task.python()
        def upload_to_data_gouv():
            return (
                Container()
                .s3_to_data_gouv()
                .store_file_to_data_gouv(
                    s3_key=s3_key,
                    s3_bucket=s3_bucket,
                    data_gouv_filename=config.filename,
                    data_gouv_dataset_id=config.data_gouv_dataset,
                    data_gouv_resource_id=config.data_gouv_resource,
                )
            )

        create_geopackage() >> upload_to_data_gouv()

    create_and_publish_geopackage_to_data_gouv()
