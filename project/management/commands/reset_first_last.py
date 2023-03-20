import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import find_first_and_last_ocsge

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset all projects data, usefull when updating all precalculated fields"

    def handle(self, *args, **options):
        logger.info("Reevaluate indicators for all project")
        qs = Project.objects.all()
        logger.info("%d projects", qs.count())
        for project in qs:
            try:
                logger.info("Process project %d", project.id)
                find_first_and_last_ocsge(project)
                project.save()
            except Exception as e:
                logger.error("Failed for project=%d, error=%s", project.id, e)
        logger.info("End reevaluation")
