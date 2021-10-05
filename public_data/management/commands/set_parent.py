import logging

from django.core.management.base import BaseCommand

from public_data.models import CouvertureSol, UsageSol


logging.basicConfig(level=logging.INFO)


class Command(BaseCommand):
    help = "This will reevaluate parent fields of all instances of Couverture and Usage"

    def handle(self, *args, **options):
        logging.info("Re-evaluate CouvertureSol parents of all instances")
        for couv in CouvertureSol.objects.all():
            couv.set_parent()
        logging.info("Re-evaluate UsageSol parents of all instances")
        for usage in UsageSol.objects.all():
            usage.set_parent()
