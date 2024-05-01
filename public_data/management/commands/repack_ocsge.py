import logging
import re
import subprocess

from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromURL

logger = logging.getLogger("management.commands")


def find_years_in_url(url: str, count=1) -> list[int]:
    results = re.findall(pattern="(\d{4})", string=str(url))  # noqa: W605

    years = set()

    for result in results:
        # check if the year the number is > 2000.
        # this is to avoid getting other numbers in the path as years
        if str(result).startswith("20"):
            years.add(int(result))

    if len(years) != count:
        raise ValueError("Years count does not match the expected count")

    if not years:
        raise ValueError("Years not found in the path")

    return list(sorted(years))


def find_departement_in_url(url: str) -> str:
    results = re.findall(pattern="D(\d{3})", string=str(url))  # noqa: W605

    if len(results) > 0:
        result = results[0]

    if str(result).startswith("0"):
        return str(result).replace("0", "")

    if not result:
        raise ValueError("Departement not found in the path")

    return result


def process_url(url: str) -> list[DataSource]:
    sources = []
    if "DIFF" in url:
        sources.append(
            DataSource(
                dataset=DataSource.DatasetChoices.OCSGE,
                name=DataSource.DataNameChoices.DIFFERENCE,
                productor=DataSource.ProductorChoices.IGN,
                source_url=url,
                srid=2154,
            )
        )
    else:
        sources += [
            DataSource(
                dataset=DataSource.DatasetChoices.OCSGE,
                name=DataSource.DataNameChoices.OCCUPATION_DU_SOL,
                productor=DataSource.ProductorChoices.IGN,
                source_url=url,
                srid=2154,
            ),
            DataSource(
                dataset=DataSource.DatasetChoices.OCSGE,
                name=DataSource.DataNameChoices.ZONE_CONSTRUITE,
                productor=DataSource.ProductorChoices.IGN,
                source_url=url,
                srid=2154,
            ),
        ]

    logger.info(f"Processing sources : {sources}")

    for source in sources:
        shapefile_name_pattern = {
            DataSource.DataNameChoices.OCCUPATION_DU_SOL: "OCCUPATION_SOL.shp",
            DataSource.DataNameChoices.ZONE_CONSTRUITE: "ZONE_CONSTRUITE.shp",
            DataSource.DataNameChoices.DIFFERENCE: "*.shp",
        }[source.name]

        with ShapefileFromURL(url=url, shapefile_name=shapefile_name_pattern) as shapefile_path:
            source.millesimes = find_years_in_url(
                url=url, count=2 if source.name == DataSource.DataNameChoices.DIFFERENCE else 1
            )

            logger.info(f"Years found : {source.millesimes}")

            source.official_land_id = find_departement_in_url(url=url)

            logger.info(f"Departement found : {source.official_land_id}")

            shapefile_name = shapefile_path.name

            target_name = f"{source.official_land_id}_{source.name}_{'_'.join(map(str, source.millesimes))}_{source.productor}_REPACKED.shp.zip"  # noqa: E501

            logger.info(f"Target name : {target_name}")

            command = f'ogr2ogr -f "ESRI Shapefile" "{target_name}" "{shapefile_path}"'

            subprocess.run(args=command, check=True, shell=True)

            source.path = target_name
            source.shapefile_name = shapefile_name

            source.save()

    return sources


class Command(BaseCommand):
    help = """
        Take a list of URLS as input, and for each URL, download the zip, extract the shapefiles,
        and repackage them in a new zip file with a new name.
        This effectively separates DIFFERENCE, OCCUPATION_DU_SOL and ZONE_CONSTRUITE shapefiles
        into their own zip files, and create the corresponding DataSource objects in the database.
        Note that the command does not upload the new zip files to S3.
        This command is intended to be used in local environment only.
    """

    def handle(self, *args, **options):
        if settings.ENVIRONMENT != "local":
            raise Exception("This command can only be run in local environment")

        urls = []

        for url in urls:
            process_url(url)
