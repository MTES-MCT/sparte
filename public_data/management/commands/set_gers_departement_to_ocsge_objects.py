import logging

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import (
    ArtificialArea,
    Departement,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    # TODO: remove this command once it has run on staging and production
    help = "Temporary command to set all Ocsge Objects to the Gers departement."

    def handle(self, *args, **options):
        logger.info("Start setting OCSGE data to Gers")

        gers = Departement.objects.get(name="Gers")
        ocsge_diff = OcsgeDiff.objects.filter(Q(departement__isnull=True) | Q(departement__name=""))
        ocsge_diff.update(departement=gers)

        ocsge = Ocsge.objects.filter(Q(departement__isnull=True) | Q(departement__name=""))
        ocsge.update(departement=gers)

        zone_construites = ZoneConstruite.objects.filter(Q(departement__isnull=True) | Q(departement__name=""))
        zone_construites.update(departement=gers)

        artificial_areas = ArtificialArea.objects.filter(Q(departement__isnull=True) | Q(departement__name=""))
        artificial_areas.update(departement=gers)

        logger.info("Finished setting OCSGE data to Gers")
