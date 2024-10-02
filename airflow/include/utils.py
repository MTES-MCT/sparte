import os


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
