import logging

import celery
from django.core.management.base import BaseCommand

from project.tasks import create_zip_departement_rnu_package_one_off
from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "create_rnu_diagnostics"

    def handle(self, *args, **options):
        tasks = []

        for departement in Departement.objects.all():
            tasks.append(create_zip_departement_rnu_package_one_off.si(departement.source_id))

        celery.group(*tasks).apply_async(queue="long")
