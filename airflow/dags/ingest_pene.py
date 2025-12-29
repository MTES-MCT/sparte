from include.container import DomainContainer as Container
from include.container import InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

COMMUNE_CONCERNEES_PENE = "https://cartagene.cerema.fr/server/rest/services/Hosted/Commune_concernee_par_un_PENE/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&timeReferenceUnknownClient=false&sqlFormat=none&resultType=&datumTransformation=&lodType=geohash&lod=&lodSR=&f=geojson"  # noqa: E501
PENE_CONTOURS = "https://cartagene.cerema.fr/server/rest/services/Hosted/PENE_contour/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&timeReferenceUnknownClient=false&sqlFormat=none&resultType=&datumTransformation=&lodType=geohash&lod=&lodSR=&f=geojson"  # noqa: E501

COMMUNE_CONCERNEE_TABLE_NAME = "pene_commune_concernee"
PENE_CONTOURS_TABLE_NAME = "pene_contours"
COMMUNE_CONCERNEE_FILENAME = "pene_commune_concernee.geojson"
PENE_CONTOURS_FILENAME = "pene_contours.geojson"


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["CEREMA", "PENE"],
)
def ingest_pene():
    bucket_name = InfraContainer().bucket_name()

    @task.python
    def download_commune_concernee() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=COMMUNE_CONCERNEES_PENE,
                s3_key=COMMUNE_CONCERNEE_FILENAME,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_commune_concernee() -> None:
        return (
            Container()
            .s3_geojson_file_to_db_table_handler()
            .ingest_s3_geojson_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=COMMUNE_CONCERNEE_FILENAME,
                table_name=COMMUNE_CONCERNEE_TABLE_NAME,
                geometry_type="MULTIPOLYGON",
            )
        )

    @task.python
    def download_pene_contours() -> str:
        return (
            Container()
            .remote_to_s3_file_handler()
            .download_http_file_and_upload_to_s3(
                url=PENE_CONTOURS,
                s3_key=PENE_CONTOURS_FILENAME,
                s3_bucket=bucket_name,
            )
        )

    @task.python
    def ingest_pene_contours() -> None:
        return (
            Container()
            .s3_geojson_file_to_db_table_handler()
            .ingest_s3_geojson_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=PENE_CONTOURS_FILENAME,
                table_name=PENE_CONTOURS_TABLE_NAME,
                geometry_type="MULTIPOLYGON",
            )
        )

    download_commune_concernee() >> ingest_commune_concernee()
    download_pene_contours() >> ingest_pene_contours()


ingest_pene()
