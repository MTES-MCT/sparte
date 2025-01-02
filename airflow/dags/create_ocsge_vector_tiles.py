import os

import pendulum
from airflow.decorators import dag, task
from include.container import Container


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

    geojsons_file = "/tmp/output.geojsons"
    pmtiles_file = "/tmp/output.pmtiles"
    pmtiles_key_on_s3 = f"/{bucket_name}/vector_tiles/75.pmtiles"

    @task.bash()
    def transform_postgis_ocsge_to_geojson_seq():
        sql = "SELECT * FROM public_ocsge.occupation_du_sol"
        cmd = [
            "ogr2ogr",
            "-f",
            '"GeoJSONSeq"',
            geojsons_file,
            f'"{Container().gdal_dbt_conn().encode()}"',
            "'public_ocsge.occupation_du_sol'",
            f'-sql "{sql}"',
            "-lco RS=YES",
            # start records with the RS=0x1E character, so as to be compatible with the RFC 8142 standard
            # this allow tippecanoe to work concurrently with the GeoJSONSeq file
            "-lco ID_FIELD=uuid",
        ]

        return " ".join(cmd)

    @task.bash()
    def cat_content_of_geojson_seq():
        return f"tail {geojsons_file}"

    @task.bash()
    def transform_geojson_seq_to_vector_tiles():
        cmd = [
            "tippecanoe",
            "-o",
            pmtiles_file,
            geojsons_file,
            "--read-parallel",
            "--force",
            "--no-line-simplification",
            "--no-tiny-polygon-reduction",
            "--no-tile-size-limit",
            "--detect-shared-borders",
            "--no-simplification-of-shared-nodes",
            "--base-zoom=10",
            "-zg",
        ]
        return " ".join(cmd)

    @task.python()
    def upload_vector_tiles_to_s3():
        Container().s3().put_file(pmtiles_file, pmtiles_key_on_s3)
        Container().s3().put_file(geojsons_file, f"/{bucket_name}/vector_tiles/75.geojsons")

    @task.python()
    def remove_files():
        os.remove(pmtiles_file)
        os.remove(geojsons_file)

    (
        transform_postgis_ocsge_to_geojson_seq()
        >> cat_content_of_geojson_seq()
        >> transform_geojson_seq_to_vector_tiles()
        >> upload_vector_tiles_to_s3()
        >> remove_files()
    )


create_ocsge_vector_tiles()
