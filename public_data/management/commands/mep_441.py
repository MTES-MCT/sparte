# 4.4.1 migration
# TODO: remove this file when 4.4.1 is deployed on staging and prod

import logging
from typing import List

from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load data for 4.4.1 deployment"

    def load_departement(self, departement: Departement, years: List[int]):
        call_command("load_ocsge", departement=departement.name, year_range=years)
        call_command("setup_departements")

        call_command("build_commune_data", departement=departement.name, verbose=True)
        call_command("build_artificial_area", departement=departement.name, verbose=True)

        call_command("import_gpu", departement=departement.name)

        call_command("reset_first_last")
        call_command("build_project_ocsge_status")

        call_command("load_insee")

    def handle(self, *args, **options):
        logger.info("Start load_441")
        call_command("maintenance", on=True)

        call_command("loaddata public_data/management/commands/data_source_fixture.json")

        self.load_departement(departement=Departement.objects.get(name="Hauts-de-Seine"), years=[2018, 2021])
        self.load_departement(departement=Departement.objects.get(name="Landes"), years=[2018, 2021])

        call_command("maintenance", off=True)
        logger.info("End load_441")
