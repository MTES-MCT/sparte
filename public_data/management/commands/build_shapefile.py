from logging import getLogger
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.domain.shapefile_builder.infra.gdal.GdalShapefileBuilder import (
    GdalShapefileBuilder,
)
from public_data.models import DataSource

logger = getLogger("management.commands")


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

        builder = GdalShapefileBuilder()

        for source in self.get_sources_queryset(options).all():
            builder.build(source)
