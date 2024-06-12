from logging import getLogger

from django.contrib.gis.db.models import Union
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.contrib.gis.geos import Polygon
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.db.models.query import QuerySet

from public_data.models.administration import Commune
from public_data.models.enums import SRID
from public_data.models.ocsge import ArtificialArea, ZoneArtificielle
from utils.db import DynamicSRIDTransform, fix_poly

logger = getLogger(__name__)

Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=SRID.LAMBERT_93))


class CalculateCommuneArtificialAreas:
    @staticmethod
    def execute(commune: Commune) -> QuerySet[ArtificialArea]:
        """
        This method calculates the artificial area objects of a commune by intersecting the commune
        with the ZoneArticielle.

        It returns a list of ArtificialArea objects, one for each year of available ZoneArtificielle.
        """
        qs = (
            ZoneArtificielle.objects.filter(
                mpoly__intersects=commune.mpoly,
                departement=commune.departement.source_id,
                # we need to filter by departement because the source data is not always
                # perfectly cut by departement. Not filtering by departement would return
                # ZoneArtificielle from other departements, which might be from other
                # years, and the code below would create ArtificialArea with wrong years.
            )
            .annotate(
                intersection=Intersection(MakeValid("mpoly"), commune.mpoly),
                intersection_area=Coalesce(
                    Area(DynamicSRIDTransform("intersection", "srid_source")),
                    Zero,
                ),
            )
            .values("year")  # equivalent to group by year
            .annotate(
                mpoly=MakeValid(Union("intersection")),
                surface=Sum("intersection_area"),
            )
        )

        created_artif_areas = []
        count_newly_created = 0

        for artif_area in qs:
            create_artif_area, is_new = ArtificialArea.objects.update_or_create(
                year=artif_area["year"],
                city=commune.official_id,
                defaults={
                    "mpoly": fix_poly(artif_area["mpoly"]),
                    "surface": artif_area["surface"].sq_m / 10000,
                    "departement": commune.departement.source_id,
                },
            )
            created_artif_areas.append(create_artif_area)
            if is_new:
                count_newly_created += 1

        logger.info(
            f"Calculated {len(created_artif_areas)} artificial areas for {commune.official_id}. "
            f"{count_newly_created} were newly created."
        )

        return ArtificialArea.objects.filter(id__in=[artif_area.id for artif_area in created_artif_areas])
