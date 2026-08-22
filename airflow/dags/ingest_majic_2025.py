"""
Ce dag ingère les données MAJIC 2025 (Cerema, observatoire de l'artificialisation)
dans une base de données PostgreSQL.

Contrairement au dag `ingest_majic` qui chargeait des shapefiles (zippés), les données
2025 sont livrées au format geopackage (.gpkg), avec un fichier par région
(France métropolitaine + DROM). Ce dag se limite à l'ingestion brute des geopackages ;
la construction des modèles dbt est gérée séparément.
"""

import shutil
import subprocess
import tempfile
from typing import List

from include.container import InfraContainer as Container
from include.utils import get_shapefile_or_geopackage_first_layer_name
from pendulum import datetime

from airflow.decorators import dag
from airflow.operators.python import PythonOperator

BUCKET_NAME = Container().bucket_name()

configs = [
    {
        "name": "France Métropolitaine",
        "geopackage_on_s3": "conso_2025/conso_com_metro.gpkg",
        "srid": 2154,
        "table_name": "majic_france_metropolitaine_2025",
    },
    {
        "name": "Guadeloupe",
        "geopackage_on_s3": "conso_2025/conso_com_971.gpkg",
        "srid": 32620,
        "table_name": "majic_guadeloupe_2025",
    },
    {
        "name": "Martinique",
        "geopackage_on_s3": "conso_2025/conso_com_972.gpkg",
        "srid": 32620,
        "table_name": "majic_martinique_2025",
    },
    {
        "name": "Guyane",
        "geopackage_on_s3": "conso_2025/conso_com_973.gpkg",
        "srid": 2972,
        "table_name": "majic_guyane_2025",
    },
    {
        "name": "La Réunion",
        "geopackage_on_s3": "conso_2025/conso_com_974.gpkg",
        "srid": 2975,
        "table_name": "majic_la_reunion_2025",
    },
]


def load_geopackage_to_postgres(config: dict):
    geopackage_on_s3 = config["geopackage_on_s3"]
    srid = config["srid"]
    table_name = config["table_name"]
    path_on_bucket = f"{BUCKET_NAME}/{geopackage_on_s3}"
    tmp_dir = tempfile.mkdtemp()
    localpath = f"{tmp_dir}/{table_name}.gpkg"

    Container().s3().get_file(path_on_bucket, localpath)

    layer_name = get_shapefile_or_geopackage_first_layer_name(localpath)

    cmd = [
        "ogr2ogr",
        "-f",
        '"PostgreSQL"',
        f'"{Container().gdal_dbt_conn().encode()}"',
        "-overwrite",
        "-lco",
        "GEOMETRY_NAME=geom",
        "-a_srs",
        f"EPSG:{srid}",
        "-nlt",
        "MULTIPOLYGON",
        "-nlt",
        "PROMOTE_TO_MULTI",
        "-nln",
        table_name,
        localpath,
        layer_name,
        "--config",
        "PG_USE_COPY",
        "YES",
    ]
    subprocess.run(" ".join(cmd), shell=True, check=True)

    shutil.rmtree(tmp_dir)
    return config


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    max_active_runs=1,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["Majic", "Cerema"],
)
def ingest_majic_2025():
    ingest_tasks: List[PythonOperator] = []

    for config in configs:
        ingest_task = PythonOperator(
            task_id=f"ingest_{config['table_name']}",
            python_callable=load_geopackage_to_postgres,
            op_kwargs={"config": config},
        )
        ingest_tasks.append(ingest_task)

    for i in range(len(ingest_tasks) - 1):
        ingest_tasks[i] >> ingest_tasks[i + 1]


ingest_majic_2025()
