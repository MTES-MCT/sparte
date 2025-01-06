"""
Ce dag télécharge tous les fichiers OCS GE depuis les sources définies
dans `sources.json` et les stocke dans un bucket S3.
"""


import cgi
import json
import os

import pendulum
import requests
from airflow.decorators import dag
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
from include.container import Container

with open("include/domain/data/ocsge/sources.json", "r") as f:
    sources = json.load(f)


def get_urls_from_sources(sources: dict) -> list[str]:
    urls = []

    for departement in sources:
        difference = sources[departement]["difference"]
        occupation_du_sol_et_zone_construite = sources[departement]["occupation_du_sol_et_zone_construite"]
        for years in difference:
            urls.append(difference[years])
        for year in occupation_du_sol_et_zone_construite:
            urls.append(occupation_du_sol_et_zone_construite[year])

    return urls


def download_file_to_s3(url: str):
    bucket_name = "airflow-staging"
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
def download_all_ocsge():
    start = EmptyOperator(task_id="start")
    end = EmptyOperator(task_id="end")

    tasks = []
    for url in get_urls_from_sources(sources):
        task = PythonOperator(
            task_id=url.split("/")[-1],
            python_callable=download_file_to_s3,
            op_args=[url],
        )
        tasks.append(task)

    start >> tasks >> end


download_all_ocsge()
