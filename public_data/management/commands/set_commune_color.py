import logging

from django.core.management.base import BaseCommand

from utils.colors import get_color_gradient

from public_data.models import Commune


logging.basicConfig(level=logging.INFO)


class Command(BaseCommand):
    help = "This will reevaluate parent fields of all instances of Couverture and Usage"

    def handle(self, *args, **options):
        logging.info("Set map color of all communes")
        colours = get_color_gradient(color_name="Yellow", scale=12)[::-1]
        # cnt_max = Commune.objects.all().count()
        # step = int(cnt_max / 11)
        # for i in range(0, 12):
        #     start = i * step
        #     end = (i + 1) * step
        #     qs = Commune.objects.all().filter(id__gte=start, id__lt=end)
        #     qs.update(map_color=colours.pop())
        to_update = list()
        for i, commune in enumerate(Commune.objects.all().order_by("name")):
            commune.map_color = colours[i % 12]
            to_update.append(commune)
        Commune.objects.bulk_update(to_update, ["map_color"], batch_size=1000)
        logging.info("End set map color")
