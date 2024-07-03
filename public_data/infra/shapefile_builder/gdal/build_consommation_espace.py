import subprocess
from pathlib import Path

from public_data.models import Cerema, DataSource
from public_data.models.enums import SRID
from public_data.shapefile import ShapefileFromSource

from .utils import multiline_string_to_single_line


def build_consommation_espace(source: DataSource) -> tuple[DataSource, Path]:
    build_name = source.get_build_name()

    with ShapefileFromSource(source=source) as shapefile_path:
        art_fields_11_21 = Cerema.get_art_field(
            start=2011,
            end=2020,
        )
        habitat_fields_11_21 = [field.replace("art", "hab").replace("naf", "art") for field in art_fields_11_21]
        activity_fields_11_21 = [field.replace("art", "act").replace("naf", "art") for field in art_fields_11_21]

        sql = f"""
            SELECT
                *,
                '{source.srid}' AS SRID,
                CAST(({' + '.join(art_fields_11_21)}) AS FLOAT) AS NAF11ART21,
                CAST(({' + '.join(habitat_fields_11_21)}) AS FLOAT) AS ART11HAB21,
                CAST(({' + '.join(activity_fields_11_21)}) AS FLOAT) AS ART11ACT21,
                {"artcom0923" if source.srid == SRID.LAMBERT_93 else "NULL"} AS ARTCOM0923,
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

        with open("output.txt", "w") as f:
            subprocess.run(
                args=" ".join(command),
                shell=True,
                check=True,
                stdout=f,
                stderr=f,
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
