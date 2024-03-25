import logging

from django.contrib.gis.db.models.functions import PointOnSurface
from django.core.management.base import BaseCommand

from public_data.models import ArtificialArea, Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    """
    The build_artificial_area was not set to intiialize the departement_id property of the
    artificial area objects. This command readd the departement_id property based on
    geographical intersection with the departement layer.

    TODO: This command should be removed when the build_artificial_area is fixed on all
    environments.
    """

    help = "fix_artificial_area_missing_departement"

    def handle(self, *args, **options):
        logger.info(msg="Start fix_artificial_area_missing_departement")

        artificial_areas = ArtificialArea.objects.filter(departement_id__isnull=True).annotate(
            point_on_surface=PointOnSurface("mpoly")
        )

        for departement in Departement.objects.all():
            artificial_areas.filter(point_on_surface__intersects=departement.mpoly).update(
                departement_id=departement.id
            )

        logger.info(msg="End fix_artificial_area_missing_departement")
