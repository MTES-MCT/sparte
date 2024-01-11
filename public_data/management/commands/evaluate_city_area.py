import logging

from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand

from public_data.models import Commune

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Evaluate city area"

    def handle(self, *args, **options):
        logger.info("Start evaluation of city area")
        Commune.objects.all().update(area=Area(Transform("mpoly", 2154)) / 10000)
        logger.info("End evaluation of city area")
