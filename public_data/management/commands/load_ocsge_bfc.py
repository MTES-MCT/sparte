import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Load OCS GE of Bourgogne Franche Comté"

    def handle(self, *args, **options):
        logger.info("Start uploading OCS GE of Bourgogne Franche Comté")
        items = [
            # TEST "OcsgeCotedor2010",
            # "OcsgeCotedor2017",
            "OcsgeDoubs2010",
            "OcsgeDoubs2017",
            "OcsgeJura2010",
            "OcsgeJura2017",
            "OcsgeNievre2011",
            "OcsgeNievre2017",
            "OcsgeHauteSaone2011",
            "OcsgeHauteSaone2017",
            "OcsgeSaoneEtLoire2011",
            "OcsgeSaoneEtLoire2018",
            "OcsgeYonne2011",
            "OcsgeYonne2018",
            "OcsgeBelfort2010",
            "OcsgeBelfort2017",
        ]
        for item in items:
            call_command("load_ocsge", item=item, no_verbose=True)
        logger.info("End uploading OCS GE of Bourgogne Franche Comté")
