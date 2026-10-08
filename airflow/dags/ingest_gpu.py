"""
Ce dag ingère les zones d'urbanisme du GPU (Géoportail de l'Urbanisme) dans une base
de données PostgreSQL.

La couche `zone_urba` est téléchargée depuis l'export hebdomadaire HTTP du GPU (voir
`include/gpu_export.py`), qui remplace l'ancien serveur SFTP de l'IGN.

⚠️ **DAG bloqué** (`SCHEMA_TO_VERIFY`) : schéma à vérifier avant de lancer. Le nouvel
export renomme déjà la géométrie (`the_geom` au lieu de `geom`) ; les autres colonnes
lues par `ingest` (`gpu_doc_id`, `gpu_status`, `gpu_timestamp`, `partition`…) et les
modèles dbt en aval n'ont pas encore été vérifiés sur ce nouveau geopackage.
"""

import os
import tempfile
from logging import getLogger

from include.container import InfraContainer as Container
from include.dbt import DbtBuild
from include.gpu_export import download_gpu_export_file, get_latest_gpu_export_file
from include.utils import multiline_string_to_single_line, run_command
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.exceptions import AirflowFailException

logger = getLogger(__name__)

# Garde-fou : sans lui, un lancement écraserait gpu/wfs_du.gpkg sur S3 avec le nouvel
# export avant d'avoir vérifié qu'`ingest` et les modèles dbt en lisent bien le schéma.
# Passer à False une fois le schéma de zone_urba vérifié.
SCHEMA_TO_VERIFY = True


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def ingest_gpu():
    bucket_name = Container().bucket_name()
    wfs_du_filename = "wfs_du.gpkg"
    path_on_bucket = f"{bucket_name}/gpu/{wfs_du_filename}"

    @task.python
    def download() -> str:
        if SCHEMA_TO_VERIFY:
            raise AirflowFailException(
                "ingest_gpu est bloqué : schéma à vérifier avant de lancer "
                "(nouvel export HTTP du GPU, colonnes de zone_urba à contrôler)."
            )

        with tempfile.TemporaryDirectory() as tmp_dir:
            localpath = os.path.join(tmp_dir, wfs_du_filename)

            export_file = get_latest_gpu_export_file("zone_urba")
            logger.info(f"Téléchargement de {export_file.url}")
            download_gpu_export_file(export_file, localpath)

            Container().s3().put_file(localpath, path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest():
        with tempfile.TemporaryDirectory() as tmp_dir:
            localpath = os.path.join(tmp_dir, wfs_du_filename)
            Container().s3().get_file(path_on_bucket, localpath)

            sql = """
                SELECT
                    gpu_doc_id,
                    gpu_status,
                    gpu_timestamp,
                    partition,
                    libelle,
                    libelong,
                    typezone,
                    destdomi,
                    nomfic,
                    urlfic,
                    insee,
                    datappro,
                    datvalid,
                    idurba,
                    idzone,
                    lib_idzone,
                    formdomi,
                    destoui,
                    destcdt,
                    destnon,
                    symbole,
                    the_geom AS geom
                FROM
                    zone_urba
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
                "EPSG:4326",
                "-nln",
                "gpu_zone_urba",
                "-nlt",
                "MULTIPOLYGON",
                "-nlt",
                "PROMOTE_TO_MULTI",
                localpath,
                "-sql",
                f'"{multiline_string_to_single_line(sql)}"',
                "--config",
                "PG_USE_COPY",
                "YES",
            ]
            run_command(cmd)

    dbt_build = DbtBuild(select=["1_zonage_urbanisme_raw.sql+"])

    download() >> ingest() >> dbt_build


ingest_gpu()
