import logging

import celery
from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import ArtificialArea, Commune, Departement, ZoneArtificielle
from public_data.tasks import create_commune_artificial_area_if_not_exists

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 7.0"

    def handle(self, *args, **options):
        for departement in Departement.objects.all():
            if not departement.is_artif_ready:
                continue

            call_command(
                command_name="load_shapefile",
                dataset="OCSGE",
                name="ZONE_ARTIFICIELLE",
                land_id=departement.source_id,
            )

            zone_artificielle_exists = ZoneArtificielle.objects.filter(departement=departement.source_id).exists()

            if not zone_artificielle_exists:
                raise Exception(f"ZoneArtificielle for departement {departement.source_id} does not exist")

            ArtificialArea.objects.filter(departement=departement.source_id).delete()

            celery.group(
                [
                    create_commune_artificial_area_if_not_exists.si(city.insee)
                    for city in Commune.objects.filter(
                        ocsge_available=True,
                        departement=departement,
                    ).all()
                ]
            ).apply_async()
