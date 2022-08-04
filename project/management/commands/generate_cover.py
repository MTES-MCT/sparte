import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import generate_cover_image

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Generate cover image for all previous diagnostics"

    def handle(self, *args, **options):
        logger.info("Start generate covers")
        qs = Project.objects.filter(cover_image="")
        total = qs.count()
        logger.info(f"To be processed: {total}")
        for i, diag in enumerate(qs):
            generate_cover_image(diag.id)
            logger.info(f"{diag.id} - {100 * i / total:.0f}%")
        logger.info("End generate covers")
