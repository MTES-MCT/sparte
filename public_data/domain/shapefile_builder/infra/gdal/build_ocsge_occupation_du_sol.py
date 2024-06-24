import subprocess
from pathlib import Path

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

from .is_artif_case import is_artif_case
from .is_impermeable_case import is_impermeable_case
from .utils import multiline_string_to_single_line


def build_ocsge_occupation_du_sol(source: DataSource) -> tuple[DataSource, Path]:
    fields = {
        "couverture": "CODE_CS",
        "usage": "CODE_US",
    }
    if source.mapping:
        fields |= source.mapping

    build_name = source.get_build_name()

    with ShapefileFromSource(source=source) as shapefile_path:
        sql = f"""
            SELECT
                {fields['couverture']} AS CODE_CS,
                {fields['usage']} AS CODE_US,
                ID AS ID,
                GEOMETRY AS MPOLY,
                round(ST_Area(GEOMETRY), 4) AS SURFACE,
                '{source.official_land_id}' AS DPT,
                '{source.millesimes[0]}' AS YEAR,
                '{source.srid}' AS SRID,
                {is_impermeable_case(fields['couverture'])} AS IS_IMPER,
                {is_artif_case(fields['couverture'], fields['usage'])} AS IS_ARTIF
            FROM
                {Path(source.shapefile_name).stem}
        """

        subprocess.run(
            " ".join(
                [
                    "ogr2ogr",
                    "-dialect",
                    "SQLITE",
                    "-f",
                    "'ESRI Shapefile'",
                    f'"{build_name}"',
                    str(shapefile_path.absolute()),
                    "-nlt",
                    "MULTIPOLYGON",
                    "-nlt",
                    "PROMOTE_TO_MULTI",
                    "-nln",
                    source.name,
                    f"-a_srs EPSG:{source.srid}",
                    "-sql",
                    f'"{multiline_string_to_single_line(sql)}"',
                ]
            ),
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
            "path": source.get_build_name(),
            "shapefile_name": source.name + ".shp",
            "srid": source.srid,
        },
    )
    return output_source, Path(build_name)
