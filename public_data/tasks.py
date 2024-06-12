import logging

from celery import shared_task

from public_data.domain.artificialisation.use_case.RetrieveFreshestCommnuneArtificialAreas import (
    RetrieveFreshestCommuneArtificialAreas,
)
from public_data.models import Commune

logging.basicConfig(level=logging.INFO)


@shared_task(bind=True)
def create_artificial_area_for_city(self, city_id: str):
    commune = Commune.objects.get(insee=city_id)
    RetrieveFreshestCommuneArtificialAreas.execute(commune)
