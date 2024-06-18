import logging

import celery
from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Commune, DataSource, Departement, ZoneArtificielle
from public_data.tasks import calculate_commune_artificial_areas

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 7.0"

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            type=str,
            help="Departement source_id",
            required=True,
            choices=Departement.objects.values_list("source_id", flat=True),
        )

    def load_departement(self, departement: Departement):
        call_command(
            command_name="load_shapefile",
            dataset=DataSource.DatasetChoices.OCSGE,
            land_id=departement.source_id,
        )
        call_command(
            command_name="build_commune_data",
            departement=departement.source_id,
            verbose=True,
        )
        call_command(
            command_name="import_gpu",
            departement=departement.source_id,
        )
        call_command(
            command_name="update_project_ocsge",
            departements=[departement.source_id],
        )

    def handle(self, *args, **options):
        full_reload_for_departements = [
            "40",
            "77",
        ]
        departement_source_id = options.get("departement")
        departement = Departement.objects.get(source_id=departement_source_id)

        if departement_source_id in full_reload_for_departements:
            self.load_departement(departement)

        call_command(
            command_name="load_shapefile",
            dataset="OCSGE",
            name="ZONE_ARTIFICIELLE",
            land_id=departement.source_id,
        )

        zone_artificielle_exists = ZoneArtificielle.objects.filter(departement=departement.source_id).exists()

        if not zone_artificielle_exists:
            raise Exception(f"ZoneArtificielle for {departement.name} does not exist")

        celery.group(
            [
                calculate_commune_artificial_areas.si(city.insee)
                for city in Commune.objects.filter(
                    ocsge_available=True,
                    departement=departement,
                ).all()
            ]
        ).apply_async(queue="long")
