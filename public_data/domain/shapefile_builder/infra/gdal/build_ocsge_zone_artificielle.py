import subprocess
from pathlib import Path

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

from .utils import multiline_string_to_single_line


def build_ocsge_zone_artificielle(source: DataSource) -> tuple[DataSource, Path]:
    build_name = (
        "_".join(
            [
                source.dataset,
                DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
                source.official_land_id,
                str(source.millesimes[0]),
                DataSource.ProductorChoices.MDA,
            ]
        )
        + ".shp.zip"
    )

    with ShapefileFromSource(source=source) as shapefile_path:
        sql = f"""
            SELECT
                'NO_ID' AS ID,
                '{source.millesimes[0]}' AS YEAR,
                '{source.millesimes[0]}' AS MILLESIME,
                '{source.srid}' AS SRID,
                '{source.official_land_id}' AS DPT,
                round(ST_Area(GEOMETRY), 4) AS SURFACE,
                GEOMETRY AS MPOLY
            FROM
                {Path(source.shapefile_name).stem}
        """
        command = [
            "ogr2ogr",
            "-dialect SQLITE",
            '-f "ESRI Shapefile"',
            f'"{build_name}"',
            str(shapefile_path.absolute()),
            "-nlt MULTIPOLYGON",
            "-nlt PROMOTE_TO_MULTI",
            f"-nln {source.name}",
            f"-a_srs EPSG:{source.srid}",
            "-sql",
            f'"{multiline_string_to_single_line(sql)}"',
        ]
        subprocess.run(args=" ".join(command), shell=True, check=True)

    output_source, _ = DataSource.objects.update_or_create(
        productor=source.ProductorChoices.MDA,
        dataset=source.dataset,
        name=source.name,
        millesimes=source.millesimes,
        official_land_id=source.official_land_id,
        defaults={
            "mapping": None,
            "path": build_name,
            "shapefile_name": source.name + ".shp",
            "srid": source.srid,
        },
    )
    return output_source, Path(build_name)
