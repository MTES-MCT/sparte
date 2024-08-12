from os import getenv

import pysftp
import sqlalchemy
from airflow.hooks.base import BaseHook
from dependency_injector import containers, providers
from gdaltools import PgConnectionString
from psycopg2 import connect
from psycopg2.extensions import connection
from s3fs import S3FileSystem


def db_str_for_ogr2ogr(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"PG:dbname='{dbname}' host='{host}' port='{port}' user='{user}' password='{password}'"


def create_sql_alchemy_conn(url: str) -> sqlalchemy.engine.base.Connection:
    return sqlalchemy.create_engine(url)


class Container(containers.DeclarativeContainer):
    s3 = providers.Factory(
        provides=S3FileSystem,
        key=BaseHook.get_connection("scaleway_airflow_bucket").login,
        secret=BaseHook.get_connection("scaleway_airflow_bucket").password,
        endpoint_url=BaseHook.get_connection("scaleway_airflow_bucket").extra_dejson.get("endpoint_url"),
        client_kwargs={
            "region_name": BaseHook.get_connection("scaleway_airflow_bucket").extra_dejson.get("region_name")
        },
    )

    postgres_conn_sqlalchemy = providers.Factory(
        create_sql_alchemy_conn,
        url=getenv("AIRFLOW_CONN_DATA_WAREHOUSE"),
    )

    gdal_dw_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    gdal_app_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("APP_DB_NAME"),
        user=getenv("APP_DB_USER"),
        password=getenv("APP_DB_PASSWORD"),
        host=getenv("APP_DB_HOST"),
        port=getenv("APP_DB_PORT"),
    )

    postgres_conn: connection = providers.Factory(
        provides=connect,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    postgres_conn_str_ogr2ogr = providers.Factory(
        db_str_for_ogr2ogr,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    cnopts = pysftp.CnOpts()
    cnopts.hostkeys = None

    gpu_sftp = providers.Factory(
        provides=pysftp.Connection,
        host=getenv("GPU_SFTP_HOST"),
        username=getenv("GPU_SFTP_USER"),
        password=getenv("GPU_SFTP_PASSWORD"),
        port=int(getenv("GPU_SFTP_PORT")),
        default_path="/pub/export-wfs/latest/",
        cnopts=cnopts,
    )
