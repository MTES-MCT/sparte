import logging

from django.core.management.base import BaseCommand

from public_data.models import ZoneConstruite


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "This will reevaluate parent fields of all instances of Couverture and Usage"

    def handle(self, *args, **options):
        logger.info("Set density in zone construites")
        todo = list(ZoneConstruite.objects.filter(built_density=None))
        total = len(todo)
        logger.info(f"To be processed: {total}")
        for i, zone in enumerate(todo):
            zone.set_built_density(save=True)
            logger.info(f"Set density: {int(round(100 * i / total, 0))}% {i}/{total}")
        logger.info("End density in zone construites")
