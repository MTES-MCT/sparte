import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from project.models import Project
from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load data for 4.6 deployment"

    def load_departement(self, departement: Departement):
        call_command("load_ocsge", departement=departement.name)
        call_command("build_commune_data", departement=departement.name, verbose=True)
        call_command("build_artificial_area", departement=departement.name, verbose=True)
        call_command("import_gpu", departement=departement.name)
        call_command("update_project_ocsge", departements=[departement.source_id])

    def handle(self, *args, **options):
        logger.info("Start mep_46")

        call_command("fix_artificial_area_missing_departement")

        # fix old projects
        Project.objects.filter(async_add_city_done=False).update(async_add_city_done=True)

        call_command("maintenance", on=True)

        logger.info("Initialize data sources")
        call_command("loaddata", "public_data/models/data_source_fixture.json")

        logger.info("Load new OCS GE")
        call_command("setup_departements")

        departements_source_ids = ["35", "83", "94"]

        for source_id in departements_source_ids:
            departement = Departement.objects.get(source_id=source_id)
            self.load_departement(departement)

        call_command("maintenance", off=True)
        logger.info("End mep_46")
