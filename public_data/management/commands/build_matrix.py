import logging

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import CouvertureUsageMatrix, CouvertureSol, UsageSol


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Utilise le décret pour déterminer les zones artificielles"

    def handle(self, *args, **options):
        logger.info("Update matrix to comply to décret")

        # add all keys with None
        for couv in CouvertureSol.objects.all():
            qs = CouvertureUsageMatrix.objects.filter(couverture=couv, usage=None)
            if not qs.exists():
                CouvertureUsageMatrix.objects.create(couverture=couv, usage=None)

        for usage in UsageSol.objects.all():
            qs = CouvertureUsageMatrix.objects.filter(couverture=None, usage=usage)
            if not qs.exists():
                CouvertureUsageMatrix.objects.create(couverture=None, usage=usage)

        for couv in CouvertureSol.objects.all():
            for usage in UsageSol.objects.all():
                qs = CouvertureUsageMatrix.objects.filter(couverture=couv, usage=usage)
                if not qs.exists():
                    CouvertureUsageMatrix.objects.create(couverture=couv, usage=usage)

        qs = CouvertureUsageMatrix.objects.filter(couverture=None, usage=None)
        if not qs.exists():
            CouvertureUsageMatrix.objects.create(couverture=None, usage=None)

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
            | Q(
                couverture__code__startswith="2.2.",
                usage__code__in=[
                    "2",
                    "3",
                    "5",
                    "235",
                    "4.1.1",
                    "4.1.2",
                    "4.1.3",
                    "4.1.4",
                    "4.1.5",
                    "4.2",
                    "4.3",
                ],
            )
        ).exclude(couverture__code="1.1.2.1", usage__code="1.3")
        artificial.update(
            is_artificial=True,
            label=CouvertureUsageMatrix.LabelChoices.ARTIFICIAL,
        )
        logger.info("End")
