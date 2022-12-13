import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Load OCS GE of Bourgogne Franche Comté"

    def add_arguments(self, parser):
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="insee code of a particular city",
        )

    def handle(self, *args, **options):
        logger.info("Load OCS GE of Bourgogne-Franche Comté")

        logger.info("Update couverture and usage nomenclature")
        call_command("load_usage_couv")
        call_command("build_matrix")

        logger.info("Start uploading OCS GE of Bourgogne Franche Comté")
        items = [
            "CotedorOcsge2010",
            # NE FONCTIONNE PAS "CotedorOcsge2017",
            "DoubsOcsge2010",
            "DoubsOcsge2017",
            "JuraOcsge2010",
            "JuraOcsge2017",
            "NievreOcsge2011",
            "NievreOcsge2017",
            "HauteSaoneOcsge2011",
            "HauteSaoneOcsge2017",
            "SaoneEtLoireOcsge2011",
            "SaoneEtLoireOcsge2018",
            "YonneOcsge2011",
            "YonneOcsge2018",
            "BelfortOcsge2010",
            "BelfortOcsge2017",
            "CotedorOcsgeDiff1017",
            "DoubsOcsgeDiff1017",
            "JuraOcsgeDiff1017",
            "NievreOcsgeDiff1017",
            "HauteSaoneOcsgeDiff1017",
            "SaoneEtLoireOcsgeDiff1017",
            "YonneOcsgeDiff1118",
            "BelfortOcsgeDiff1017",
        ]
        for item in items:
            logger.info("process %s", item)
            call_command("load_ocsge", item=item, no_verbose=not options["verbose"])

        logger.info("Update department with OCS GE")
        call_command("setup_dept")

        logger.info("Build artificial area")
        call_command(
            "build_artificial_area", region="bourgogne", verbose=options["verbose"]
        )

        logger.info("Pre calculate data at city level")
        call_command(
            "build_commune_data", region="bourgogne", verbose=options["verbose"]
        )

        logger.info("End load OCS GE of Bourgogne-Franche Comté")
