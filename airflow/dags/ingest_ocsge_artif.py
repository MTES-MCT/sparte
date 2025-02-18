import cgi
import json
import os
import tempfile

import pendulum
import psycopg2
import py7zr
import requests
from airflow.decorators import dag, task
from airflow.models.param import Param
from include.container import Container
from include.domain.data.ocsge.delete_in_dw import delete_artif_in_dw_sql
from include.geopackage import find_geopackage_in_directory
from include.pools import DBT_POOL, OCSGE_STAGING_POOL
from include.utils import (
    get_dbt_command_from_directory,
    multiline_string_to_single_line,
)

with open("include/domain/data/ocsge/sources.json", "r") as f:
    sources = json.load(f)


@dag(
    dag_id="ingest_ogsge_artif",
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
    params={
        "departement": Param("75", type="string", enum=list(sources.keys())),
        "year": Param(2018, type="integer"),
        "refresh_source": Param(False, type="boolean"),
    },
)
def ingest_ocsge_artif():  # noqa: C901
    bucket_name = "airflow-staging"

    @task.python
    def get_url(**context):
        departement = context["params"]["departement"]
        year = str(context["params"]["year"])

        departement_source = sources[departement]

        artif_key = "artif"

        if artif_key not in departement_source:
            raise ValueError(f"Il n'y a pas de source d'artif pour le département {departement}")

        artif_source = sources[departement][artif_key]

        print(artif_source)

        if year not in artif_source:
            raise ValueError(f"L'année {year} n'existe pas dans les sources artif pour le département {departement}")

        url = artif_source[year]

        return url

    @task.python
    def check_url(url):
        response = requests.head(url)
        if not response.ok:
            print(f"Failed to download {url}. Response : {response.content}")
            raise ValueError(f"Failed to download {url}. Response : {response.content}")

        return {
            "url": url,
            "status_code": response.status_code,
        }

    @task.python
    def download(url, **context):
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

    @task.bash(pool=OCSGE_STAGING_POOL)
    def ingest_staging(path_on_bucket, **context):
        loaded_date = int(pendulum.now().timestamp())

        departement = context["params"]["departement"]
        year = str(context["params"]["year"])

        local_path = "/tmp/artif-ocsge.7z"
        Container().s3().get_file(path_on_bucket, local_path)
        extract_dir = tempfile.mkdtemp()
        py7zr.SevenZipFile(local_path, mode="r").extractall(path=extract_dir)

        geopackage_path = find_geopackage_in_directory(extract_dir)
        geopackage_table_name = f"artif_{year}_{departement}"

        sql = f"""
        SELECT
            id,
            code_cs,
            code_us,
            millesime,
            artif,
            crit_seuil,
            the_geom as geom,
            '{departement}' as departement,
            {loaded_date} as loaded_date,
            {year} as year
        FROM
            {geopackage_table_name}
        """

        cmd = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"{Container().gdal_dbt_conn().encode()}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-a_srs",
            "EPSG:2154",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            "ocsge_artif_staging",
            geopackage_path,
            "--config",
            "PG_USE_COPY",
            "YES",
            "-sql",
            f'"{multiline_string_to_single_line(sql)}"',
        ]

        return " ".join(cmd)

    @task.bash
    def test_staging(pool=DBT_POOL):
        return get_dbt_command_from_directory(
            cmd="dbt test -s source:sparte.public.ocsge_artif_staging",
        )

    @task.python
    def delete_previously_ingested(**context):
        sql = delete_artif_in_dw_sql(
            departement=context["params"]["departement"],
            year=context["params"]["year"],
        )

        try:
            conn = Container().psycopg2_dbt_conn()
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()
            cur.close()
        except psycopg2.errors.UndefinedTable:
            print("Table does not exist year, skipping deletion")

    @task.bash
    def ingest(path_on_bucket, **context):
        loaded_date = int(pendulum.now().timestamp())

        departement = context["params"]["departement"]
        year = str(context["params"]["year"])

        local_path = "/tmp/artif-ocsge.7z"
        Container().s3().get_file(path_on_bucket, local_path)
        extract_dir = tempfile.mkdtemp()
        py7zr.SevenZipFile(local_path, mode="r").extractall(path=extract_dir)

        geopackage_path = find_geopackage_in_directory(extract_dir)
        geopackage_table_name = f"artif_{year}_{departement}"

        sql = f"""
        SELECT
            id,
            code_cs,
            code_us,
            millesime,
            artif,
            crit_seuil,
            the_geom as geom,
            '{departement}' as departement,
            {loaded_date} as loaded_date,
            {year} as year
        FROM
            {geopackage_table_name}
        """

        cmd = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"{Container().gdal_dbt_conn().encode()}"',
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
            "ocsge_artif",
            geopackage_path,
            "--config",
            "PG_USE_COPY",
            "YES",
            "-sql",
            f'"{multiline_string_to_single_line(sql)}"',
        ]

        return " ".join(cmd)

    @task.bash(pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(
            cmd="dbt build -s artif",
        )

    url = get_url()
    check = check_url(url)
    path_on_bucket = download(url)
    ingest_staging_status = ingest_staging(path_on_bucket)
    test_staging_status = test_staging()
    delete_status = delete_previously_ingested()
    ingest_status = ingest(path_on_bucket)
    dbt_status = dbt_build()

    (
        url
        >> check
        >> path_on_bucket
        >> ingest_staging_status
        >> test_staging_status
        >> delete_status
        >> ingest_status
        >> dbt_status
    )


ingest_ocsge_artif()
