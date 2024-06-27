from concurrent.futures import ProcessPoolExecutor
from logging import getLogger
from pathlib import Path
from typing import Any

from django import setup as django_setup
from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.infra.shapefile_builder.gdal.GdalShapefileBuilder import (
    GdalShapefileBuilder,
)
from public_data.models import DataSource
from public_data.storages import DataStorage

logger = getLogger("management.commands")


def upload_file_to_s3(path: Path):
    logger.info(f"Uploading {path.name} to S3")

    with open(path, "b+r") as f:
        storage = DataStorage()
        storage.save(path.name, f)

    logger.info(f"Uploaded {path.name} to S3")


class Command(BaseCommand):
    help = "Build shapefile"

    def add_arguments(self, parser):
        parser.add_argument("--productor", type=str, required=True, choices=DataSource.ProductorChoices.values)
        parser.add_argument("--dataset", type=str, required=True, choices=DataSource.DatasetChoices.values)
        parser.add_argument("--name", type=str, choices=DataSource.DataNameChoices.values)
        parser.add_argument("--year", type=int)
        parser.add_argument("--parallel", action="store_true", help="Run the build in parallel", default=False)
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
        if options.get("year"):
            sources = sources.filter(millesimes__contains=[options.get("year")])
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

        if options.get("parallel"):
            with ProcessPoolExecutor(max_workers=5, initializer=django_setup) as executor:
                for source in self.get_sources_queryset(options).all():
                    executor.submit(builder.build, source)
        else:
            # Running sequentially might be useful for debugging and necesary for
            # building the most complex shapefiles
            for source in self.get_sources_queryset(options).all():
                for built in builder.build(source):
                    if options.get("upload"):
                        _, path = built
                        upload_file_to_s3(path)
