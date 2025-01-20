from base64 import decodebytes
from os import getenv

import paramiko
import pysftp
import sqlalchemy
from dependency_injector import containers, providers
from gdaltools import PgConnectionString
from psycopg2 import connect
from psycopg2.extensions import connection
from s3fs import S3FileSystem


def db_str_for_ogr2ogr(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"PG:dbname='{dbname}' host='{host}' port='{port}' user='{user}' password='{password}'"


def create_sql_alchemy_conn(
    dbname: str, user: str, password: str, host: str, port: int
) -> sqlalchemy.engine.base.Connection:
    url = f"postgresql+psycopg2://{user}:{password.replace('@', '%40')}@{host}:{port}/{dbname}"
    return sqlalchemy.create_engine(url)


class Container(containers.DeclarativeContainer):
    s3 = providers.Factory(
        provides=S3FileSystem,
        key=getenv("AIRFLOW_S3_LOGIN"),
        secret=getenv("AIRFLOW_S3_PASSWORD"),
        endpoint_url=getenv("AIRFLOW_S3_ENDPOINT"),
        client_kwargs={
            "region_name": getenv("AIRFLOW_S3_REGION_NAME"),
        },
    )
    # DBT connections
    gdal_dbt_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )
    psycopg2_dbt_conn: connection = providers.Factory(
        provides=connect,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    sqlalchemy_dbt_conn = providers.Factory(
        create_sql_alchemy_conn,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    # DEV connections
    gdal_dev_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("DEV_DB_NAME"),
        user=getenv("DEV_DB_USER"),
        password=getenv("DEV_DB_PASSWORD"),
        host=getenv("DEV_DB_HOST"),
        port=getenv("DEV_DB_PORT"),
    )
    psycopg2_dev_conn = providers.Factory(
        provides=connect,
        dbname=getenv("DEV_DB_NAME"),
        user=getenv("DEV_DB_USER"),
        password=getenv("DEV_DB_PASSWORD"),
        host=getenv("DEV_DB_HOST"),
        port=getenv("DEV_DB_PORT"),
    )

    # PROD connections
    gdal_prod_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("PROD_DB_NAME"),
        user=getenv("PROD_DB_USER"),
        password=getenv("PROD_DB_PASSWORD"),
        host=getenv("PROD_DB_HOST"),
        port=getenv("PROD_DB_PORT"),
    )
    psycopg2_prod_conn = providers.Factory(
        provides=connect,
        dbname=getenv("PROD_DB_NAME"),
        user=getenv("PROD_DB_USER"),
        password=getenv("PROD_DB_PASSWORD"),
        host=getenv("PROD_DB_HOST"),
        port=getenv("PROD_DB_PORT"),
    )

    # STAGING connections
    gdal_staging_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("STAGING_DB_NAME"),
        user=getenv("STAGING_DB_USER"),
        password=getenv("STAGING_DB_PASSWORD"),
        host=getenv("STAGING_DB_HOST"),
        port=getenv("STAGING_DB_PORT"),
    )
    psycopg2_staging_conn = providers.Factory(
        provides=connect,
        dbname=getenv("STAGING_DB_NAME"),
        user=getenv("STAGING_DB_USER"),
        password=getenv("STAGING_DB_PASSWORD"),
        host=getenv("STAGING_DB_HOST"),
        port=getenv("STAGING_DB_PORT"),
    )

    cnopts = pysftp.CnOpts()
    cnopts.hostkeys.add(
        hostname=getenv("GPU_SFTP_HOST"),
        keytype="ssh-rsa",
        key=paramiko.RSAKey(data=decodebytes(getenv("GPU_HOST_KEY").encode())),
    )

    gpu_sftp = providers.Factory(
        provides=pysftp.Connection,
        host=getenv("GPU_SFTP_HOST"),
        username=getenv("GPU_SFTP_USER"),
        password=getenv("GPU_SFTP_PASSWORD"),
        port=int(getenv("GPU_SFTP_PORT")),
        default_path="/pub/export-wfs/latest/",
        cnopts=cnopts,
    )
