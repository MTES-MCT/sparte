from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator
from dependencies.container import Container
from dependencies.utils import multiline_string_to_single_line
from gdaltools import ogr2ogr
from pendulum import datetime


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def gpu():
    bucket_name = "airflow-staging"
    wfs_du_filename = "wfs_du.gpkg"

    @task.python
    def download() -> str:
        path_on_bucket = f"{bucket_name}/gpu/{wfs_du_filename}"
        with Container.gpu_sftp() as sftp:
            sftp.get(f"/pub/export-wfs/latest/gpkg/{wfs_du_filename}", f"/tmp/{wfs_du_filename}")

        Container().s3().put_file(f"/tmp/{wfs_du_filename}", path_on_bucket)

        return path_on_bucket

    @task.python
    def ingest(path_on_bucket: str) -> str:
        wfs_du_temp = f"/tmp/{wfs_du_filename}"
        Container().s3().get_file(path_on_bucket, wfs_du_temp)
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
            f'"{Container().gdal_dw_conn_str()}"',
            "-overwrite",
            "-lco",
            "GEOMETRY_NAME=geom",
            "-a_srs",
            "EPSG:4236",
            "-nln",
            "gpu_zone_urba",
            "-nlt",
            "MULTIPOLYGON",
            "-nlt",
            "PROMOTE_TO_MULTI",
            wfs_du_temp,
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

    @task.python
    def load_to_app():
        ogr = ogr2ogr()
        ogr.config_options = {"PG_USE_COPY": "YES", "OGR_TRUNCATE": "NO"}
        ogr.set_input(Container().gdal_dw_conn(schema="public_gpu"), table_name="app_zoneurba")
        ogr.set_output(Container().gdal_app_conn(), table_name="public_data_zoneurba")
        ogr.set_output_mode(layer_mode=ogr.MODE_LAYER_OVERWRITE)
        ogr.execute()

    path_on_bucket = download()
    ingest_task = ingest(path_on_bucket)
    ingest_task >> load_to_app()


gpu()
