import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 7.0"

    def handle(self, *args, **options):
        call_command(command_name="fix_is_artif_carriere")
