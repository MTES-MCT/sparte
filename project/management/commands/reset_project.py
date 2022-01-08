import logging

from django.core.management.base import BaseCommand

from project.models import Project
from project.tasks import process_new_project


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Reset all projects data, usefull when updating all precalculated fields"

    def handle(self, *args, **options):
        logger.info("Reset all project")
        qs_to_delete = Project.objects.filter(shape_file="")
        logger.info("%d to be deleted", qs_to_delete.count())
        qs_to_delete.delete()
        qs = Project.objects.all()
        logger.info("%d projects to be reseted", qs.count())
        for project in qs:
            project.reset(save=True)
            process_new_project(project.id)
