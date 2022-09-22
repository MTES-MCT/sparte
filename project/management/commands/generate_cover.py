import logging

from django.core.management.base import BaseCommand
from time import sleep

from django.db.models import Q

from project.models import Project
from project.tasks import generate_cover_image

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Generate cover image for all previous diagnostics"

    def handle(self, *args, **options):
        logger.info("Start generate covers")
        qs = Project.objects.filter(Q(cover_image="") | Q(cover_image=None))
        total = qs.count()
        logger.info(f"To be processed: {total}")
        for i, diag in enumerate(qs):
            if diag.combined_emprise:
                generate_cover_image.delay(diag.id)
                sleep(5)
                logger.info(f"{diag.id} - {100 * i / total:.0f}%")
        logger.info("End generate covers")
