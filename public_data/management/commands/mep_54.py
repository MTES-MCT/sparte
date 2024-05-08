import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import DataSource

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "mep_54"

    def load_cerema_shapefile(self, land_id: str) -> None:
        call_command(
            command_name="load_shapefile",
            dataset=DataSource.DatasetChoices.MAJIC,
            name=DataSource.DataNameChoices.CONSOMMATION_ESPACE,
            land_id=land_id,
            millesimes=[2009, 2023],
        )

    def handle(self, *args, **options):
        logger.info("Start mep_54")

        DataSource.objects.all().delete()
        call_command("loaddata", "public_data/models/data_source_fixture.json")

        lands = [
            "MetropoleEtCorse",
            "971",
            "972",
            "973",
            "974",
        ]

        for land in lands:
            self.load_cerema_shapefile(land)
