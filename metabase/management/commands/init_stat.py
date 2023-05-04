import logging
from cProfile import Profile
from django.core.management.base import BaseCommand
from django.db import connection
from psycopg2 import OperationalError

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
        parser.add_argument(
            "--profile",
            action="store_true",
            help="Profile execution",
        )

    def handle(self, *args, **options):
        if options["profile"]:
            profiler = Profile()
            profiler.runcall(self._handle, *args, **options)
            profiler.dump_stats("cprofile.stats")
        else:
            self._handle(*args, **options)

    def _handle(self, *args, **options):
        if options.get("truncate"):
            self.truncate()
        self.do_project()
        self.do_request()

    def do_project(self):
        qs = Project.objects.exclude(id__in=StatDiagnostic.objects.values("project_id")).order_by("-created_date")
        total = qs.count()
        # Save project and request to trigger signal that will create or update StatDiagnostic
        for i, project in enumerate(qs):
            try:
                project.save(update_fields=["async_add_city_done"])
                logger.info("Project %d %d/%d - %d%%", project.id, i, total, 100 * i / total)
            except OperationalError as exc:
                logger.error("Error in StatDiagnostic.receiver_project_post_save: %s", exc)
                logger.exception(exc)
                logger.error("Process continue...")

    def do_request(self):
        total = Request.objects.count()
        # Save project and request to trigger signal that will create or update StatDiagnostic
        for i, req in enumerate(Request.objects.order_by("-created_date")):
            try:
                od = StatDiagnostic.objects.get(project_id=req.project_id)
                od.update_with_request(req)
                logger.info("Request %d %d/%d - %d%%", req.id, i, total, 100 * i / total)
            except StatDiagnostic.DoesNotExist:
                pass

    def truncate(self):
        query = f"TRUNCATE TABLE {StatDiagnostic._meta.db_table} RESTART IDENTITY"
        with connection.cursor() as cursor:
            cursor.execute(query)
        logger.info("Truncate done.")
