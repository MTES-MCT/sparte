import logging

import celery
from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Commune, DataSource, Departement
from public_data.tasks import calculate_data_for_commune

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load data for 5.2 deployment"

    def load_departement(self, departement: Departement):
        call_command(
            command_name="load_shapefile",
            dataset=DataSource.DatasetChoices.OCSGE,
            land_id=departement.source_id,
        )
        call_command(
            command_name="update_project_ocsge",
            departements=[departement.source_id],
        )

    def handle(self, *args, **options):
        logger.info("Start mep_71")

        call_command("maintenance", on=True)

        logger.info("Initialize data sources")
        call_command("loaddata", "public_data/models/data_source_fixture.json")

        logger.info("Load new OCS GE")
        call_command("setup_departements")

        departements_source_ids = ["33"]

        celery_tasks = []

        for source_id in departements_source_ids:
            departement = Departement.objects.get(source_id=source_id)
            self.load_departement(departement)

            for commune in Commune.objects.filter(departement=departement):
                celery_tasks.append(calculate_data_for_commune.si(commune.insee))

        celery.group(*celery_tasks).apply_async(queue="long")

        call_command("maintenance", off=True)
        logger.info("End mep_71")
