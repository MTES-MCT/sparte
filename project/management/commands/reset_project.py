import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import process_new_project


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset all projects data, usefull when updating all precalculated fields"

    def handle(self, *args, **options):
        logger.info("Reset all project")
        qs = Project.objects.all()
        logger.info("%d projects found", qs.count())
        for project in qs:
            try:
                project.import_status = Project.Status.PENDING
                project.save()
                process_new_project(project.id)
            except Exception:  # noqa: E722
                pass
