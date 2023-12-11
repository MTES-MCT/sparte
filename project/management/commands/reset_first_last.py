import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import find_first_and_last_ocsge

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset first and last ocsge for all projects"

    def handle(self, *args, **options):
        logger.info("Reevaluate ocsge millesimes for all project")

        projects = Project.objects.all()

        logger.info("%d projects", projects.count())

        for project in projects:
            logger.info("Process project %d", project.id)
            find_first_and_last_ocsge(project.id)

        logger.info("End reevaluation")
