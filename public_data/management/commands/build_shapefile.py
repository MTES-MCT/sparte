import subprocess
from concurrent.futures import ProcessPoolExecutor
from logging import getLogger
from pathlib import Path
from typing import Any

from django import setup as django_setup
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection

from public_data.models import Cerema, DataSource
from public_data.models.enums import SRID
from public_data.shapefile import ShapefileFromSource
from public_data.storages import DataStorage

logger = getLogger("management.commands")


def multiline_string_to_single_line(string: str) -> str:
    return string.replace("\n", " ").replace("\r", "")


def upload_file_to_s3(path: Path):
    logger.info(f"Uploading {path.name} to S3")

    with open(path, "b+r") as f:
        storage = DataStorage()
        storage.save(path.name, f)

    logger.info(f"Uploaded {path.name} to S3")


def is_artif_case(code_cs: str, code_us: str) -> str:
    return f""" CASE
        /* CS 1.1 */
        WHEN {code_cs} = 'CS1.1.1.1' THEN 1
        WHEN {code_cs} = 'CS1.1.1.2' THEN 1
        WHEN {code_cs} = 'CS1.1.2.1' AND {code_us} != 'US1.3' THEN 1
        WHEN {code_cs} = 'CS1.1.2.2' THEN 1

        /* CS 2.2 */
            /* CS 2.2.1 */
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US2' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US3' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US5' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US235' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.1' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.2' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.3' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.4' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.5' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.2' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.3' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US6.1' THEN 1
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US6.2' THEN 1

            /* CS 2.2.2 */
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US2' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US3' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US5' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US235' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.1' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.2' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.3' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.4' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.5' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.2' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.3' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US6.1' THEN 1
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US6.2' THEN 1
        ELSE 0
    END"""


def build_ocsge_difference(
    source: DataSource,
) -> tuple[DataSource, Path]:
    """
    Creates a new shapefile with the difference between two OCSGE.
    Based on the diff shapefile from IGN.

    Output fields:
    - YEAR_OLD: Year of the old OCSGE
    - YEAR_NEW: Year of the new OCSGE
    - CS_NEW: Code of the new coverage
    - CS_OLD: Code of the old coverage
    - US_NEW: Code of the new usage
    - US_OLD: Code of the old usage
    - SRID: SRID of the shapefile
    - SURFACE: Surface of the polygon in square meters
    - DPT: Departement code
    - GEOMETRY: Geometry of the polygon
    - NEW_ARTIF: 1 if the new coverage is artificial and the old one is not
    - NEW_NAT: 1 if the new coverage is natural and the old one is not
    """

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


def build_ocsge_zone_construite(
    source: DataSource,
) -> tuple[DataSource, Path]:
    """
    Creates a new shapefile with the zone construite from OCSGE.
    Based on the zone construite shapefile from IGN.

    Expected output fields:
    - ID: ID of the polygon. TODO: remove this field as it is not used
    - YEAR: Year of the OCSGE
    - MILLESIME: Millesime of the OCSGE. This field is duplicated with YEAR. TODO: remove this field
    - SRID: SRID of the shapefile
    - DPT: Departement code
    - SURFACE: Surface of the polygon in square meters
    - MPOLY: Geometry of the polygon
    """

    build_name = source.get_build_name()

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


def build_ocsge_occupation_du_sol(
    source: DataSource,
) -> tuple[DataSource, Path]:
    """
    Creates a new shapefile with the occupation du sol from OCSGE.
    Based on the occupation du sol shapefile from IGN.

    Output fields:
    - CODE_CS: Code of the coverage
    - CODE_US: Code of the usage
    - ID: ID of the polygon.
    - GEOMETRY: Geometry of the polygon TODO: renamme MPOLY
    - SURFACE: Surface of the polygon in square meters
    - DPT: Departement code
    - YEAR: Year of the OCSGE
    - SRID: SRID of the shapefile
    - IS_ARTIF: 1 if the coverage is artificial
    """

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


def build_artficial_area(
    occupation_du_sol_source: DataSource,
    occupation_du_sol_shapefile_path: Path,
) -> tuple[DataSource, Path]:
    cerema_source = DataSource.objects.get(
        productor=DataSource.ProductorChoices.MDA,
        dataset=DataSource.DatasetChoices.MAJIC,
        name=DataSource.DataNameChoices.CONSOMMATION_ESPACE,
        srid=occupation_du_sol_source.srid,
    )
    with ShapefileFromSource(source=cerema_source) as majic_shapefile_path:
        build_name = (
            "_".join(
                [
                    occupation_du_sol_source.dataset,
                    DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
                    occupation_du_sol_source.official_land_id,
                    str(occupation_du_sol_source.millesimes[0]),
                    DataSource.ProductorChoices.MDA,
                ]
            )
            + ".shp.zip"
        )
        temp_table_occupation_du_sol = f"temp_occupation_du_sol_{occupation_du_sol_source.official_land_id}_{occupation_du_sol_source.millesimes[0]}"  # noqa: E501
        temp_table_majic = (
            f"temp_majic_{occupation_du_sol_source.official_land_id}_{occupation_du_sol_source.millesimes[0]}"
        )

        db = settings.DATABASES["default"]

        command_occupation_du_sol = f'ogr2ogr -f "PostgreSQL" -overwrite "PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}" {occupation_du_sol_shapefile_path.absolute()} -nln {temp_table_occupation_du_sol} -a_srs EPSG:{occupation_du_sol_source.srid} -nlt MULTIPOLYGON -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=mpoly -lco PRECISION=NO --config PG_USE_COPY YES'  # noqa: E501
        command_majic = f'ogr2ogr -f "PostgreSQL" -overwrite "PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}" {majic_shapefile_path.absolute()} -nln {temp_table_majic} -a_srs EPSG:{cerema_source.srid} -nlt MULTIPOLYGON -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=mpoly -lco PRECISION=NO --config PG_USE_COPY YES'  # noqa: E501

        subprocess.run(args=command_occupation_du_sol, check=True, shell=True)
        subprocess.run(args=command_majic, check=True, shell=True)

        sql = f"""
        SELECT *, ST_Area(mpoly) AS SURFACE FROM (
            SELECT
                '{occupation_du_sol_source.srid}' AS SRID,
                '{occupation_du_sol_source.millesimes[0]}' AS YEAR,
                '{occupation_du_sol_source.official_land_id}' AS DPT,
                idcom AS CITY,
                ST_Multi(
                    ST_CollectionExtract(
                        ST_Union(
                            ST_Intersection(
                                artif.mpoly,
                                majic.mpoly
                            )
                        )
                    , 3)
                ) as mpoly
            FROM
                {temp_table_majic} AS majic
                LEFT JOIN {temp_table_occupation_du_sol} AS artif ON
                ST_Intersects(majic.mpoly, artif.mpoly)
            WHERE
                iddep = '{occupation_du_sol_source.official_land_id}' AND
                IS_ARTIF = 1
            GROUP BY idcom, majic.mpoly
        ) as foo
        """

        subprocess.run(
            args=" ".join(
                [
                    "ogr2ogr",
                    "-f",
                    '"ESRI Shapefile"',
                    f'"{build_name}"',
                    f'"PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}"',  # noqa: E501
                    "-nln",
                    '"ZONE_ARTIFICIELLE"',
                    f"-a_srs EPSG:{occupation_du_sol_source.srid}",
                    "-sql",
                    f'"{multiline_string_to_single_line(sql)}"',
                    "-progress",
                ]
            ),
            check=True,
            shell=True,
        )

    logger.info("Deleting temporary tables")

    with connection.cursor() as cursor:
        cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table_occupation_du_sol};")

    with connection.cursor() as cursor:
        cursor.execute(sql=f"DROP TABLE IF EXISTS {temp_table_majic};")

    logger.info("Temporary tables deleted")

    output_source = DataSource.objects.filter(path=build_name)

    if output_source.exists():
        output_source.update(
            productor=DataSource.ProductorChoices.MDA,
            dataset=occupation_du_sol_source.dataset,
            name=DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
            millesimes=occupation_du_sol_source.millesimes,
            official_land_id=occupation_du_sol_source.official_land_id,
            mapping=None,
            path=build_name,
            shapefile_name="ZONE_ARTIFICIELLE.shp",
            srid=occupation_du_sol_source.srid,
        )
    else:
        output_source = DataSource.objects.create(
            productor=DataSource.ProductorChoices.MDA,
            dataset=occupation_du_sol_source.dataset,
            name=DataSource.DataNameChoices.ZONE_ARTIFICIELLE,
            millesimes=occupation_du_sol_source.millesimes,
            official_land_id=occupation_du_sol_source.official_land_id,
            mapping=None,
            path=build_name,
            shapefile_name="ZONE_ARTIFICIELLE.shp",
            srid=occupation_du_sol_source.srid,
        )

    return output_source, Path(build_name)


def build_ign_source(source: DataSource) -> list[Path]:
    if source.dataset == source.DatasetChoices.OCSGE:
        if source.name == source.DataNameChoices.OCCUPATION_DU_SOL:
            occupation_du_sol_source, occupation_du_sol_shapefile_path = build_ocsge_occupation_du_sol(
                source=source,
            )
            _, artificial_area_shapefile_path = build_artficial_area(
                occupation_du_sol_source=occupation_du_sol_source,
                occupation_du_sol_shapefile_path=occupation_du_sol_shapefile_path,
            )
            return [
                occupation_du_sol_shapefile_path,
                artificial_area_shapefile_path,
            ]
        if source.name == source.DataNameChoices.ZONE_CONSTRUITE:
            _, zone_construite_shapefile_path = build_ocsge_zone_construite(
                source=source,
            )
            return [zone_construite_shapefile_path]
        if source.name == source.DataNameChoices.DIFFERENCE:
            _, ocsge_difference_shapefile_path = build_ocsge_difference(
                source=source,
            )
            return [ocsge_difference_shapefile_path]

        raise ValueError(f"DataName {source.name} is not supported")

    raise ValueError(f"Dataset {source.dataset} is not supported")


def build_consommation_espace(source: DataSource) -> tuple[DataSource, Path]:
    """
    Creates a new shapefile with the consommation d'espace from MAJIC.
    Based on the consommation d'espace shapefile from CEREMA.
    """

    build_name = source.get_build_name()

    with ShapefileFromSource(source=source) as shapefile_path:
        art_fields = Cerema.get_art_field(
            start=source.millesimes[0],
            end=source.millesimes[1] - 1,
        )
        habitat_fields = [field.replace("art", "hab").replace("naf", "art") for field in art_fields]
        activity_fields = [field.replace("art", "act").replace("naf", "art") for field in art_fields]

        sql = f"""
            SELECT
                *,
                '{source.srid}' AS SRID,
                CAST(({' + '.join(art_fields)}) AS FLOAT) AS NAF11ART21,
                CAST(({' + '.join(habitat_fields)}) AS FLOAT) AS ART11HAB21,
                CAST(({' + '.join(activity_fields)}) AS FLOAT) AS ART11ACT21,
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


def build_cerema_source(source: DataSource) -> list[Path]:
    if source.dataset == source.DatasetChoices.MAJIC:
        if source.name == source.DataNameChoices.CONSOMMATION_ESPACE:
            _, consommation_espace_shapefile_path = build_consommation_espace(
                source=source,
            )
            return [consommation_espace_shapefile_path]

        raise ValueError(f"DataName {source.name} is not supported")
    raise ValueError(f"Dataset {source.dataset} is not supported")


def build_source(source: DataSource) -> list[Path]:
    if source.productor == source.ProductorChoices.IGN:
        return build_ign_source(source=source)
    if source.productor == source.ProductorChoices.CEREMA:
        return build_cerema_source(source=source)

    raise ValueError(f"Productor {source.productor} is not supported")


class Command(BaseCommand):
    help = "Build shapefile"

    def add_arguments(self, parser):
        parser.add_argument("--productor", type=str, required=True, choices=DataSource.ProductorChoices.values)
        parser.add_argument("--dataset", type=str, required=True, choices=DataSource.DatasetChoices.values)
        parser.add_argument("--name", type=str, choices=DataSource.DataNameChoices.values)
        parser.add_argument("--parallel", action="store_true", help="Run the build in parallel", default=False)
        parser.add_argument("--millesimes", type=int, nargs="*", default=[])
        parser.add_argument(
            "--land_id",
            type=str,
            help="Departement etc ...",
            choices=set([source.official_land_id for source in DataSource.objects.all()]),
        )
        parser.add_argument("--upload", action="store_true", help="Upload the shapefile to S3", default=False)

    def get_sources_queryset(self, options):
        sources = DataSource.objects.filter(
            dataset=options.get("dataset"),
            productor=options.get("productor"),
        )
        if options.get("land_id"):
            sources = sources.filter(official_land_id=options.get("land_id"))
        if options.get("name"):
            sources = sources.filter(name=options.get("name"))
        return sources

    def handle(self, *args: Any, **options: Any) -> str | None:
        if settings.ENVIRONMENT == "production":
            logger.error("This command cannot be run in production")
            return

        futures = []

        if not options.get("parallel"):
            for source in self.get_sources_queryset(options).all():
                build_source(source)
        else:
            with ProcessPoolExecutor(max_workers=5, initializer=django_setup) as executor:
                for source in self.get_sources_queryset(options).all():
                    futures.append(executor.submit(build_source, source))

        if options.get("upload"):
            with ProcessPoolExecutor(max_workers=5, initializer=django_setup) as executor:
                for future in futures:
                    for path in future.result():
                        executor.submit(upload_file_to_s3, path)
