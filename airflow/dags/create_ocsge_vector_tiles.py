import json

import pendulum
from airflow.decorators import dag, task
from include.domain.container import Container


def get_config():
    with open("include/domain/data/ocsge/sources.json", "r") as f:
        sources = json.load(f)

    config = []

    years = set()

    for departement in sources:
        occupation_du_sol_et_zone_construite = sources[departement]["occupation_du_sol_et_zone_construite"]
        for year in occupation_du_sol_et_zone_construite:
            years.add(year)

    for year in years:
        config.append(
            {
                "year": year,
                "geojson_filename": f"occupation_du_sol_{year}.geojson",
                "pmtiles_filename": f"occupation_du_sol_{year}.pmtiles",
            }
        )

    return config


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
def create_ocsge_vector_tiles():
    bucket_name = "airflow-staging"
    vector_tiles_dir = "vector_tiles"

    @task.python()
    def postgis_to_geojson(entry):
        year = entry["year"]
        filename = entry["geojson_filename"]

        return (
            Container()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=f"SELECT * FROM public_ocsge.occupation_du_sol WHERE year = {year}",
                s3_key=f"{vector_tiles_dir}/{filename}",
                s3_bucket=bucket_name,
            )
        )

    @task.bash(skip_on_exit_code=110)
    def geojson_to_pmtiles(entry):
        local_input = f"/tmp/{entry['geojson_filename']}"
        local_output = f"/tmp/{entry['pmtiles_filename']}"
        Container().s3().get_file(f"{bucket_name}/{vector_tiles_dir}/{entry['geojson_filename']}", local_input)

        cmd = [
            "tippecanoe",
            "-o",
            local_output,
            local_input,
            "--read-parallel",
            "--force",
            "--no-simplification-of-shared-nodes",
            "--no-tile-size-limit",
            "--base-zoom=10",
            "--drop-densest-as-needed",
            "-zg",
        ]

        print(cmd)

        return " ".join(cmd)

    @task.python(trigger_rule="all_done")
    def upload(entry):
        local_path = f"/tmp/{entry['pmtiles_filename']}"
        path_on_s3 = f"{bucket_name}/{vector_tiles_dir}/{entry['pmtiles_filename']}"
        Container().s3().put(local_path, path_on_s3)

    config = get_config()
    (postgis_to_geojson.expand(entry=config) >> geojson_to_pmtiles.expand(entry=config) >> upload.expand(entry=config))


create_ocsge_vector_tiles()
