import logging

from celery import shared_task

from public_data.domain.artificialisation.use_case.CalculateCommuneArtificialAreas import (
    CalculateCommuneArtificialAreas,
)
from public_data.domain.artificialisation.use_case.CalculateCommuneTotalArtif import (
    CalculateCommuneTotalArtif,
)
from public_data.models import Commune

logger = logging.getLogger(__name__)


@shared_task
def calculate_commune_artificial_area(commune_insee: str):
    logger.info(f"Commune {commune_insee} - Calculating artificial areas")
    commune = Commune.objects.get(insee=commune_insee)
    artificial_areas = CalculateCommuneArtificialAreas.execute(commune)
    CalculateCommuneTotalArtif.execute(commune)
    logger.info(f"Commune {commune_insee} - Artificial areas calculated: {artificial_areas.count()}")
