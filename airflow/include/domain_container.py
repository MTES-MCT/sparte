from os import getenv

from dependency_injector import containers, providers

from .file_handling import (
    CSVFileIngestor,
    DataGouvHandler,
    HTTPFileHandler,
    RemoteToS3FileHandler,
    S3CSVFileToDBTableHandler,
    S3Handler,
    S3ToDataGouvHandler,
    SQLToCSVOnS3Handler,
    SQLToGeojsonSeqOnS3Handler,
    SQLToGeopackageOnS3Handler,
    TmpPathGenerator,
)
from .infra_container import Container as InfraContainer
from .notification import MattermostNotificationService


class Container(containers.DeclarativeContainer):
    infra_container = providers.Container(container=InfraContainer())

    s3_handler = providers.Factory(provides=S3Handler, s3=infra_container().s3)
    tmp_path_generator = providers.Factory(provides=TmpPathGenerator)

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
            db_sqlalchemy_conn=infra_container().sqlalchemy_dbt_conn,
        ),
    )

    sql_to_geojsonseq_on_s3_handler = providers.Factory(
        provides=SQLToGeojsonSeqOnS3Handler,
        http_file_handler=htto_file_handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=infra_container().gdal_dbt_conn().encode(),
    )

    sql_to_geopackage_on_s3_handler = providers.Factory(
        provides=SQLToGeopackageOnS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=infra_container().gdal_dbt_conn().encode(),
    )

    sql_to_csv_on_s3_handler = providers.Factory(
        provides=SQLToCSVOnS3Handler,
        s3_handler=s3_handler,
        tmp_path_generator=tmp_path_generator,
        db_connection=infra_container().gdal_dbt_conn().encode(),
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
