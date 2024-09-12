from os import getenv
from urllib.parse import quote_plus

import pysftp
from airflow.hooks.base import BaseHook
from dependency_injector import containers, providers
from gdaltools import PgConnectionString
from psycopg2 import connect
from psycopg2.extensions import connection
from s3fs import S3FileSystem

from .mattermost import Mattermost
from .scalingo import ScalingoClient


def db_str_for_ogr2ogr(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"PG:dbname='{dbname}' host='{host}' port='{port}' user='{user}' password='{password}'"


def db_str_url(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"


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
    dbt_conn_url = providers.Factory(
        db_str_url,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=quote_plus(getenv("DBT_DB_PASSWORD")),
        host=getenv("DBT_DB_HOST"),
        port=int(getenv("DBT_DB_PORT")),
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

    mattermost = providers.Factory(
        Mattermost,
        mattermost_webhook_url=getenv("MATTERMOST_WEBHOOK_URL"),
        channel=getenv("MATTERMOST_CHANNEL"),
    )

    scalingo = providers.Factory(
        ScalingoClient,
        api_token=getenv("SCALINGO_API_TOKEN"),
        app_name=getenv("SCALINGO_APP_NAME"),
        addon_id=getenv("SCALINGO_ADDON_ID"),
        backup_dir=getenv("SCALINGO_BACKUP_DIR"),
        scalingo_subdomain=getenv("SCALINGO_SUBDOMAIN"),
        scalingo_subdomain_db=getenv("SCALINGO_SUBDOMAIN_DB"),
    )
