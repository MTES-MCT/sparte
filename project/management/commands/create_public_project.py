import logging
import time

from django.core.management.base import BaseCommand

from public_data.models import Epci


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Based on RefPlan will create all public projects"

    def handle(self, *args, **options):
        logger.info("Create all public projects")
        logger.info("Create EPCI projects")
        for epci in Epci.objects.all():
            pass
