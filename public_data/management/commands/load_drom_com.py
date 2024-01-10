import logging

from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    def handle(self, *args, **options):
        call_command(
            "load_cerema",
            item=[
                "LoadCeremaGuadeloupe",
                "LoadCeremaMartinique",
                "LoadCeremaGuyane",
                "LoadCeremaLaReunion",
            ],
        )
        call_command("build_administrative_layers")
        call_command("load_scot")
        call_command("load_insee")
