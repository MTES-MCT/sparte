import logging

import celery
from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Commune, Departement, ZoneArtificielle
from public_data.tasks import calculate_commune_artificial_areas

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 7.0"

    def handle(self, *args, **options):
        gers_source_id = "32"
        gers = Departement.objects.get(source_id=gers_source_id)

        call_command(
            command_name="load_shapefile",
            dataset="OCSGE",
            name="ZONE_ARTIFICIELLE",
            land_id=gers.source_id,
        )

        zone_artificielle_exists = ZoneArtificielle.objects.filter(departement=gers_source_id).exists()

        if not zone_artificielle_exists:
            raise Exception("ZoneArtificielle for Gers does not exist")

        celery.group(
            [
                calculate_commune_artificial_areas.si(city.insee)
                for city in Commune.objects.filter(
                    ocsge_available=True,
                    departement=gers,
                ).all()
            ]
        ).apply_async(queue="long")
