import pendulum
from include.domain.container import Container

from airflow.decorators import dag, task


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
    max_active_tasks=10,
)
def create_national_data_geopackage():
    filename = "france_impermeabilisation_communes.gpkg"
    s3_key = f"exports/geopackage/{filename}"
    s3_bucket = "airflow-staging"

    @task.python()
    def create_geopackage():
        return (
            Container()
            .sql_to_geopackage_on_s3_handler()
            .export_sql_result_to_geopackage_on_s3(
                s3_key=s3_key,
                s3_bucket=s3_bucket,
                sql_to_layer_name_mapping={
                    "impermeabilisation": "SELECT * FROM public_for_export.commune_imper_by_year",
                },
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
                data_gouv_filename=filename,
                data_gouv_dataset_id="67bddc715e3badfc49d5df9b",
                data_gouv_resource_id="b0bbf493-a078-46eb-b901-7d0754bf6e77",
            )
        )

    create_geopackage() >> upload_to_data_gouv()


create_national_data_geopackage()
