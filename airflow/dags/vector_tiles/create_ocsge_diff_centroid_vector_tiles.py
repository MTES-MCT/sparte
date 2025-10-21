import json

import pendulum
from include.container import DomainContainer as Container
from include.container import InfraContainer
from include.utils import multiline_string_to_single_line

from airflow.decorators import dag, task
from airflow.exceptions import AirflowSkipException
from airflow.models.param import Param

with open("include/data/ocsge/sources.json", "r") as f:
    sources = json.load(f)


def get_geojson_filename(indexes: list[int], departement: str) -> str:
    return f"occupation_du_sol_diff_centroid_{'_'.join(map(str, indexes))}_{departement}.geojson"


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
    max_active_tasks=10,
    params={
        "departement": Param("75", type="string", enum=list(sources.keys())),
        "refresh_existing": Param(False, type="boolean"),
        "indexes": Param([1, 2], type="array", items={"type": "integer", "enum": [1, 2]}),
    },
)
def create_ocsge_diff_centroid_vector_tiles():
    bucket_name = InfraContainer().bucket_name()
    vector_tiles_dir = "geojson"

    @task.python()
    def check_if_geojson_not_exist(params: dict):
        if params.get("refresh_existing"):
            return
        indexes = params.get("indexes")
        departement = params.get("departement")
        filename = get_geojson_filename(indexes, departement)
        exists = InfraContainer().s3().exists(f"{bucket_name}/{vector_tiles_dir}/{filename}")
        if exists:
            raise AirflowSkipException("GeoJSON already exists")

    @task.python(trigger_rule="none_skipped")
    def postgis_to_geojson(params: dict):
        indexes = params.get("indexes")
        year_old_index = indexes[0]
        year_new_index = indexes[1]
        departement = params.get("departement")
        filename = get_geojson_filename(indexes, departement)

        sql = f"""
            SELECT
                *
            FROM
                public_for_vector_tiles.for_vector_tiles_difference_ocsge_centroid
            WHERE
                year_old_index = {year_old_index} AND
                year_new_index = {year_new_index} AND
                departement = '{departement}'
        """

        return (
            Container()
            .sql_to_geojson_on_s3_handler()
            .export_sql_result_to_geojson_on_s3(
                sql=multiline_string_to_single_line(sql),  # noqa: E501
                s3_key=f"{vector_tiles_dir}/{filename}",
                s3_bucket=bucket_name,
            )
        )

    @task.python(trigger_rule="none_skipped")
    def compress_geojson(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(indexes, departement)
        s3_key = f"{vector_tiles_dir}/{geojson_filename}"

        return (
            Container()
            .geojson_to_gzipped_geojson_on_s3_handler()
            .compress_geojson_and_upload_to_s3(
                s3_source_key=s3_key,
                s3_bucket=bucket_name,
            )
        )

    @task.python(trigger_rule="none_skipped")
    def make_files_public(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(indexes, departement)
        geojson_key = f"{vector_tiles_dir}/{geojson_filename}"
        gzipped_key = f"{geojson_key}.gz"

        s3_handler = Container().s3_handler()

        # Make GeoJSON file public
        s3_handler.set_key_publicly_visible(geojson_key, bucket_name)

        # Make gzipped GeoJSON file public
        s3_handler.set_key_publicly_visible(gzipped_key, bucket_name)

    (check_if_geojson_not_exist() >> postgis_to_geojson() >> compress_geojson() >> make_files_public())


create_ocsge_diff_centroid_vector_tiles()
