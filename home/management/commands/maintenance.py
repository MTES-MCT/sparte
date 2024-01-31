import logging

from django.core.management.base import BaseCommand
from django.db.utils import ProgrammingError
from django_app_parameter.models import Parameter
from psycopg2.errors import UndefinedTable

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Activate or deactivate app's maintenance mode."

    def add_arguments(self, parser):
        parser.add_argument(
            "--on",
            action="store_true",
            help="Activate maintenance mode, user cannot access the app.",
        )
        parser.add_argument(
            "--off",
            action="store_true",
            help="Deactivate maintenance mode, user can use the app.",
        )

    def handle(self, *args, **options):
        """Change maintenance state according to on / off arguments."""
        logger.info("Start maintenance command")

        try:
            self.maintenance = Parameter.objects.get_from_slug("MAINTENANCE_MODE")
            self.current_mode = self.maintenance.get()
            logger.info("Current maintenance mode: %s", self.current_mode)

            if options["on"] is True:
                self.activate()
            elif options["off"] is True:
                self.deactivate()
            else:  # toggle mode
                if self.current_mode is True:
                    self.deactivate()
                else:
                    self.activate()

            logger.info("End maintenance command")
        except (UndefinedTable, ProgrammingError):
            logger.error("It's look like it's the first deployment.")

    def activate(self):
        """Activate maintenance mode by changing value of MAINTENANCE_MODE parameter to 1."""
        if self.current_mode is False:
            logger.info("Entering maintenance mode")
            self.maintenance.value = 1
            self.maintenance.save()
        else:
            logger.warning("Maintenance mode is already activated")

    def deactivate(self):
        """De  activate maintenance mode by changing value of MAINTENANCE_MODE parameter to 0."""
        if self.current_mode is True:
            logger.info("Exiting maintenance mode")
            self.maintenance.value = 0
            self.maintenance.save()
        else:
            logger.warning("Maintenance mode is already not activated")
