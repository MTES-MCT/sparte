import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Load usage, couverture and their matrix"

    def handle(self, *args, **options):
        call_command("loaddata", "public_data/models/fixtures/usage.json")
        call_command("loaddata", "public_data/models/fixtures/couverture.json")
        call_command("loaddata", "public_data/models/fixtures/matrix.json")
