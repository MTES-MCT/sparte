import subprocess
from pathlib import Path

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

from .is_artif_case import is_artif_case
from .utils import multiline_string_to_single_line


def build_ocsge_difference(source: DataSource) -> tuple[DataSource, Path]:
    fields = {
        "cs_new": f"CS_{source.millesimes[1]}",
        "cs_old": f"CS_{source.millesimes[0]}",
        "us_new": f"US_{source.millesimes[1]}",
        "us_old": f"US_{source.millesimes[0]}",
    }
    if source.mapping:
        fields |= source.mapping

    build_name = source.get_build_name()

    with ShapefileFromSource(source=source) as shapefile_path:
        sql = f"""
            SELECT
                YEAR_OLD AS YEAR_OLD,
                YEAR_NEW AS YEAR_NEW,
                CS_NEW AS CS_NEW,
                CS_OLD AS CS_OLD,
                US_NEW AS US_NEW,
                US_OLD AS US_OLD,
                SRID AS SRID,
                SURFACE AS SURFACE,
                DPT AS DPT,
                GEOMETRY,
                CASE
                    WHEN OLD_IS_ARTIF = 0 AND NEW_IS_ARTIF = 1 THEN 1
                    ELSE 0
                END AS NEW_ARTIF,
                CASE
                    WHEN OLD_IS_ARTIF = 1 AND NEW_IS_ARTIF = 0 THEN 1
                    ELSE 0
                END AS NEW_NAT
            FROM (
                SELECT
                    '{source.millesimes[0]}' AS YEAR_OLD,
                    '{source.millesimes[1]}' AS YEAR_NEW,
                    {fields['cs_new']} AS CS_NEW,
                    {fields['cs_old']} AS CS_OLD,
                    {fields['us_new']} AS US_NEW,
                    {fields['us_old']} AS US_OLD,
                    '{source.srid}' AS SRID,
                    round(ST_Area(GEOMETRY), 4) AS SURFACE,
                    {is_artif_case(fields['cs_old'], fields['us_old'])} AS OLD_IS_ARTIF,
                    {is_artif_case(fields['cs_new'], fields['us_new'])} AS NEW_IS_ARTIF,
                    '{source.official_land_id}' AS DPT,
                    GEOMETRY
                FROM
                    {Path(source.shapefile_name).stem}
                WHERE
                    {fields['cs_new']} IS NOT NULL AND
                    {fields['cs_old']} IS NOT NULL AND
                    {fields['us_new']} IS NOT NULL AND
                    {fields['us_old']} IS NOT NULL
            )
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

        subprocess.run(
            args=" ".join(command),
            shell=True,
            check=True,
        )

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
