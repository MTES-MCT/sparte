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
    return f"occupation_du_sol_diff_{'_'.join(map(str, indexes))}_{departement}.geojson"


def get_pmtiles_filename(indexes: list[int], departement: str) -> str:
    return f"occupation_du_sol_diff_{'_'.join(map(str, indexes))}_{departement}.pmtiles"


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
def create_ocsge_diff_vector_tiles():
    bucket_name = InfraContainer().bucket_name()
    vector_tiles_dir = "vector_tiles"

    @task.python()
    def check_if_vector_tiles_not_exist(params: dict):
        if params.get("refresh_existing"):
            return
        indexes = params.get("indexes")
        departement = params.get("departement")
        filename = get_pmtiles_filename(indexes, departement)
        exists = InfraContainer().s3().exists(f"{bucket_name}/{vector_tiles_dir}/{filename}")
        if exists:
            raise AirflowSkipException("Vector tiles already exist")

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
                public_for_vector_tiles.for_vector_tiles_difference_ocsge
            WHERE
                year_old_index = {year_old_index} AND
                year_new_index = {year_new_index} AND
                departement = '{departement}'
        """

        return (
            Container()
            .sql_to_geojsonseq_on_s3_handler()
            .export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),  # noqa: E501
                s3_key=f"{vector_tiles_dir}/{filename}",
                s3_bucket=bucket_name,
            )
        )

    @task.bash(skip_on_exit_code=110, trigger_rule="none_skipped")
    def geojson_to_pmtiles(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(indexes, departement)
        pmtiles_filename = get_pmtiles_filename(indexes, departement)
        local_input = f"/tmp/{geojson_filename}"
        local_output = f"/tmp/{pmtiles_filename}"
        InfraContainer().s3().get_file(f"{bucket_name}/{vector_tiles_dir}/{geojson_filename}", local_input)

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
    def upload(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        pmtiles_filename = get_pmtiles_filename(indexes, departement)
        local_path = f"/tmp/{pmtiles_filename}"
        path_on_s3 = f"{bucket_name}/{vector_tiles_dir}/{pmtiles_filename}"
        InfraContainer().s3().put(local_path, path_on_s3)

    @task.bash(trigger_rule="none_skipped")
    def delete_geojson_file(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(indexes, departement)
        return f"rm /tmp/{geojson_filename}"

    @task.bash(trigger_rule="none_skipped")
    def delete_pmtiles_file(params: dict):
        indexes = params.get("indexes")
        departement = params.get("departement")
        pmtiles_filename = get_pmtiles_filename(indexes, departement)
        return f"rm /tmp/{pmtiles_filename}"

    (
        check_if_vector_tiles_not_exist()
        >> postgis_to_geojson()
        >> geojson_to_pmtiles()
        >> upload()
        >> delete_geojson_file()
        >> delete_pmtiles_file()
    )


create_ocsge_diff_vector_tiles()
