from django.contrib.gis.db.models.functions import Area
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.db.models import Case, DecimalField, F, Q, Sum, When
from django.db.models.functions import Cast

from public_data.models import OcsgeDiff


def get_geom_new_imper_and_desimper(
    geom: MultiPolygon,
    analyse_start_date: int,
    analyse_end_date: int,
) -> dict[str, list]:
    Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))

    changes_in_geom = {
        "usage": [],
        "couverture": [],
    }

    for sol in changes_in_geom.keys():
        short_sol = "us" if sol == "usage" else "cs"

        changes_in_geom[sol] = (
            OcsgeDiff.objects.intersect(geom)
            .filter(
                year_old__gte=analyse_start_date,
                year_new__lte=analyse_end_date,
            )
            .filter(Q(is_new_impermeable=True) | Q(is_new_not_impermeable=True))
            .annotate(
                code_prefix=Case(
                    When(is_new_impermeable=True, then=F(f"{short_sol}_new")),
                    default=F(f"{short_sol}_old"),
                ),
                area_imper=Case(When(is_new_impermeable=True, then=F("intersection_area")), default=Zero),
                area_desimper=Case(When(is_new_not_impermeable=True, then=F("intersection_area")), default=Zero),
            )
            .order_by("code_prefix")
            .values("code_prefix")
            .annotate(
                imper=Cast(Sum("area_imper") / 10000, DecimalField(max_digits=15, decimal_places=2)),
                desimper=Cast(Sum("area_desimper") / 10000, DecimalField(max_digits=15, decimal_places=2)),
            )
        )

    return changes_in_geom
