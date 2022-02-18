import logging
import traceback

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import evaluate_indicators


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset all projects data, usefull when updating all precalculated fields"

    def handle(self, *args, **options):
        logger.info("Reevaluate indicators for all project")
        qs = Project.objects.all()
        logger.info("%d projects", qs.count())
        for project in qs:
            try:
                evaluate_indicators(project)
            except Exception as e:
                print(f"Failed for project={project.id}")
                print(e)
                print(traceback.format_exc())
                print()
        logger.info("End reevaluation")
