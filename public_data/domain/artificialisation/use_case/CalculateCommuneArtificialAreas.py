from collections import defaultdict
from logging import getLogger

from django.contrib.gis.db.models import Union
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.db.models import Sum

from public_data.models.administration import Commune
from public_data.models.ocsge import ArtificialArea, Ocsge
from utils.db import DynamicSRIDTransform, fix_poly

logger = getLogger(__name__)


class CalculateCommuneArtificialAreas:
    @staticmethod
    def execute(commune: Commune):
        qs = Ocsge.objects.filter(
            mpoly__intersects=commune.mpoly,
            is_artificial=True,
            departement=commune.departement.source_id,
        )
        if not qs.exists():
            return

        qs = (
            qs.annotate(intersection=Intersection(MakeValid("mpoly"), commune.mpoly))
            .annotate(intersection_area=Area(DynamicSRIDTransform("intersection", "srid_source")))
            .values("year")
            .annotate(geom=MakeValid(Union("intersection")), surface=Sum("intersection_area"))
        )

        for result in qs:
            ArtificialArea.objects.update_or_create(
                city=commune.insee,
                year=result["year"],
                defaults={
                    "mpoly": fix_poly(result["geom"]),
                    "surface": result["surface"].sq_m / 10000,
                    "departement": commune.departement.source_id,
                    "srid_source": commune.srid_source,
                },
            )

        return ArtificialArea.objects.filter(city=commune.insee)
