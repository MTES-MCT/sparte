import logging
from django.core.management.base import BaseCommand
from django.db import connection

from metabase.models import StatDiagnostic
from project.models import Project, Request

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Force the update StatDiagnostic."

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            "--truncate",
            action="store_true",
            help="Execute a truncate before starting the update",
        )

    def handle(self, *args, **options):
        if options.get("truncate"):
            self.truncate()
        total = Project.objects.count()
        # Save project and request to trigger signal that will create or update StatDiagnostic
        for i, project in enumerate(Project.objects.order_by("-created_date")):
            project.save(update_fields=["async_city_and_combined_emprise_done"])
            for request in Request.objects.filter(project=project):
                request.save()
            logger.info(f"%d/%d - %d%%", i, total, 100 * i / total)

    def truncate(self):
        query = f'TRUNCATE TABLE "{StatDiagnostic._meta.db_table}" RESTART IDENTITY'
        with connection.cursor() as cursor:
            cursor.execute(query)
        logger.info("Truncate done.")
