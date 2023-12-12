import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import calculate_project_ocsge_status

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Build all ocsge status of projects"

    def handle(self, *args, **options):
        projects = Project.objects.all()
        count = projects.count()

        logger.info(f"Start building ocsge status for {count} projects")

        for i, project in enumerate(projects):
            logger.info(f"{i + 1}/{count} - Process project {project.id}")
            calculate_project_ocsge_status(project.id)

        logger.info("End building ocsge status")
