import base64
import os
from contextlib import contextmanager

import paramiko
import sqlalchemy
from dependency_injector import containers, providers
from gdaltools import PgConnectionString
from psycopg2 import connect
from psycopg2.extensions import connection
from s3fs import S3FileSystem

from .connectors import Brevo
from .file_handling import (
    CSVFileIngestor,
    DataGouvHandler,
    GeoJsonToGzippedGeoJsonOnS3Handler,
    HTTPFileHandler,
    PaginatedJsonToS3Handler,
    RemoteToS3FileHandler,
    S3CSVFileToDBTableHandler,
    S3GeoJsonFileToDBTableHandler,
    S3Handler,
    S3ToDataGouvHandler,
    SQLToCSVOnS3Handler,
    SQLToGeoJsonOnS3Handler,
    SQLToGeojsonSeqOnS3Handler,
    SQLToGeopackageOnS3Handler,
    TmpPathGenerator,
)
from .notification import MattermostNotificationService


def db_str_for_ogr2ogr(dbname: str, user: str, password: str, host: str, port: int) -> str:
    return f"PG:dbname='{dbname}' host='{host}' port='{port}' user='{user}' password='{password}'"


def create_sql_alchemy_conn(
    dbname: str, user: str, password: str, host: str, port: int
) -> sqlalchemy.engine.base.Connection:
    url = f"postgresql+psycopg2://{user}:{password.replace('@', '%40')}@{host}:{port}/{dbname}"
    return sqlalchemy.create_engine(url)


@contextmanager
def create_gpu_sftp_connection(
    host: str,
    port: int,
    username: str,
    password: str,
    host_key: str,
    default_path: str | None = None,
):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    client.load_system_host_keys()
    client.get_host_keys().add(
        hostname=f"[{host}]:{port}",
        keytype="ssh-ed25519",
        key=paramiko.PKey.from_type_string(key_type="ssh-ed25519", key_bytes=base64.b64decode(host_key)),
    )

    client.connect(
        hostname=host,
        port=port,
        username=username,
        password=password,
        look_for_keys=False,
        allow_agent=False,
        timeout=30,
    )
    sftp = client.open_sftp()
    try:
        if default_path:
            sftp.chdir(default_path)
        yield sftp
    finally:
        try:
            sftp.close()
        finally:
            client.close()


class InfraContainer(containers.DeclarativeContainer):
    bucket_name = providers.Factory(provides=str, object=os.getenv("AIRFLOW_S3_BUCKET_NAME"))
    app_bucket_name = providers.Factory(provides=str, object=os.getenv("AIRFLOW_S3_APP_BUCKET_NAME"))

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

    gpu_sftp = providers.Factory(
        create_gpu_sftp_connection,
        host=os.getenv("GPU_SFTP_HOST"),
        username=os.getenv("GPU_SFTP_USER"),
        password=os.getenv("GPU_SFTP_PASSWORD"),
        port=int(os.getenv("GPU_SFTP_PORT")),
        host_key=os.getenv("GPU_HOST_KEY"),
        default_path="/pub/export-wfs/latest/",
    )

    brevo = providers.Factory(
        provides=Brevo,
        url="https://api.brevo.com/v3",
        api_key=os.getenv("BREVO_API_KEY"),
        env=os.getenv("ENVIRONMENT"),
    )


class DomainContainer(containers.DeclarativeContainer):
    s3_handler = providers.Factory(provides=S3Handler, s3=InfraContainer().s3)
    tmp_path_generator = providers.Factory(provides=TmpPathGenerator)

    htto_file_handler = providers.Factory(provides=HTTPFileHandler)

    remote_to_s3_file_handler = providers.Factory(
        provides=RemoteToS3FileHandler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
    )

    paginated_json_to_s3_handler = providers.Factory(
        provides=PaginatedJsonToS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
    )

    s3_csv_file_to_db_table_handler = providers.Factory(
        provides=S3CSVFileToDBTableHandler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        csv_file_ingestor=providers.Factory(
            provides=CSVFileIngestor,
            db_sqlalchemy_conn=InfraContainer().sqlalchemy_dbt_conn,
        ),
    )

    s3_geojson_file_to_db_table_handler = providers.Factory(
        provides=S3GeoJsonFileToDBTableHandler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=InfraContainer().gdal_dbt_conn().encode(),
    )

    sql_to_geojsonseq_on_s3_handler = providers.Factory(
        provides=SQLToGeojsonSeqOnS3Handler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=InfraContainer().gdal_dbt_conn().encode(),
    )

    sql_to_geojson_on_s3_handler = providers.Factory(
        provides=SQLToGeoJsonOnS3Handler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=InfraContainer().gdal_dbt_conn().encode(),
    )

    geojson_to_gzipped_geojson_on_s3_handler = providers.Factory(
        provides=GeoJsonToGzippedGeoJsonOnS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
    )

    sql_to_geopackage_on_s3_handler = providers.Factory(
        provides=SQLToGeopackageOnS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=InfraContainer().gdal_dbt_conn().encode(),
    )

    sql_to_csv_on_s3_handler = providers.Factory(
        provides=SQLToCSVOnS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=InfraContainer().gdal_dbt_conn().encode(),
    )

    data_gouv = providers.Factory(
        provides=DataGouvHandler,
        key=os.getenv("DATA_GOUV_API_KEY"),
        endpoint="https://www.data.gouv.fr/api/1",
    )

    s3_to_data_gouv = providers.Factory(
        provides=S3ToDataGouvHandler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        data_gouv_handler=data_gouv,
    )

    notification = providers.Factory(
        provides=MattermostNotificationService,
        mattermost_webhook_url=os.getenv("MATTERMOST_WEBHOOK_URL"),
        channel=os.getenv("MATTERMOST_CHANNEL"),
    )
