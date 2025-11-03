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


def get_geojson_filename(index: int, departement: str) -> str:
    return f"occupation_du_sol_{index}_{departement}.geojson"


def get_pmtiles_filename(index: int, departement: str) -> str:
    return f"occupation_du_sol_{index}_{departement}.pmtiles"


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
        "index": Param(1, type="integer", enum=[1, 2]),
        "departement": Param("75", type="string", enum=list(sources.keys())),
        "refresh_existing": Param(False, type="boolean"),
    },
)
def create_ocsge_vector_tiles():
    bucket_name = InfraContainer().bucket_name()
    vector_tiles_dir = "vector_tiles"

    @task.python()
    def check_if_vector_tiles_not_exist(params: dict):
        if params.get("refresh_existing"):
            return
        index = params.get("index")
        departement = params.get("departement")
        filename = get_pmtiles_filename(index, departement)
        exists = InfraContainer().s3().exists(f"{bucket_name}/{vector_tiles_dir}/{filename}")
        if exists:
            raise AirflowSkipException("Vector tiles already exist")

    @task.python(trigger_rule="none_skipped")
    def postgis_to_geojson(params: dict):
        index = params.get("index")
        departement = params.get("departement")
        filename = get_geojson_filename(index, departement)

        sql = f"""
            SELECT
                *
            FROM
                public_for_vector_tiles.for_vector_tiles_occupation_du_sol
            WHERE
                year_index = {index} AND
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
        index = params.get("index")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(index, departement)
        pmtiles_filename = get_pmtiles_filename(index, departement)
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
        index = params.get("index")
        departement = params.get("departement")
        pmtiles_filename = get_pmtiles_filename(index, departement)
        local_path = f"/tmp/{pmtiles_filename}"
        path_on_s3 = f"{bucket_name}/{vector_tiles_dir}/{pmtiles_filename}"
        InfraContainer().s3().put(local_path, path_on_s3)

    @task.bash(trigger_rule="none_skipped")
    def delete_geojson_file(params: dict):
        index = params.get("index")
        departement = params.get("departement")
        geojson_filename = get_geojson_filename(index, departement)
        return f"rm /tmp/{geojson_filename}"

    @task.bash(trigger_rule="none_skipped")
    def delete_pmtiles_file(params: dict):
        index = params.get("index")
        departement = params.get("departement")
        pmtiles_filename = get_pmtiles_filename(index, departement)
        return f"rm /tmp/{pmtiles_filename}"

    @task.python(trigger_rule="none_skipped")
    def make_pmtiles_public(params: dict):
        index = params.get("index")
        departement = params.get("departement")
        pmtiles_filename = get_pmtiles_filename(index, departement)
        pmtiles_key = f"{vector_tiles_dir}/{pmtiles_filename}"

        s3_handler = Container().s3_handler()

        # Make PMTiles file public
        s3_handler.set_key_publicly_visible(pmtiles_key, bucket_name)

    (
        check_if_vector_tiles_not_exist()
        >> postgis_to_geojson()
        >> geojson_to_pmtiles()
        >> upload()
        >> delete_geojson_file()
        >> delete_pmtiles_file()
        >> make_pmtiles_public()
    )


create_ocsge_vector_tiles()
