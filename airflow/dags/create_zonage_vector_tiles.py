import pendulum
from airflow.decorators import dag, task
from include.domain.container import Container


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
    max_active_tasks=10,
)
def create_zonage_vector_tiles():
    bucket_name = "airflow-staging"
    vector_tiles_dir = "vector_tiles"
    geojson_file = "zonage.geojsons"
    pmtiles_file = "zonage.pmtiles"

    @task.python(trigger_rule="none_skipped")
    def postgis_to_geojson():
        return (
            Container()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql="SELECT * FROM public_gpu.zonage_urbanisme",
                s3_key=f"{vector_tiles_dir}/{geojson_file}",
                s3_bucket=bucket_name,
            )
        )

    @task.bash(skip_on_exit_code=110, trigger_rule="none_skipped")
    def geojson_to_pmtiles():
        local_input = f"/tmp/{geojson_file}"
        local_output = f"/tmp/{pmtiles_file}"
        Container().s3().get_file(f"{bucket_name}/{vector_tiles_dir}/{geojson_file}", local_input)

        cmd = [
            "tippecanoe",
            "-o",
            local_output,
            local_input,
            "--read-parallel",
            "--force",
            "--coalesce-densest-as-needed",
        ]

        return " ".join(cmd)

    @task.python(trigger_rule="none_skipped")
    def upload():
        local_path = f"/tmp/{pmtiles_file}"
        path_on_s3 = f"{bucket_name}/{vector_tiles_dir}/{pmtiles_file}"
        Container().s3().put(local_path, path_on_s3)

    @task.bash(trigger_rule="none_skipped")
    def delete_local_files():
        return f"rm /tmp/{geojson_file} && rm /tmp/{pmtiles_file}"

    (postgis_to_geojson() >> geojson_to_pmtiles() >> upload() >> delete_local_files())


create_zonage_vector_tiles()
