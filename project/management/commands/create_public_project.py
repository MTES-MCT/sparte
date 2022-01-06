import logging
import string
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from public_data.models import Epci
from project.models import Project


logger = logging.getLogger("management.commands")


def pw_generator(size=12, chars=string.ascii_letters + string.digits):
    seq = [random.SystemRandom().choice(chars) for _ in range(size)]
    return "".join(seq)


class Command(BaseCommand):
    help = "Based on RefPlan will create all public projects"

    def handle(self, *args, **options):
        logger.info("Create all public projects")
        self.init_user()
        self.create_epci()

    def create_epci(self):
        logger.info("Create EPCI projects")
        for epci in Epci.objects.all():
            self.create_project("EPCI", epci)

    def init_user(self):
        User = get_user_model()
        try:
            self.user = User.objects.get(email="admin@beta.gouv.fr")
        except User.DoesNotExist:
            self.user = User.objects.create_superuser(
                email="admin@beta.gouv.fr", password=pw_generator()
            )

    def create_project(self, project_type, land):
        """Land needs to have following porperties: id, name and mpoly"""
        public_key = f"{project_type}_{land.id}"
        # Find or create
        try:
            project = Project.objects.get(public_key=public_key)
            project.emprise_set.all().delete()
        except Project.DoesNotExist:
            project = Project.objects.create(
                user=self.user,
                public_key=public_key,
                is_public=True,
            )
        # update data
        desc = f"Diagnostic du territoire '{land.name}' ({project_type})"
        project.name = land.name
        project.description = desc
        project.analyse_start_date = "2011"
        project.analyse_end_date = "2020"
        project.import_status = Project.Status.PENDING
        project.save()
        # add emprise
        project.emprise_set.create(mpoly=land.mpoly)
        # update precalculated data
        # process_new_project.delay(project.id)
        # time.sleep(5)
        return project
