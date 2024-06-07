import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 6.0"

    def handle(self, *args, **options):
        logger.info("Start mep_6")
        call_command("import_sudocuh")
        call_command("loaddata", "diagnostic_word/word_template_fixture.json")
        logger.info("End mep_6")
