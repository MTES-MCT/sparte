from include.container import DomainContainer

from airflow.exceptions import AirflowSkipException


def geojson_to_pmtiles_on_s3(
    s3_bucket: str, vector_tiles_dir: str, geojson_filename: str, pmtiles_filename: str
) -> str:
    """
    Convertit un GeoJSON de S3 en PMTiles sur S3. La tâche est marquée skipped si
    tippecanoe n'a pas assez de données pour générer des tuiles.
    """
    path_on_s3 = (
        DomainContainer()
        .geojson_on_s3_to_pmtiles_on_s3_handler()
        .convert_geojson_to_pmtiles_on_s3(
            s3_bucket=s3_bucket,
            s3_geojson_key=f"{vector_tiles_dir}/{geojson_filename}",
            s3_pmtiles_key=f"{vector_tiles_dir}/{pmtiles_filename}",
        )
    )
    if path_on_s3 is None:
        raise AirflowSkipException("Pas assez de données pour générer des tuiles")
    return path_on_s3
