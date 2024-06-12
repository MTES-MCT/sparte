from django.contrib.gis.db.models import Union
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.contrib.gis.geos import Polygon
from django.db.models import Sum
from django.db.models.functions import Coalesce

from public_data.models.administration import Commune
from public_data.models.enums import SRID
from public_data.models.ocsge import ArtificialArea, ZoneArtificielle
from utils.db import DynamicSRIDTransform, fix_poly

Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=SRID.LAMBERT_93))


class CalculateCommuneArtificialArea:
    @staticmethod
    def execute(commune: Commune) -> list[ArtificialArea]:
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

        return [
            ArtificialArea.objects.create(
                mpoly=fix_poly(artif_area["mpoly"]),
                year=artif_area["year"],
                city=commune.official_id,
                surface=artif_area["surface"].sq_m / 10000,
                departement=commune.departement.source_id,
            )
            for artif_area in qs
        ]
