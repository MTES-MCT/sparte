import logging

import celery
from django.core.management.base import BaseCommand

from public_data.models import ArtificialArea, Commune
from public_data.tasks import create_commune_artificial_area_if_not_exists

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "MEP 7.0"

    def handle(self, *args, **options):
        ArtificialArea.objects.all().delete()

        celery.group(
            [
                create_commune_artificial_area_if_not_exists.si(city.insee)
                for city in Commune.objects.filter(ocsge_available=True).all()
            ]
        ).apply_async()
