import pendulum
from dags.data_gouv.Config import CSVConfig
from dags.data_gouv.utils import get_configs
from include.domain.container import Container

from airflow.decorators import dag, task

configs: list[CSVConfig] = get_configs("csv")

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
    def create_and_publish_csv_to_data_gouv():
        s3_key = f"exports/csv/{config.filename}"
        s3_bucket = "airflow-staging"

        @task.python()
        def create_csv():
            return (
                Container()
                .sql_to_csv_on_s3_handler()
                .export_sql_result_to_csv_on_s3(
                    s3_key=s3_key,
                    s3_bucket=s3_bucket,
                    sql=config.sql,
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

        create_csv() >> upload_to_data_gouv()

    create_and_publish_csv_to_data_gouv()
