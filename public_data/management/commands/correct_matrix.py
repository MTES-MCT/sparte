import logging

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import CouvertureUsageMatrix


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Utilise le décret pour déterminer les zones artificielles"

    def handle(self, *args, **options):
        logger.info("Update matrix to comply to décret")
        # first reinitialize
        CouvertureUsageMatrix.objects.all().update(
            is_artificial=False,
            is_consumed=None,
            is_natural=None,
            label=CouvertureUsageMatrix.LabelChoices.NONE,
        )
        # select artificial
        # code_cs = ["1.1.1.1", "1.1.1.2", "1.1.2.1", "1.1.2.2"]
        artificial = CouvertureUsageMatrix.objects.filter(
            Q(couverture__code__startswith="1.1.")
            | Q(couverture__code="2.2.1", usage__code__in=["2", "3", "5", "235"])
        )
        artificial.update(
            is_artificial=True,
            label=CouvertureUsageMatrix.LabelChoices.ARTIFICIAL,
        )
        logger.info("End")
