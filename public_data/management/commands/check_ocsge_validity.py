import logging
from concurrent.futures import ProcessPoolExecutor

import geopandas
from django import setup as django_setup
from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.models import DataSource
from public_data.shapefile import ShapefileFromSource

logger = logging.getLogger("management.commands")


def check_unique_fields_are_unique(source: DataSource, df: geopandas.GeoDataFrame):
    fields = {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: ["ID"],
        DataSource.DataNameChoices.ZONE_CONSTRUITE: ["ID"],
        DataSource.DataNameChoices.DIFFERENCE: [],
    }[source.name]

    errors = []

    for field in fields:
        if not df[field].is_unique:
            with open("errors_ocsge.txt", "+a") as f:
                f.write(
                    f"D0{source.official_land_id} - {source.millesimes_string()} - {source.name} - {field} is not unique\n"  # noqa: E501
                )
    return errors


def check_source_validity(source: DataSource) -> bool:
    with ShapefileFromSource(source) as shapefile_path:
        df = geopandas.read_file(shapefile_path)
        check_unique_fields_are_unique(source, df)


class Command(BaseCommand):
    help = """
        Iterate over all OCSGE sources and check if a series of conditions are met.
        Note that the data must already be in S3, and a Datasource created for each source.
        The output of the command is a file named errors_ocsge.txt in the current directory.

        This command is intended to be used in local environnement only.
    """

    def add_arguments(self, parser):
        parser.add_argument("--land_id", type=str)

    def get_sources_queryset(self, departement=None):
        sources = DataSource.objects.filter(
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
        )

        if departement:
            sources = sources.filter(official_land_id=departement)

        return sources

    def handle(self, *args, **options):
        if settings.ENVIRONNEMENT != "local":
            raise Exception("This command can only be run in local environnement")

        sources = self.get_sources_queryset(departement=options["land_id"])

        with ProcessPoolExecutor(max_workers=5, initializer=django_setup) as executor:
            for source in sources:
                executor.submit(check_source_validity, source)
