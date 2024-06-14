import logging

from celery import shared_task

from public_data.domain.artificialisation.use_case.RetrieveFreshestCommnuneArtificialAreas import (
    RetrieveFreshestCommuneArtificialAreas,
)
from public_data.models import Commune

logger = logging.getLogger(__name__)


@shared_task(bind=True, queue="long")
def create_commune_artificial_area_if_not_exists(self, city_id: str):
    logger.info(f"Creating artificial area for city {city_id}")
    commune = Commune.objects.get(insee=city_id)
    RetrieveFreshestCommuneArtificialAreas.execute(commune)
