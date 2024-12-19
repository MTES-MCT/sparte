from os import getenv

import sqlalchemy
from dependency_injector import containers, providers
from include.domain.file_handling import (
    RemoteToS3FileHandler,
    S3CSVFileToDBTableHandler,
)
from include.infra.file_handling import (
    CSVFileIngestor,
    HTTPFileHandler,
    S3Handler,
    TmpPathGenerator,
)
from include.infra.notification import MattermostNotificationService
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

    remote_to_s3_file_handler = providers.Factory(
        provides=RemoteToS3FileHandler,
        http_file_handler=providers.Factory(provides=HTTPFileHandler),
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

    notification = providers.Factory(
        provides=MattermostNotificationService,
        mattermost_webhook_url=getenv("MATTERMOST_WEBHOOK_URL"),
        channel=getenv("MATTERMOST_CHANNEL"),
    )