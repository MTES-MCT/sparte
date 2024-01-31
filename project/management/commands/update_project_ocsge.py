import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.models.create import update_ocsge

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Update project after adding new OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--departements",
            nargs="+",
            type=int,
            help="Select departements to build",
        )

    def handle(self, *args, **options):
        logger.info("Reevaluate ocsge for projects")

        projects = Project.objects.all()

        if options.get("departements"):
            logger.info("Filtering on departements: %s", options["departements"])
            projects = projects.filter(cities__departement__source_id__in=options["departements"])

        projects = projects.distinct()

        count = projects.count()

        logger.info(f"Update project OCS GE cache for {count} projects")

        for i, project in enumerate(projects):
            logger.info(f"{i + 1}/{count} - Process project {project.id}")
            update_ocsge(project)

        logger.info("End Reevaluate ocsge for project")
