"""
Ce dag ingère les données de l'IGN OCS GE dans une base de données
PostgreSQL, puis lance un job dbt pour les transformer.
"""

import cgi
import json
import os
import tempfile
from typing import Literal

import pendulum
import py7zr
import requests
from airflow.decorators import dag, task
from airflow.exceptions import AirflowSkipException
from airflow.models.param import Param
from airflow.operators.bash import BashOperator
from include.container import Container
from include.domain.container import Container as DomainContainer
from include.domain.data.ocsge.delete_in_dw import (
    delete_difference_in_dw_sql,
    delete_occupation_du_sol_in_dw_sql,
    delete_zone_construite_in_dw_sql,
)
from include.domain.data.ocsge.enums import DatasetName, SourceName
from include.domain.data.ocsge.normalization import (
    ocsge_diff_normalization_sql,
    ocsge_occupation_du_sol_normalization_sql,
    ocsge_zone_construite_normalization_sql,
)
from include.pools import DBT_POOL, OCSGE_STAGING_POOL
from include.shapefile import get_shapefile_fields
from include.utils import multiline_string_to_single_line


def get_paths_from_directory(directory: str) -> list[tuple[str, str]]:
    paths = []

    for dirpath, _, filenames in os.walk(directory):
        for filename in filenames:
            path = os.path.abspath(os.path.join(dirpath, filename))
            paths.append(
                (
                    path,
                    filename,
                )
            )

    return paths


with open("include/domain/data/ocsge/sources.json", "r") as f:
    sources = json.load(f)

vars = {
    SourceName.OCCUPATION_DU_SOL: {
        "shapefile_name": "OCCUPATION_SOL",
        "dbt_selector": "source:sparte.public.ocsge_occupation_du_sol",
        "dbt_selector_staging": "source:sparte.public.ocsge_occupation_du_sol_staging",
        "dw_staging": "ocsge_occupation_du_sol_staging",
        "dw_source": "ocsge_occupation_du_sol",
        "normalization_sql": ocsge_occupation_du_sol_normalization_sql,
        "delete_on_dwt": delete_occupation_du_sol_in_dw_sql,
    },
    SourceName.ZONE_CONSTRUITE: {
        "shapefile_name": "ZONE_CONSTRUITE",
        "dbt_selector": "source:sparte.public.ocsge_zone_construite",
        "dbt_selector_staging": "source:sparte.public.ocsge_zone_construite_staging",
        "dw_staging": "ocsge_zone_construite_staging",
        "dw_source": "ocsge_zone_construite",
        "normalization_sql": ocsge_zone_construite_normalization_sql,
        "delete_on_dwt": delete_zone_construite_in_dw_sql,
    },
    SourceName.DIFFERENCE: {
        "shapefile_name": "DIFFERENCE",
        "dbt_selector": "source:sparte.public.ocsge_difference",
        "dbt_selector_staging": "source:sparte.public.ocsge_difference_staging",
        "dw_staging": "ocsge_difference_staging",
        "dw_source": "ocsge_difference",
        "dw_final_table_name": "app_ocsgediff",
        "normalization_sql": ocsge_diff_normalization_sql,
        "delete_on_dwt": delete_difference_in_dw_sql,
    },
}

vars_dataset = {
    DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE: [
        vars[SourceName.OCCUPATION_DU_SOL],
        vars[SourceName.ZONE_CONSTRUITE],
    ],
    DatasetName.DIFFERENCE: [
        vars[SourceName.DIFFERENCE],
    ],
}


def get_source_name_from_shapefile_name(shapefile_name: str) -> SourceName | None:
    shapefile_name = shapefile_name.lower()
    if "diff" in shapefile_name or "diif" in shapefile_name:
        # Certains shapefiles ont un nom de fichier avec une faute de frappe (diif au lieu de diff)
        return SourceName.DIFFERENCE
    if "occupation" in shapefile_name:
        return SourceName.OCCUPATION_DU_SOL
    if "zone" in shapefile_name:
        return SourceName.ZONE_CONSTRUITE

    return None


def get_vars_by_shapefile_name(shapefile_name: str) -> dict | None:
    source_name = get_source_name_from_shapefile_name(shapefile_name)
    if not source_name:
        return None

    return vars[source_name]


def load_shapefiles_to_dw(
    path: str,
    years: list[int],
    departement: str,
    loaded_date: int,
    table_key: str,
    dataset: Literal[DatasetName.DIFFERENCE, DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE],
    mode: Literal["overwrite", "append"] = "append",
):
    local_path = "/tmp/ocsge.7z"
    Container().s3().get_file(path, local_path)
    extract_dir = tempfile.mkdtemp()
    py7zr.SevenZipFile(local_path, mode="r").extractall(path=extract_dir)

    shapefile_matching_names_found = 0

    for file_path, filename in get_paths_from_directory(extract_dir):
        if not file_path.endswith(".shp"):
            continue
        variables = get_vars_by_shapefile_name(filename)

        if not variables:
            continue

        shapefile_matching_names_found += 1

        fields = get_shapefile_fields(file_path)

        sql = multiline_string_to_single_line(
            variables["normalization_sql"](
                shapefile_name=filename.split(".")[0],
                years=years,
                departement=departement,
                loaded_date=loaded_date,
                fields=fields,
            )
        )
        table_name = variables[table_key]

        cmd = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"{Container().gdal_dbt_conn().encode()}"',
            f"-{mode}",
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
            file_path,
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

    if shapefile_matching_names_found == 0:
        raise ValueError(f"No shapefile matching names found in {extract_dir}")
    if dataset == DatasetName.DIFFERENCE and shapefile_matching_names_found != 1:
        raise ValueError(f"Only one shapefile should be found for the dataset {dataset}")
    if dataset == DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE and shapefile_matching_names_found != 2:
        raise ValueError(f"Two shapefiles should be found for the dataset {dataset}")


@dag(
    dag_id="ingest_ocsge",
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
    params={
        "departement": Param("75", type="string", enum=list(sources.keys())),
        "years": Param([2018], type="array"),
        "dataset": Param(
            DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE,
            type="string",
            enum=[
                DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE,
                DatasetName.DIFFERENCE,
            ],
        ),
        "refresh_source": Param(False, type="boolean"),
        "dbt_build": Param(False, type="boolean"),
    },
)
def ocsge():  # noqa: C901
    bucket_name = "airflow-staging"

    @task.python()
    def get_url(**context) -> str:
        departement = context["params"]["departement"]
        years = "_".join(map(str, context["params"]["years"]))
        dataset = context["params"]["dataset"]

        if len(years) == 1:
            years = str(years[0])

        return sources.get(departement, {}).get(dataset, {}).get(years)

    @task.python(retries=0)
    def check_url_exists(url) -> dict:
        response = requests.head(url)
        if not response.ok:
            print(f"Failed to download {url}. Response : {response.content}")

        return {
            "url": url,
            "status_code": response.status_code,
        }

    @task.python
    def download_ocsge(url, **context) -> str:
        if not context["params"]["refresh_source"]:
            filename = url.split("/")[-1]
            path_on_bucket = f"{bucket_name}/{filename}"
            if Container().s3().exists(path_on_bucket):
                return path_on_bucket

        response = requests.get(url)

        if not response.ok:
            raise ValueError(f"Failed to download {url}. Response : {response.content}")

        header = response.headers["content-disposition"]
        _, params = cgi.parse_header(header)
        filename = params.get("filename")

        path_on_bucket = f"{bucket_name}/{os.path.basename(filename)}"
        with Container().s3().open(path_on_bucket, "wb") as distant_file:
            distant_file.write(response.content)

        return path_on_bucket

    @task.python(pool=OCSGE_STAGING_POOL)
    def ingest_staging(path, **context) -> int:
        loaded_date = int(pendulum.now().timestamp())
        departement = context["params"]["departement"]
        years = context["params"]["years"]
        dataset = context["params"]["dataset"]

        load_shapefiles_to_dw(
            path=path,
            years=years,
            departement=departement,
            loaded_date=loaded_date,
            dataset=dataset,
            table_key="dw_staging",
            mode="overwrite",
        )

        return loaded_date

    @task.bash(pool=OCSGE_STAGING_POOL)
    def db_test_ocsge_staging(**context):
        dataset = context["params"]["dataset"]
        dbt_select = " ".join([vars["dbt_selector_staging"] for vars in vars_dataset[dataset]])
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt test -s ' + dbt_select

    @task.python(trigger_rule="all_success")
    def delete_previously_loaded_data_in_dw(**context) -> dict:
        dataset = context["params"]["dataset"]
        departement = context["params"]["departement"]
        years = context["params"]["years"]
        conn = Container().psycopg2_dbt_conn()
        cur = conn.cursor()

        results = {}

        for vars in vars_dataset[dataset]:
            try:
                cur.execute(vars["delete_on_dwt"](departement, years))
                results[vars["dw_source"]] = cur.rowcount
            except Exception as e:
                results[vars["dw_source"]] = str(e)

        conn.commit()
        conn.close()

        return results

    @task.python
    def ingest_ocsge(path, **context) -> int:
        loaded_date = int(pendulum.now().timestamp())
        departement = context["params"]["departement"]
        years = context["params"]["years"]
        dataset = context["params"]["dataset"]

        load_shapefiles_to_dw(
            path=path,
            years=years,
            departement=departement,
            loaded_date=loaded_date,
            dataset=dataset,
            table_key="dw_source",
        )

        return loaded_date

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_run_ocsge(**context):
        dataset = context["params"]["dataset"]
        dbt_build = context["params"]["dbt_build"]

        if not dbt_build:
            raise AirflowSkipException

        dbt_select = " ".join([f'{vars["dbt_selector"]}+' for vars in vars_dataset[dataset]])
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt build -s ' + dbt_select

    @task.python(trigger_rule="all_done")
    def log_to_mattermost(**context):
        dbt_build = "Oui" if context["params"]["dbt_build"] else "Non"
        refresh_source = "Oui" if context["params"]["refresh_source"] else "Non"
        years = ", ".join(context["params"]["years"])
        message = f"""
### Calcul de données OCS GE terminé
- Jeu de donnée : {context["params"]["dataset"]}
- Departement : {context["params"]["departement"]}
- Année(s) : {years}
- Source MAJ : {refresh_source} (si les données sont déjà présentes sur le bucket, elles ne sont pas rechargées)
- Lancement de dbt : {dbt_build}
"""
        DomainContainer().notification().send(message)

    url = get_url()
    url_exists = check_url_exists(url=url)
    path = download_ocsge(url=url)
    load_date_staging = ingest_staging(path=path)
    test_result_staging = db_test_ocsge_staging()
    delete_dw = delete_previously_loaded_data_in_dw()
    loaded_date = ingest_ocsge(path=path)
    dbt_run_ocsge_result = dbt_run_ocsge()
    log = log_to_mattermost()

    (
        url
        >> url_exists
        >> path
        >> load_date_staging
        >> test_result_staging
        >> delete_dw
        >> loaded_date
        >> dbt_run_ocsge_result
        >> log
    )


ocsge()
