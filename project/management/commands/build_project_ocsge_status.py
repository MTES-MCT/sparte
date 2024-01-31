import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import calculate_project_ocsge_status

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Build all ocsge status of projects"

    def add_arguments(self, parser):
        parser.add_argument(
            "--departements",
            nargs="+",
            type=int,
            help="Select departements to build",
        )

    def handle(self, *args, **options):
        logger.info("Start building ocsge status")

        projects = Project.objects.all()

        if options.get("departements"):
            logger.info("Filtering on departements: %s", options["departements"])
            projects = projects.filter(cities__departement__source_id__in=options["departements"])

        projects = projects.distinct()

        count = projects.count()

        logger.info(f"{count} projects")

        for i, project in enumerate(projects):
            logger.info(f"{i + 1}/{count} - Process project {project.id}")
            calculate_project_ocsge_status(project.id)

        logger.info("End building ocsge status")
