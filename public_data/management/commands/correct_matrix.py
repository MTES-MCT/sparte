import logging

from django.core.management.base import BaseCommand

from public_data.models import CouvertureUsageMatrix


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Replace None by False in Matrix"

    def handle(self, *args, **options):
        logger.info("Replace None by False in Matrix")
        CouvertureUsageMatrix.objects.filter(is_artificial__isnull=True).update(
            is_artificial=False
        )
        CouvertureUsageMatrix.objects.filter(is_consumed__isnull=True).update(
            is_consumed=False
        )
        CouvertureUsageMatrix.objects.filter(is_natural__isnull=True).update(
            is_natural=False
        )
        logger.info("End")
