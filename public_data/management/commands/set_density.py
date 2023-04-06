import logging
import time

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import Departement, ZoneConstruite

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "This will reevaluate parent fields of all instances of Couverture and Usage"

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            type=str,
            help="insee code of a particular city",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help=("if you want to completly restart tables including id, not compatible " "with --item"),
        )

    def handle(self, *args, **options):
        logger.info("Set density in zone construites")
        self.last_log = time.time()
        qs = self.get_queryset(**options)
        total = qs.count()
        logger.info(f"To be processed: {total}")
        for i, zone in enumerate(qs):
            zone.set_built_density(save=True)
            self.print_progression(i, total)
        logger.info("End density in zone construites")

    def print_progression(self, i, total):
        if time.time() - self.last_log > 20:
            logger.info("Set density: %d%% %d/%d", round(100 * i / total, 0), i, total)
            self.last_log = time.time()

    def get_queryset(self, **options):
        qs = ZoneConstruite.objects.all()
        if options["departement"]:
            d = options["departement"]
            qs_dept = Departement.objects.filter(Q(source_id=d) | Q(name__icontains=d))
            if qs_dept.count() == 1:
                qs = qs.filter(mpoly__intersects=qs_dept.first().mpoly)
            else:
                raise ValueError("Departement options does not retrieve only 1 result")
        if not options["reset"]:
            qs = qs.filter(built_density=None)
        return qs
