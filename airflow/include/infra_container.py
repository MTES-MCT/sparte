import os

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
        key=os.getenv("AIRFLOW_S3_LOGIN"),
        secret=os.getenv("AIRFLOW_S3_PASSWORD"),
        endpoint_url=os.getenv("AIRFLOW_S3_ENDPOINT"),
        client_kwargs={
            "region_name": os.getenv("AIRFLOW_S3_REGION_NAME"),
        },
    )
    # DBT connections
    gdal_dbt_conn = providers.Factory(
        PgConnectionString,
        dbname=os.getenv("DBT_DB_NAME"),
        user=os.getenv("DBT_DB_USER"),
        password=os.getenv("DBT_DB_PASSWORD"),
        host=os.getenv("DBT_DB_HOST"),
        port=os.getenv("DBT_DB_PORT"),
    )
    psycopg2_dbt_conn: connection = providers.Factory(
        provides=connect,
        dbname=os.getenv("DBT_DB_NAME"),
        user=os.getenv("DBT_DB_USER"),
        password=os.getenv("DBT_DB_PASSWORD"),
        host=os.getenv("DBT_DB_HOST"),
        port=os.getenv("DBT_DB_PORT"),
    )

    sqlalchemy_dbt_conn = providers.Factory(
        create_sql_alchemy_conn,
        dbname=os.getenv("DBT_DB_NAME"),
        user=os.getenv("DBT_DB_USER"),
        password=os.getenv("DBT_DB_PASSWORD"),
        host=os.getenv("DBT_DB_HOST"),
        port=os.getenv("DBT_DB_PORT"),
    )

    # Matomo connections
    gdal_matomo_conn = providers.Factory(
        PgConnectionString,
        dbname=os.getenv("MATOMO_DB_NAME"),
        user=os.getenv("MATOMO_DB_USER"),
        password=os.getenv("MATOMO_DB_PASSWORD"),
        host=os.getenv("MATOMO_DB_HOST"),
        port=os.getenv("MATOMO_DB_PORT"),
    )
    psycopg2_matomo_conn = providers.Factory(
        provides=connect,
        dbname=os.getenv("MATOMO_DB_NAME"),
        user=os.getenv("MATOMO_DB_USER"),
        password=os.getenv("MATOMO_DB_PASSWORD"),
        host=os.getenv("MATOMO_DB_HOST"),
        port=os.getenv("MATOMO_DB_PORT"),
    )

    # DEV connections
    gdal_dev_conn = providers.Factory(
        PgConnectionString,
        dbname=os.getenv("DEV_DB_NAME"),
        user=os.getenv("DEV_DB_USER"),
        password=os.getenv("DEV_DB_PASSWORD"),
        host=os.getenv("DEV_DB_HOST"),
        port=os.getenv("DEV_DB_PORT"),
    )
    psycopg2_dev_conn = providers.Factory(
        provides=connect,
        dbname=os.getenv("DEV_DB_NAME"),
        user=os.getenv("DEV_DB_USER"),
        password=os.getenv("DEV_DB_PASSWORD"),
        host=os.getenv("DEV_DB_HOST"),
        port=os.getenv("DEV_DB_PORT"),
    )

    # PROD connections
    gdal_prod_conn = providers.Factory(
        PgConnectionString,
        dbname=os.getenv("PROD_DB_NAME"),
        user=os.getenv("PROD_DB_USER"),
        password=os.getenv("PROD_DB_PASSWORD"),
        host=os.getenv("PROD_DB_HOST"),
        port=os.getenv("PROD_DB_PORT"),
    )
    psycopg2_prod_conn = providers.Factory(
        provides=connect,
        dbname=os.getenv("PROD_DB_NAME"),
        user=os.getenv("PROD_DB_USER"),
        password=os.getenv("PROD_DB_PASSWORD"),
        host=os.getenv("PROD_DB_HOST"),
        port=os.getenv("PROD_DB_PORT"),
    )

    # STAGING connections
    gdal_staging_conn = providers.Factory(
        PgConnectionString,
        dbname=os.getenv("STAGING_DB_NAME"),
        user=os.getenv("STAGING_DB_USER"),
        password=os.getenv("STAGING_DB_PASSWORD"),
        host=os.getenv("STAGING_DB_HOST"),
        port=os.getenv("STAGING_DB_PORT"),
    )
    psycopg2_staging_conn = providers.Factory(
        provides=connect,
        dbname=os.getenv("STAGING_DB_NAME"),
        user=os.getenv("STAGING_DB_USER"),
        password=os.getenv("STAGING_DB_PASSWORD"),
        host=os.getenv("STAGING_DB_HOST"),
        port=os.getenv("STAGING_DB_PORT"),
    )

    cnopts = pysftp.CnOpts()
    cnopts.hostkeys = None

    gpu_sftp = providers.Factory(
        provides=pysftp.Connection,
        host=os.getenv("GPU_SFTP_HOST"),
        username=os.getenv("GPU_SFTP_USER"),
        password=os.getenv("GPU_SFTP_PASSWORD"),
        port=int(os.getenv("GPU_SFTP_PORT")),
        default_path="/pub/export-wfs/latest/",
        cnopts=cnopts,
    )
