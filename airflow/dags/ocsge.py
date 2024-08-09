"""
## Astronaut ETL example DAG

This DAG queries the list of astronauts currently in space from the
Open Notify API and prints each astronaut's name and flying craft.

There are two tasks, one to get the data from the API and save the results,
and another to print the results. Both tasks are written in Python using
Airflow's TaskFlow API, which allows you to easily turn Python functions into
Airflow tasks, and automatically infer dependencies and pass data.

The second task uses dynamic task mapping to create a copy of the task for
each Astronaut in the list retrieved from the API. This list will change
depending on how many Astronauts are in space, and the DAG will adjust
accordingly each time it runs.

For more explanation and getting started instructions, see our Write your
first DAG tutorial: https://docs.astronomer.io/learn/get-started-with-airflow
"""

import cgi
import os
import re
import tempfile

import pendulum
import py7zr
import requests
from airflow.decorators import dag, task
from airflow.models.param import Param
from airflow.operators.bash import BashOperator
from dependencies.container import Container
from dependencies.utils import multiline_string_to_single_line


def find_years_in_url(url: str) -> list[int]:
    results = re.findall(pattern="(\d{4})", string=str(url))  # noqa: W605

    years = set()

    for result in results:
        # check if the year the number is > 2000.
        # this is to avoid getting other numbers in the path as years
        if str(result).startswith("20"):
            years.add(int(result))

    if not years:
        raise ValueError("Years not found in the path")

    return list(sorted(years))


def years_as_string(years: list[int]) -> str:
    return "_".join(map(str, years))


def find_departement_in_url(url: str) -> str:
    results = re.findall(pattern="D(\d{3})", string=str(url))  # noqa: W605

    if len(results) > 0:
        result = results[0]

    if str(result).startswith("0"):
        return str(result).replace("0", "", 1)

    if not result:
        raise ValueError("Departement not found in the path")

    return result


def ocsge_diff_normalization_sql(years: list[int], departement: str, source_name: str, loaded_date: float) -> str:
    fields = {
        "cs_new": f"CS_{years[1]}",
        "cs_old": f"CS_{years[0]}",
        "us_new": f"US_{years[1]}",
        "us_old": f"US_{years[0]}",
        "year_old": years[0],
        "year_new": years[1],
    }

    return f"""
    SELECT
        {loaded_date} AS loaded_date,
        {fields['year_old']} AS year_old,
        {fields['year_new']} AS year_new,
        {fields['cs_new']} AS cs_new,
        {fields['cs_old']} AS cs_old,
        {fields['us_new']} AS us_new,
        {fields['us_old']} AS us_old,
        cast({departement} as text) AS departement,
        GEOMETRY as geom
    FROM
        {source_name}
    """


def ocsge_occupation_du_sol_normalization_sql(
    years: list[int],
    departement: str,
    source_name: str,
    loaded_date: float,
) -> str:
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        code_cs AS code_cs,
        code_us AS code_us,
        GEOMETRY AS geom,
        cast({departement} as text) AS departement,
        {years[0]} AS year
    FROM
        {source_name}
    """


def ocsge_zone_construite_normalization_sql(
    years: list[int],
    departement: str,
    source_name: str,
    loaded_date: float,
) -> str:
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        {years[0]} AS year,
        cast({departement} as text) AS departement,
        GEOMETRY AS geom
    FROM
        {source_name}
    """


def get_table_name(shapefile_name: str) -> str | None:
    shapefile_name = shapefile_name.lower()
    if "diff" in shapefile_name:
        return "ocsge_diff"
    if "occupation" in shapefile_name:
        return "ocsge_occupation_du_sol"
    if "zone" in shapefile_name:
        return "ocsge_zone_construite"

    return None


def get_normalization_sql(
    table_name: str,
    source_name: str,
    years: list[int],
    departement: str,
    loaded_date: float,
) -> str:
    return {
        "ocsge_diff": ocsge_diff_normalization_sql,
        "ocsge_occupation_du_sol": ocsge_occupation_du_sol_normalization_sql,
        "ocsge_zone_construite": ocsge_zone_construite_normalization_sql,
    }[table_name](
        years=years,
        departement=departement,
        source_name=source_name,
        loaded_date=loaded_date,
    )


configs = {  # noqa: E501
    "91": {
        "occupation_du_sol_et_zone_construite": {
            2018: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D091_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D091_2018-01-01.7z",  # noqa: E501
            2021: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D091_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D091_2021-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2018,
                2021,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0_DIFF_SHP_LAMB93_D091_2018-2021/OCS-GE_2-0_DIFF_SHP_LAMB93_D091_2018-2021.7z",  # noqa: E501
        },
    },
    "92": {
        "occupation_du_sol_et_zone_construite": {
            2018: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D092_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D092_2018-01-01.7z",  # noqa: E501
            2021: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D092_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D092_2021-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2018,
                2021,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0_DIFF_SHP_LAMB93_D092_2018-2021/OCS-GE_2-0_DIFF_SHP_LAMB93_D092_2018-2021.7z",  # noqa: E501
        },
    },
    "78": {
        "occupation_du_sol_et_zone_construite": {
            2018: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D078_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D078_2018-01-01.7z",  # noqa: E501
            2021: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D078_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D078_2021-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2018,
                2021,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D078_DIFF_2018-2021/OCS-GE_2-0__SHP_LAMB93_D078_DIFF_2018-2021.7z"  # noqa: E501
        },
    },
    "94": {
        "occupation_du_sol_et_zone_construite": {
            2018: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D094_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D094_2018-01-01.7z",  # noqa: E501
            2021: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D094_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D094_2021-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2018,
                2021,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0_DIFF_SHP_LAMB93_D094_2018-2021/OCS-GE_2-0_DIFF_SHP_LAMB93_D094_2018-2021.7z",  # noqa: E501
        },
    },
    "75": {
        "occupation_du_sol_et_zone_construite": {
            2018: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D075_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D075_2018-01-01.7z",  # noqa: E501
            2021: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2018,
                2021,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0_DIFF_SHP_LAMB93_D075_2018-2021/OCS-GE_2-0_DIFF_SHP_LAMB93_D075_2018-2021.7z",  # noqa: E501
        },
    },
    "32": {
        "occupation_du_sol_et_zone_construite": {
            2016: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D032_2016-01-01/OCS-GE_2-0__SHP_LAMB93_D032_2016-01-01.7z",  # noqa: E501
            2019: "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D032_2019-01-01/OCS-GE_2-0__SHP_LAMB93_D032_2019-01-01.7z",  # noqa: E501
        },
        "difference": {
            (
                2016,
                2019,
            ): "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D032_DIFF_2016-2019/OCS-GE_2-0__SHP_LAMB93_D032_DIFF_2016-2019.7z",  # noqa: E501
        },
    },
}


departement_list = list(configs.keys())


@dag(
    dag_id="ingest_ocsge",
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
    params={
        "departement": Param("75", type="string", enum=departement_list),
        "years": Param([2018], type="array"),
        "dataset": Param(
            "occupation_du_sol_et_zone_construite",
            type="string",
            enum=[
                "occupation_du_sol_et_zone_construite",
                "difference",
            ],
        ),
    },
)
def ocsge():  # noqa: C901
    bucket_name = "airflow-staging"

    @task.python
    def get_url_from_config(**context) -> str:
        departement = context["params"]["departement"]
        years = tuple(map(int, context["params"]["years"]))
        dataset = context["params"]["dataset"]

        if len(years) == 1:
            years = years[0]

        print(departement, dataset, years)

        url = configs.get(departement, {}).get(dataset, {}).get(years)

        print(url)
        return url

    @task.python
    def download_ocsge(url) -> str:
        response = requests.get(url, allow_redirects=True)

        if not response.ok:
            raise ValueError(f"Failed to download {url}. Response : {response.content}")
        header = response.headers["content-disposition"]
        _, params = cgi.parse_header(header)
        filename = params.get("filename")

        path_on_bucket = f"{bucket_name}/{os.path.basename(filename)}"
        with Container().s3().open(path_on_bucket, "wb") as distant_file:
            distant_file.write(response.content)

        return path_on_bucket

    @task.python
    def ingest_ocsge(path, **context) -> int:
        loaded_date = int(pendulum.now().timestamp())
        departement = context["params"]["departement"]
        years = context["params"]["years"]
        print(loaded_date)
        with Container().s3().open(path, "rb") as f:
            extract_dir = tempfile.mkdtemp()
            py7zr.SevenZipFile(f, mode="r").extractall(path=extract_dir)

            for dirpath, _, filenames in os.walk(extract_dir):
                for filename in filenames:
                    if filename.endswith(".shp"):
                        path = os.path.abspath(os.path.join(dirpath, filename))
                        table_name = get_table_name(shapefile_name=filename)
                        print("get_table_name", table_name)
                        if not table_name:
                            continue
                        sql = multiline_string_to_single_line(
                            get_normalization_sql(
                                source_name=os.path.basename(path).replace(".shp", ""),
                                table_name=table_name,
                                years=years,
                                departement=departement,
                                loaded_date=loaded_date,
                            )
                        )
                        cmd = [
                            "ogr2ogr",
                            "-dialect",
                            "SQLITE",
                            "-f",
                            '"PostgreSQL"',
                            f'"{Container().postgres_conn_str_ogr2ogr()}"',
                            "-append",
                            "-lco",
                            "GEOMETRY_NAME=geom",
                            "-a_srs",
                            "EPSG:2154",
                            "-nlt",
                            "MULTIPOLYGON",
                            "-nlt",
                            "PROMOTE_TO_MULTI",
                            "-nln",
                            table_name,
                            path,
                            "--config",
                            "PG_USE_COPY",
                            "YES",
                            "-sql",
                            f'"{sql}"',
                        ]
                        BashOperator(
                            task_id=f"ingest_{table_name}",
                            bash_command=" ".join(cmd),
                        ).execute(context={})

        return loaded_date

    @task.bash(retries=0)
    def dbt_test_ocsge(**context):
        dataset = context["params"]["dataset"]

        if dataset == "occupation_du_sol_et_zone_construite":
            selector = "source:sparte.public.ocsge_occupation_du_sol source:sparte.public.ocsge_zone_construite"
        elif dataset == "difference":
            selector = "source:sparte.public.ocsge_diff"
        else:
            raise ValueError(f"Unknown dataset {dataset}")

        return 'cd "${AIRFLOW_HOME}/sql/sparte" && dbt test -s ' + selector

    @task.bash(retries=0, trigger_rule="all_success")
    def dbt_run_ocsge(**context):
        dataset = context["params"]["dataset"]

        if dataset == "occupation_du_sol_et_zone_construite":
            selector = "source:sparte.public.ocsge_occupation_du_sol+ source:sparte.public.ocsge_zone_construite+"
        elif dataset == "difference":
            selector = "source:sparte.public.ocsge_diff+"
        else:
            raise ValueError(f"Unknown dataset {dataset}")

        return 'cd "${AIRFLOW_HOME}/sql/sparte" && dbt run -s ' + selector

    @task.python(trigger_rule="one_failed")
    def rollback_append(loaded_date: float, **context):
        dataset = context["params"]["dataset"]

        if dataset == "occupation_du_sol_et_zone_construite":
            tables = ["ocsge_occupation_du_sol", "ocsge_zone_construite"]
        elif dataset == "difference":
            tables = ["ocsge_diff"]
        else:
            raise ValueError(f"Unknown dataset {dataset}")

        conn = Container().postgres_conn()
        cur = conn.cursor()

        results = {}

        for table in tables:
            print(f"DELETE FROM public.{table} WHERE loaded_date = {loaded_date}")
            cur.execute(f"DELETE FROM public.{table} WHERE loaded_date = {loaded_date}")
            results[table] = cur.rowcount

        conn.commit()
        conn.close()

        return results

    @task.python
    def export_table():
        conn = Container().postgres_conn()
        cur = conn.cursor()

        filename = "occupation_du_sol.csv"
        temp_file = f"/tmp/{filename}"
        temp_archive = f"/tmp/{filename}.7z"
        path_on_bucket = f"{bucket_name}/{filename}.7z"

        with open(temp_file, "w") as csv_file:
            cur.copy_expert("COPY (SELECT * FROM public_ocsge.occupation_du_sol) TO STDOUT WITH CSV HEADER", csv_file)

        with py7zr.SevenZipFile(temp_archive, mode="w") as archive:
            archive.write(temp_file, filename)

        with open(temp_archive, "rb") as archive:
            with Container().s3().open(path_on_bucket, "wb") as f:
                f.write(archive.read())

    url = get_url_from_config()
    path = download_ocsge(url=url)
    loaded_date = ingest_ocsge(path=path)
    (
        loaded_date
        >> dbt_test_ocsge()
        >> [
            rollback_append(loaded_date=loaded_date),
            dbt_run_ocsge(),
        ]
    )


ocsge()
