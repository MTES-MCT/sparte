import logging

from django.core.management.base import BaseCommand

from public_data.models import Cerema

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Trigger the calculation of new fields in Cerema models"

    def handle(self, *args, **options):
        logger.info("Update Ceram new fields")
        Cerema.calculate_fields()
        logger.info("End update new fields")
