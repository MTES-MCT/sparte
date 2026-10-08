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

ALL_DEPARTEMENTS = list(sources.keys())


def get_geojson_filename(index: int, departement: str) -> str:
    return f"zonage_urbanisme_{index}_{departement}.geojson"


def get_pmtiles_filename(index: int, departement: str) -> str:
    return f"zonage_urbanisme_{index}_{departement}.pmtiles"


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE", "GPU"],
    max_active_tasks=10,
    params={
        "index": Param(1, type="integer", enum=[1, 2]),
        "departement": Param("75", type="string", enum=ALL_DEPARTEMENTS),
        "refresh_existing": Param(False, type="boolean"),
        "all_departements": Param(False, type="boolean"),
    },
)
def create_zonage_urbanisme_vector_tiles():  # noqa: C901
    bucket_name = InfraContainer().bucket_name()
    vector_tiles_dir = "vector_tiles"

    @task.python()
    def resolve_departements(params: dict) -> list[str]:
        if params.get("all_departements"):
            return ALL_DEPARTEMENTS
        return [params.get("departement")]

    @task.python()
    def check_if_vector_tiles_not_exist(params: dict, departements: list[str] = None) -> list[str]:
        if params.get("refresh_existing"):
            return departements
        index = params.get("index")
        to_process = []
        for dept in departements:
            filename = get_pmtiles_filename(index, dept)
            exists = InfraContainer().s3().exists(f"{bucket_name}/{vector_tiles_dir}/{filename}")
            if not exists:
                to_process.append(dept)
            else:
                print(f"Skipping {dept}: already exists")
        if not to_process:
            raise AirflowSkipException("All vector tiles already exist")
        return to_process

    @task.python(trigger_rule="none_skipped")
    def postgis_to_geojson(params: dict, departements: list[str] = None):
        index = params.get("index")
        for dept in departements:
            filename = get_geojson_filename(index, dept)
            sql = f"""
                SELECT
                    *
                FROM
                    public_for_vector_tiles.for_vector_tiles_zonage_urbanisme
                WHERE
                    year_index = {index} AND
                    \\"DEPART\\" = '{dept}'
            """
            Container().sql_to_geojsonseq_on_s3_handler().export_sql_result_to_geojsonseq_on_s3(
                sql=multiline_string_to_single_line(sql),
                s3_key=f"{vector_tiles_dir}/{filename}",
                s3_bucket=bucket_name,
            )
            print(f"GeoJSON exported: {filename}")
        return departements

    @task.python(trigger_rule="none_skipped")
    def geojson_to_pmtiles(params: dict, departements: list[str] = None) -> list[str]:
        index = params.get("index")
        handler = Container().geojson_on_s3_to_pmtiles_on_s3_handler()
        converted = []
        for dept in departements:
            geojson_filename = get_geojson_filename(index, dept)
            pmtiles_filename = get_pmtiles_filename(index, dept)
            path_on_s3 = handler.convert_geojson_to_pmtiles_on_s3(
                s3_bucket=bucket_name,
                s3_geojson_key=f"{vector_tiles_dir}/{geojson_filename}",
                s3_pmtiles_key=f"{vector_tiles_dir}/{pmtiles_filename}",
            )
            if path_on_s3 is None:
                print(f"Skipping {dept}: pas assez de données pour générer des tuiles")
                continue
            converted.append(dept)
            print(f"Uploaded: {pmtiles_filename}")
        return converted

    @task.python(trigger_rule="none_skipped")
    def make_pmtiles_public(params: dict, departements: list[str] = None):
        index = params.get("index")
        s3_handler = Container().s3_handler()
        for dept in departements:
            pmtiles_filename = get_pmtiles_filename(index, dept)
            pmtiles_key = f"{vector_tiles_dir}/{pmtiles_filename}"
            s3_handler.set_key_publicly_visible(pmtiles_key, bucket_name)
            print(f"Made public: {pmtiles_filename}")

    depts = resolve_departements()
    to_process = check_if_vector_tiles_not_exist(departements=depts)
    geojson_done = postgis_to_geojson(departements=to_process)
    pmtiles_done = geojson_to_pmtiles(departements=geojson_done)
    make_pmtiles_public(departements=pmtiles_done)


create_zonage_urbanisme_vector_tiles()
