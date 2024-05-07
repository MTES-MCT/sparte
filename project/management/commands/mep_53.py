import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "mep_53"

    def handle(self, *args, **options):
        logger.info("Start mep_53")
        call_command("loaddata", "diagnostic_word/word_template_fixture.json")
        logger.info("End mep_53")
