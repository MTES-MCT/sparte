import subprocess
from pathlib import Path

from django.conf import settings
from django.db import connection

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

from .is_artif_case import is_artif_case


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

    fields = {
        "couverture": "CODE_CS",
        "usage": "CODE_US",
    }

    temp_table = "occupation_sol"
    temp_table_artif = "artif_table"

    db = settings.DATABASES["default"]

    with ShapefileFromSource(source=source) as shapefile_path:
        command_occupation_du_sol = f'ogr2ogr -f "PostgreSQL" -overwrite "PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}" {shapefile_path.absolute()} -nln {temp_table} -a_srs EPSG:{source.srid} -nlt MULTIPOLYGON -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=mpoly -lco PRECISION=NO --config PG_USE_COPY YES'  # noqa: E501
        subprocess.run(args=command_occupation_du_sol, check=True, shell=True)

        sql = f"""
        DROP TABLE IF EXISTS {temp_table_artif};
        CREATE TABLE {temp_table_artif} AS
        WITH ocsge_classified AS ( /* assign is_artificial value to each object */
            SELECT
            *,
            {is_artif_case(
                code_cs=fields['couverture'],
                code_us=fields['usage'],
                true_value='TRUE',
                false_value='FALSE',
            )} AS is_artificial
            FROM
            occupation_sol
        ),
        clustered_ocsge AS ( /* group artificial and non_artficial objects by their proximity  */
            SELECT
                is_artificial,
                ST_UnaryUnion(
                    unnest(
                        ST_ClusterIntersecting(mpoly)
                    )
                ) AS mpoly
            FROM
                ocsge_classified
            GROUP BY
                is_artificial
        ),
        artif_nat_by_surface AS ( /* invert is_articicial value if the surface is inferior to 2500m2 */
            SELECT
                CASE
                    WHEN ST_Area(mpoly) < 2500 THEN NOT is_artificial
                    ELSE is_artificial
                END AS is_artificial,
                mpoly
            FROM
                clustered_ocsge
        ),
        small_built AS ( /* retrieve small built surfaces that are enclaved in natural surfaces */
            SELECT
                is_artificial,
                mpoly
            FROM
                ocsge_classified
            WHERE
                code_cs = 'CS1.1.1.1'
                AND ST_Area(mpoly) < 2500
                AND EXISTS (
                    SELECT
                        mpoly
                    FROM
                        artif_nat_by_surface
                    WHERE
                        ST_Intersects(mpoly, ocsge_classified.mpoly) AND
                        is_artificial = FALSE
                )
        ), artificial_union AS (
            SELECT
                is_artificial,
                mpoly
            FROM
                artif_nat_by_surface
            WHERE
                is_artificial = TRUE
            UNION ALL
            SELECT
                is_artificial,
                mpoly
            FROM
                small_built
        ), artificial_geom_union AS (
            SELECT
                ST_Union(mpoly) AS mpoly,
                is_artificial
            FROM
                artificial_union
            GROUP BY
                is_artificial
        )
        SELECT
            (ST_Dump(mpoly)).geom AS mpoly
        FROM
            artificial_geom_union;
        """

        with connection.cursor() as cursor:
            cursor.execute(sql=sql)
            cursor.connection.commit()

        command = [
            "ogr2ogr",
            "-f",
            '"ESRI Shapefile"',
            f'"{build_name}"',
            f'"PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}"',  # noqa: E501
            "-nlt MULTIPOLYGON",
            "-nlt PROMOTE_TO_MULTI",
            "-nln",
            '"ZONE_ARTIFICIELLE"',
            f"-a_srs EPSG:{source.srid}",
            "-sql",
            f'"SELECT * FROM {temp_table_artif}"',
            "-progress",
        ]
        with open("error.log", "w") as f:
            subprocess.run(args=" ".join(command), shell=True, check=True, stdout=f, stderr=f)

        with connection.cursor() as cursor:
            cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table};")
            cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table_artif};")
