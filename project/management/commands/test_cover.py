import logging

from django.core.management.base import BaseCommand

from project.tasks import generate_cover_image

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Test create cover image of a diagnostic"

    def handle(self, *args, **options):
        logger.info("Start")
        generate_cover_image("1")
