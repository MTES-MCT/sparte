import pendulum
from include.domain.container import Container
from include.utils import multiline_string_to_single_line

from airflow.decorators import dag, task


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["CEREMA"],
    max_active_tasks=10,
)
def create_cartofriches_vector_tiles():
    bucket_name = "airflow-staging"
    vector_tiles_dir = "vector_tiles"
    json_filename = "cartofriches.geojson"
    pmtiles_filename = "cartofriches.pmtiles"

    @task.python(trigger_rule="none_skipped")
    def postgis_to_geojson():
        sql = "SELECT * FROM public_for_vector_tiles.for_vector_tiles_friche"

        return (
            Container()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),  # noqa: E501
                s3_key=f"{vector_tiles_dir}/{json_filename}",
                s3_bucket=bucket_name,
            )
        )

    @task.bash(skip_on_exit_code=110, trigger_rule="none_skipped")
    def geojson_to_pmtiles():
        local_input = f"/tmp/{json_filename}"
        local_output = f"/tmp/{pmtiles_filename}"
        Container().s3().get_file(f"{bucket_name}/{vector_tiles_dir}/{json_filename}", local_input)

        cmd = [
            "tippecanoe",
            "-o",
            local_output,
            local_input,
            "--read-parallel",
            "--force",
            "--no-simplification-of-shared-nodes",
            "--no-tiny-polygon-reduction",
            "--coalesce-densest-as-needed",
            "--no-tile-size-limit",
            "-zg",
        ]

        return " ".join(cmd)

    @task.python(trigger_rule="none_skipped")
    def upload():
        local_path = f"/tmp/{pmtiles_filename}"
        path_on_s3 = f"{bucket_name}/{vector_tiles_dir}/{pmtiles_filename}"
        Container().s3().put(local_path, path_on_s3)

    @task.bash(trigger_rule="none_skipped")
    def delete_geojson_file():
        return f"rm /tmp/{json_filename}"

    @task.bash(trigger_rule="none_skipped")
    def delete_pmtiles_file():
        return f"rm /tmp/{pmtiles_filename}"

    (postgis_to_geojson() >> geojson_to_pmtiles() >> upload() >> delete_geojson_file() >> delete_pmtiles_file())


create_cartofriches_vector_tiles()
