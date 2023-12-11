import logging

from django.core.management.base import BaseCommand

from public_data.models import (
    ArtificialArea,
    Departement,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    # TODO: remove this command once it has run on stagin and production
    help = "Temporary command to remove temporary data for Gironde."

    def handle(self, *args, **options):
        """
        The command creates an approximate buffer of the Gironde extent
        padded by 500m and deletes all OCS GE related data (Ocsge,
        OcsgeDiff, ZoneConstruite) that intersects with it.
        """

        logger.info("Start removing OCSGE data in Gironde")

        gironde_mpoly = Departement.objects.get(name="Gironde").mpoly
        gironde_mpoly_lambert = gironde_mpoly.transform(2154, clone=True)

        buffer_size_in_meters = 5000

        gironde_mpoly_buffered = gironde_mpoly_lambert.buffer(buffer_size_in_meters)
        gironde_mpoly_buffered_wsg84 = gironde_mpoly_buffered.transform(4326, clone=True)

        ocsge_diff = OcsgeDiff.objects.filter(mpoly__intersects=gironde_mpoly_buffered_wsg84)

        logger.info(f"Found {ocsge_diff.count()} OcsgeDiff to delete")
        ocsge_diff.delete()

        ocsge = Ocsge.objects.filter(mpoly__intersects=gironde_mpoly_buffered_wsg84)

        logger.info(f"Found {ocsge.count()} Ocsge to delete")
        ocsge.delete()

        zone_construites = ZoneConstruite.objects.filter(mpoly__intersects=gironde_mpoly_buffered_wsg84)

        logger.info(f"Found {zone_construites.count()} ZoneConstruite to delete")
        zone_construites.delete()

        artificial_areas = ArtificialArea.objects.filter(mpoly__intersects=gironde_mpoly_buffered_wsg84)

        logger.info(f"Found {artificial_areas.count()} ArtificialArea to delete")
        artificial_areas.delete()

        logger.info("Finished removing OCSGE data in Gironde")
        logger.info("IMPORTANT: DO NOT RUN THIS COMMAND AGAIN AS IT WILL DELETE OCSGE DATA FROM NEARBY DEPARTMENTS")
