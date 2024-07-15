import logging

import celery
from django.core.management.base import BaseCommand

from project.tasks import create_zip_departement_rnu_package_one_off
from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "create_rnu_packages"

    def add_arguments(self, parser):
        parser.add_argument("--departement", type=str, required=False)

    def handle(self, *args, **options):
        tasks = []

        departements = Departement.objects.all()

        if options["departement"]:
            departements = Departement.objects.filter(source_id=options["departement"])

        for departement in departements:
            tasks.append(create_zip_departement_rnu_package_one_off.si(departement.source_id))

        celery.group(*tasks).apply_async(queue="long")
