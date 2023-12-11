import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import calculate_project_ocsge_status

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Build all ocsge status of projects"

    def handle(self, *args, **options):
        projects = Project.objects.all()

        logger.info("%d projects", projects.count())

        for project in projects:
            logger.info("Process project %d", project.id)
            calculate_project_ocsge_status(project.id)

        logger.info("End building ocsge status")
