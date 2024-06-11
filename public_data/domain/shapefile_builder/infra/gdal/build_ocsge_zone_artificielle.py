import subprocess
from logging import getLogger
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import connection

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

from .is_artif_case import is_artif_case

logger = getLogger(__name__)


def build_ocsge_zone_artificielle(source: DataSource) -> tuple[DataSource, Path]:
    # build name will look like this : OCSGE_ZONE_ARTIFICIELLE_94_2018_MDA.shp.zip
    logger.info(f"Building {source}")
    unique_string = "_".join(
        [
            source.dataset,
            DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
            source.official_land_id,
            str(source.millesimes[0]),
            DataSource.ProductorChoices.MDA,
        ]
    )

    build_name = unique_string + ".shp.zip"

    fields = {
        "couverture": "CODE_CS",
        "usage": "CODE_US",
    }

    temp_table_occupation_du_sol = f"temp_{uuid4().hex}"
    temp_table_artif = f"temp_{uuid4().hex}"

    db = settings.DATABASES["default"]

    with ShapefileFromSource(source=source) as shapefile_path:
        command_occupation_du_sol = f'ogr2ogr -f "PostgreSQL" -overwrite "PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}" {shapefile_path.absolute()} -nln {temp_table_occupation_du_sol} -a_srs EPSG:{source.srid} -nlt MULTIPOLYGON -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=mpoly -lco PRECISION=NO --config PG_USE_COPY YES'  # noqa: E501

        with open("error.log", "w") as f:
            subprocess.run(args=command_occupation_du_sol, check=True, shell=True, stdout=f, stderr=f)

        sql = f"""
        DROP TABLE IF EXISTS ocsge_classified;
        DROP TABLE IF EXISTS clustered_ocsge;
        DROP TABLE IF EXISTS artif_nat_by_surface;
        DROP TABLE IF EXISTS small_built;
        DROP TABLE IF EXISTS artificial_union;
        DROP TABLE IF EXISTS artificial_geom_union;
        DROP TABLE IF EXISTS artificial_geom_union_dump;
        CREATE TEMPORARY TABLE ocsge_classified AS
            SELECT
            *,
            {is_artif_case(
                code_cs=fields['couverture'],
                code_us=fields['usage'],
                true_value='TRUE',
                false_value='FALSE',
            )} AS is_artificial
            FROM
            {temp_table_occupation_du_sol};
        CREATE INDEX ON ocsge_classified USING GIST (mpoly);
        CREATE TEMPORARY TABLE clustered_ocsge AS
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
                is_artificial;
        CREATE INDEX ON clustered_ocsge USING GIST (mpoly);
        CREATE TEMPORARY TABLE artif_nat_by_surface AS
            SELECT
                CASE
                    WHEN ST_Area(mpoly) < 2500 THEN NOT is_artificial
                    ELSE is_artificial
                END AS is_artificial,
                mpoly
            FROM
                clustered_ocsge;
        CREATE TEMPORARY TABLE small_built AS
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
                );
        CREATE TEMPORARY TABLE artificial_union AS
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
                small_built;
        CREATE TEMPORARY TABLE artificial_geom_union AS
            SELECT
                ST_Union(mpoly) AS mpoly,
                is_artificial
            FROM
                artificial_union
            GROUP BY
                is_artificial;
        CREATE TEMPORARY TABLE artificial_geom_union_dump AS
            SELECT
                (ST_Dump(mpoly)).geom AS MPOLY,
                {source.millesimes[0]} AS YEAR,
                {source.official_land_id} AS DPT,
                {source.srid} as SRID

            FROM
                artificial_geom_union;
        CREATE INDEX ON artificial_geom_union_dump USING GIST (MPOLY);
        CREATE TABLE {temp_table_artif} AS
        SELECT
            *,
            ST_Area(MPOLY) AS SURFACE
        FROM
            artificial_geom_union_dump;
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
            f'"{DataSource.DataNameChoices.ZONE_ARTIFICIELLE}"',
            f"-a_srs EPSG:{source.srid}",
            "-sql",
            f'"SELECT * FROM {temp_table_artif}"',
            "-progress",
        ]
        with open("error.log", "w") as f:
            subprocess.run(args=" ".join(command), shell=True, check=True, stdout=f, stderr=f)

        with connection.cursor() as cursor:
            cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table_occupation_du_sol};")

        with connection.cursor() as cursor:
            cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table_artif};")

        output_source, _ = DataSource.objects.update_or_create(
            productor=source.ProductorChoices.MDA,
            dataset=source.dataset,
            name=DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
            millesimes=source.millesimes,
            official_land_id=source.official_land_id,
            defaults={
                "mapping": None,
                "path": build_name,
                "shapefile_name": f"{DataSource.DataNameChoices.ZONE_ARTIFICIELLE}.shp",
                "srid": source.srid,
            },
        )
    return output_source, Path(build_name)
