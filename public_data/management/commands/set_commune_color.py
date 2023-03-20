import logging

from django.core.management.base import BaseCommand

from public_data.models import Commune
from utils.colors import get_blue_gradient

logging.basicConfig(level=logging.INFO)


class Command(BaseCommand):
    help = "This will reevaluate parent fields of all instances of Couverture and Usage"

    def handle(self, *args, **options):
        logging.info("Set map color of all communes")
        colours = get_blue_gradient(12)[::-1]
        to_update = list()
        for i, commune in enumerate(Commune.objects.all().order_by("name")):
            commune.map_color = colours[i % 12]
            to_update.append(commune)
        Commune.objects.bulk_update(to_update, ["map_color"], batch_size=1000)
        logging.info("End set map color")
