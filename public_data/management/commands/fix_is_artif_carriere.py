import logging

import celery
from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Commune, Ocsge
from public_data.tasks import calculate_commune_artificial_area

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Fix is_artif_carriere"

    def handle(self, *args, **options):
        call_command(command_name="load_shapefile", dataset="OCSGE", name="DIFFERENCE")

        ocsge_with_carriere = Ocsge.objects.filter(
            couverture="CS1.1.2.1",  # zones à matériaux minéraux,
            usage="US1.3",  # activité d'extraction
        )

        ocsge_with_carriere.update(
            is_artificial=False,
        )

        communes = Commune.objects.filter(
            ocsge_available=True,
        )

        celery_tasks = []

        for commune in communes:
            ocsge_with_carriere_on_commune = ocsge_with_carriere.filter(
                mpoly__intersects=commune.mpoly,
            )

            if ocsge_with_carriere_on_commune.exists():
                logger.info(f"Commune {commune.insee} has carriere")
                celery_tasks.append(calculate_commune_artificial_area.si(commune.insee))
        logger.info(f"Found {len(celery_tasks)} communes with carriere")

        celery.group(*celery_tasks).apply_async(queue="long")
