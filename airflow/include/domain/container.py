from os import getenv

import sqlalchemy
from dependency_injector import containers, providers
from gdaltools import PgConnectionString
from include.domain.file_handling import (
    DataGouvHandler,
    RemoteToS3FileHandler,
    S3CSVFileToDBTableHandler,
    S3ToDataGouvHandler,
    SQLToGeojsonSeqOnS3Handler,
    SQLToGeopackageOnS3Handler,
)
from include.infra.file_handling import (
    CSVFileIngestor,
    HTTPFileHandler,
    S3Handler,
    TmpPathGenerator,
)
from include.infra.notification import MattermostNotificationService
from include.infra.ocsge import JSONOcsgeSourceService
from s3fs import S3FileSystem


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

    s3_handler = providers.Factory(provides=S3Handler, s3=s3)
    tmp_path_generator = providers.Factory(provides=TmpPathGenerator)

    sqlalchemy_dbt_conn = providers.Factory(
        create_sql_alchemy_conn,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    gdal_dbt_conn = providers.Factory(
        PgConnectionString,
        dbname=getenv("DBT_DB_NAME"),
        user=getenv("DBT_DB_USER"),
        password=getenv("DBT_DB_PASSWORD"),
        host=getenv("DBT_DB_HOST"),
        port=getenv("DBT_DB_PORT"),
    )

    htto_file_handler = providers.Factory(provides=HTTPFileHandler)

    remote_to_s3_file_handler = providers.Factory(
        provides=RemoteToS3FileHandler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
    )

    s3_csv_file_to_db_table_handler = providers.Factory(
        provides=S3CSVFileToDBTableHandler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        csv_file_ingestor=providers.Factory(
            provides=CSVFileIngestor,
            db_sqlalchemy_conn=sqlalchemy_dbt_conn,
        ),
    )

    sql_to_geojsonseq_on_s3_handler = providers.Factory(
        provides=SQLToGeojsonSeqOnS3Handler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=gdal_dbt_conn().encode(),
    )

    sql_to_geopackage_on_s3_handler = providers.Factory(
        provides=SQLToGeopackageOnS3Handler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=gdal_dbt_conn().encode(),
    )

    data_gouv = providers.Factory(
        provides=DataGouvHandler,
        key=getenv("DATA_GOUV_API_KEY"),
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
        mattermost_webhook_url=getenv("MATTERMOST_WEBHOOK_URL"),
        channel=getenv("MATTERMOST_CHANNEL"),
    )

    ocsge_source_service = providers.Factory(
        provides=JSONOcsgeSourceService, json_content=open("include/domain/data/ocsge/sources.json").read()
    )
