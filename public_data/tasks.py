import logging

from celery import shared_task
from django.db import transaction

from public_data.domain.artificialisation.use_case.RetrieveFreshestCommnuneArtificialAreas import (
    RetrieveFreshestCommuneArtificialAreas,
)
from public_data.models import Commune

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def create_commune_artificial_area_if_not_exists(self, city_id: str):
    logger.info(f"Creating artificial area for city {city_id}")
    commune = Commune.objects.get(insee=city_id)

    with transaction.atomic():
        artificial_areas = RetrieveFreshestCommuneArtificialAreas.execute(commune)

    return [artificial_area.id for artificial_area in artificial_areas]
