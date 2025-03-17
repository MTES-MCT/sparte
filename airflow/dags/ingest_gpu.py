"""
Ce dag ingère les données de l'IGN GPU dans une base de données PostgreSQL.
"""

from include.container import Container
from include.utils import multiline_string_to_single_line
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def ingest_gpu():
    bucket_name = "airflow-staging"
    wfs_du_filename = "wfs_du.gpkg"
    path_on_bucket = f"{bucket_name}/gpu/{wfs_du_filename}"
    wfs_folder = "/pub/export-wfs/latest/gpkg/"
    wfs_filepath = f"{wfs_folder}{wfs_du_filename}"
    localpath = f"/tmp/{wfs_du_filename}"

    @task.python
    def download() -> str:
        with Container.gpu_sftp() as sftp:
            sftp.get(wfs_filepath, localpath)

        Container().s3().put_file(localpath, path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest():
        Container().s3().get_file(path_on_bucket, localpath)
        sql = """
            SELECT
                MD5Checksum(ST_AsText(geom)) AS checksum,
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
                geom
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
        BashOperator(
            task_id="ingest_gpu",
            bash_command=" ".join(cmd),
        ).execute(context={})

    @task.bash
    def dbt_build() -> str:
        return 'cd "${AIRFLOW_HOME}/include/sql/sparte" && dbt build -s zonage_urbanisme.sql+'

    @task.bash
    def cleanup() -> str:
        return f"rm -f {localpath}"

    download() >> ingest() >> dbt_build() >> cleanup()


ingest_gpu()
