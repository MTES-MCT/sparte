# 4.4.1 migration
# TODO: remove this file when 4.4.1 is deployed on staging and prod

import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load data for 4.5 deployment"

    def load_departement(self, departement: Departement):
        call_command("load_ocsge", departement=departement.name)
        call_command("build_commune_data", departement=departement.name, verbose=True)
        call_command("build_artificial_area", departement=departement.name, verbose=True)
        call_command("import_gpu", departement=departement.name)

    def handle(self, *args, **options):
        logger.info("Start mep_45")

        call_command("maintenance", on=True)

        logger.info("Initialize data sources")
        call_command("loaddata", "public_data/models/data_source_fixture.json")

        logger.info("Load DROM-COM")
        # Guadeloupe, Martinique, Guyane française, La Réunion
        dept_codes = ["971", "972", "973", "974"]
        call_command("load_cerema", official_land_ids=dept_codes)
        call_command("build_administrative_layers", departements=dept_codes)
        call_command("load_insee")

        logger.info("Load new OCS GE")
        call_command("setup_departements")
        self.load_departement(departement=Departement.objects.get(name="Hauts-de-Seine"))
        self.load_departement(departement=Departement.objects.get(name="Landes"))

        call_command("reset_first_last", departements=dept_codes)
        call_command("build_project_ocsge_status", departements=dept_codes)

        call_command("maintenance", off=True)
        logger.info("End mep_45")
