import logging
from typing import List

from django.core.management import call_command
from django.core.management.base import BaseCommand

from public_data.models import Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load migrate data for 4.4.1 deployment"

    def load_departement(self, departement: Departement, ocsge_items: List[str]):
        call_command("load_ocsge", item=ocsge_items)
        call_command("setup_dept")

        call_command("build_commune_data", departement=departement.name, verbose=True)
        call_command("build_artificial_area", departement=departement.name, verbose=True)

        call_command("import_gpu", departement=departement.name)

        call_command("reset_first_last")
        call_command("build_project_ocsge_status")

        call_command("load_insee")

    def handle(self, *args, **options):
        logger.info("Start load_441")

        hauts_de_seine_ocsge_items = [
            "HautsDeSeineOcsge2018",
            "HautsDeSeineOcsge2021",
            "HautsDeSeineOcsgeZoneConstruite2018",
            "HautsDeSeineOcsgeZoneConstruite2021",
            "HautsDeSeineOcsgeDiff1821",
        ]

        self.load_departement(Departement.objects.get(name="Hauts-de-Seine"), hauts_de_seine_ocsge_items)

        landes_ocsge_items = [
            "LandesOcsge2018",
            "LandesOcsge2021",
            "LandesOcsgeZoneConstruite2018",
            "LandesOcsgeZoneConstruite2021",
            "LandesOcsgeDiff1821",
        ]

        self.load_departement(Departement.objects.get(name="Landes"), landes_ocsge_items)

        call_command("maintenance", off=True)
        logger.info("End load_441")
