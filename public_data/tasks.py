import logging

from celery import group, shared_task

from public_data.domain.artificialisation.use_case import (
    CalculateCommuneArtificialAreas,
    CalculateCommuneDiff,
    CalculateCommuneTotalArtif,
    CalculateCommuneUsageEtCouvertureRepartition,
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


@shared_task
def calculate_commune_artificial_diff(commune_insee: str):
    logger.info(f"Commune {commune_insee} - Calculating artificial diff")
    commune = Commune.objects.get(insee=commune_insee)
    CalculateCommuneDiff.execute(commune)
    logger.info(f"Commune {commune_insee} - Artificial diff calculated")


@shared_task
def calculate_commune_usage_et_couverture_repartition(commune_insee: str):
    logger.info(f"Commune {commune_insee} - Calculating usage et couverture repartition")
    commune = Commune.objects.get(insee=commune_insee)
    CalculateCommuneUsageEtCouvertureRepartition.execute(commune)
    logger.info(f"Commune {commune_insee} - Usage et couverture repartition calculated")


@shared_task
def calculate_data_for_commune(commune_insee: str):
    logger.info(f"Commune {commune_insee} - Calculating data")
    group(
        calculate_commune_artificial_area.si(commune_insee),
        calculate_commune_artificial_diff.si(commune_insee),
        calculate_commune_usage_et_couverture_repartition.si(commune_insee),
    ).apply_async(queue="long")
    logger.info(f"Commune {commune_insee} - Data calculated")
