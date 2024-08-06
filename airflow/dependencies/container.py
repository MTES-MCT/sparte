from os import getenv

from airflow.hooks.base import BaseHook
from dependency_injector import containers, providers
from psycopg2 import connect
from psycopg2.extensions import connection
from s3fs import S3FileSystem


def db_str_for_ogr2ogr(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"PG:dbname='{dbname}' host='{host}' port='{port}' user='{user}' password='{password}'"


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
