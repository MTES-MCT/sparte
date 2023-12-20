import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Dedicated to load migrate data for 4.4.0 deployment"

    def handle(self, *args, **options):
        logger.info("Start mep_ocsge_440")

        call_command("remove_ocsge_data_gironde")
        call_command("set_gers_departement_to_ocsge_objects")

        ocsge_items = [
            # Essonne ####
            "EssonneOcsge2018",
            "EssonneOcsge2021",
            "EssonneOcsgeDiff1821",
            "EssonneOcsgeZoneConstruite2018",
            "EssonneOcsgeZoneConstruite2021",
            # Seine-et-Marne ####
            "SeineEtMarneOcsge2017",
            "SeineEtMarneOcsge2021",
            "SeineEtMarneOcsgeDiff1721",
            "SeineEtMarneOcsgeZoneConstruite2017",
            "SeineEtMarneOcsgeZoneConstruite2021",
        ]
        call_command("load_ocsge", item=ocsge_items)
        call_command("setup_dept")

        call_command("build_commune_data", departement="Essonne", verbose=True)
        call_command("build_commune_data", departement="Gers", verbose=True)
        call_command("build_commune_data", departement="Seine-et-Marne", verbose=True)

        call_command("build_artificial_area", departement="Essonne", verbose=True)
        call_command("build_artificial_area", departement="Seine-et-Marne", verbose=True)

        call_command("import_gpu", dept="91")
        call_command("import_gpu", dept="77")

        call_command("reset_first_last")
        call_command("build_project_ocsge_status")

        call_command("load_insee")

        call_command("maintenance", off=True)
        logger.info("End mep_ocsge_440")
