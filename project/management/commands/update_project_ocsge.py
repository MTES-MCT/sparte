import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.models.create import update_ocsge

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset async task status for projects with new OCSGE data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--departements",
            nargs="+",
            type=int,
            help="Select departements to build",
        )

    def handle(self, *args, **options):
        logger.info("Reset async task status for projects")

        projects = Project.objects.all()

        if options.get("departements"):
            logger.info("Filtering on departements: %s", options["departements"])
            projects = projects.filter(cities__departement__source_id__in=options["departements"])

        projects = projects.distinct()

        count = projects.count()

        for i, project in enumerate(projects):
            logger.info(f"{i + 1}/{count} - Process project {project.id}")
            update_ocsge(project)

        logger.info("Done resetting async task status for projects")
