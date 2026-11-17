import json

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


def get_zoom_bounds(zooms_by_resolution: dict[int, tuple[int, int]]) -> tuple[int, int]:
    """
    Retourne le premier et le dernier zoom d'un fichier de tuiles multi-résolution, d'après la
    plage de zooms (premier, dernier) servie par chaque résolution.

    Lève ValueError si un zoom intermédiaire n'est servi par aucune résolution (la carte y
    serait vide) ou l'est par plusieurs (les blocs s'y superposeraient).
    """
    zooms = sorted(
        zoom for first_zoom, last_zoom in zooms_by_resolution.values() for zoom in range(first_zoom, last_zoom + 1)
    )
    if not zooms:
        raise ValueError("Aucune plage de zooms n'est définie")
    if zooms != list(range(zooms[0], zooms[-1] + 1)):
        raise ValueError(f"Chaque zoom doit être servi par une seule résolution, zooms obtenus : {zooms}")
    return zooms[0], zooms[-1]


def get_resolution_by_zoom_filter(resolution_attribute: str, zooms_by_resolution: dict[int, tuple[int, int]]) -> str:
    """
    Retourne le filtre tippecanoe (`--feature-filter`) qui ne garde, dans les tuiles de
    chaque zoom, que les entités de la résolution prévue, lue dans `resolution_attribute`.

    Il sert aux modèles dbt qui empilent toutes les résolutions d'une même grille : un seul
    export et un seul passage de tippecanoe suffisent, sans fusion de fichiers. `$zoom` est le
    zoom de la tuile écrite.
    """
    return json.dumps(
        {
            "*": [
                "any",
                *(
                    [
                        "all",
                        ["==", resolution_attribute, resolution],
                        [">=", "$zoom", first_zoom],
                        ["<=", "$zoom", last_zoom],
                    ]
                    for resolution, (first_zoom, last_zoom) in zooms_by_resolution.items()
                ),
            ]
        },
        separators=(",", ":"),
    )
