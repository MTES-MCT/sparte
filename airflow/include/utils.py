import os
import subprocess
from logging import getLogger

import geopandas as gpd

logger = getLogger(__name__)


def run_command(cmd: list[str]) -> None:
    """
    Exécute une commande shell (typiquement ogr2ogr) et lève RuntimeError si elle échoue.

    À utiliser pour toute commande qui embarque un secret, comme le DSN PostgreSQL
    passé à ogr2ogr : la commande n'apparaît jamais dans les logs Airflow, alors que
    BashOperator la logue telle quelle à chaque exécution, et que subprocess.run avec
    check=True la place dans le message de CalledProcessError en cas d'échec.
    """
    result = subprocess.run(" ".join(cmd), shell=True, capture_output=True, text=True)
    logger.info(result.stdout)
    if result.returncode != 0:
        logger.error(result.stderr)
        raise RuntimeError(f"{cmd[0]} a échoué (code {result.returncode})")


def get_shapefile_or_geopackage_first_layer_name(path: str) -> str:
    cmd = f"ogrinfo {path}"
    output = subprocess.check_output(cmd, shell=True).decode("utf-8")
    lines = output.split("\n")

    for line in lines:
        if line.startswith("1:"):
            return line.split("1: ")[1].split(" (")[0]

    raise ValueError(f"Could not find layer name in {path}")


def remove_extension_from_layer_name(path: str, current_layer_name: str) -> str:
    futur_layer_name = current_layer_name.split(".")[0]
    cmd = f"ogrinfo {path} -sql 'ALTER TABLE {current_layer_name} RENAME TO {futur_layer_name}'"
    subprocess.run(cmd, shell=True)
    return futur_layer_name


def get_geom_field_name(path: str, layer_name: str):
    if path.endswith(".shp"):
        return "GEOMETRY"

    cmd = f"ogrinfo -so {path} {layer_name}"
    output = subprocess.check_output(cmd, shell=True).decode("utf-8")
    lines = output.split("\n")

    for line in lines:
        if line.startswith("Geometry Column"):
            return line.split("= ")[1]

    raise ValueError(f"Could not find geometry column in {path} {layer_name}")


def get_shapefile_or_geopackage_fields(path: str) -> list[str]:
    df = gpd.read_file(path)
    return df.columns.to_list()


def multiline_string_to_single_line(string: str) -> str:
    return string.replace("\n", " ").replace("\r", "")


def get_first_shapefile_path_in_dir(dir_path: str) -> str | None:
    """
    Walk through a directory and return the first shapefile path found.
    Raises a ValueError if multiple shapefiles are found.
    """

    shapefile_paths = []

    for dirpath, _, filenames in os.walk(dir_path):
        for filename in filenames:
            if filename.endswith(".shp"):
                shapefile_paths.append(os.path.abspath(os.path.join(dirpath, filename)))

    if len(shapefile_paths) > 1:
        raise ValueError(f"Multiple shapefiles found in {dir_path}")

    if shapefile_paths:
        return shapefile_paths[0]

    return None


def get_dbt_command_from_directory(
    cmd: str,
    directory="${AIRFLOW_HOME}/include/sql/sparte",
) -> str:
    return f'cd "{directory}" && ' + cmd
