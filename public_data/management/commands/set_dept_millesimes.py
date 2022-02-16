import logging

from django.core.management.base import BaseCommand

from public_data.models import Ocsge, Departement


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Will go through all departements and set available millesimes for each"

    def handle(self, *args, **options):
        logger.info("Set departement millesimes")
        qs_depts = Departement.objects.all()
        count = qs_depts.count()
        logger.info("%s departements found", count)
        last = 0
        for i, dept in enumerate(qs_depts):
            items = Ocsge.objects.filter(mpoly__intersects=dept.mpoly)
            years = items.values_list("year", flat=True).distinct()
            dept.ocsge_millesimes = ";".join(str(y) for y in years)
            dept.save()
            progression = int(10 * i / count)
            if progression > last:
                last = progression
                print(f"{progression*10}%")
