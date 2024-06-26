from django.contrib.gis.db.models.functions import Area
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.db.models import Case, DecimalField, F, Q, Sum, When
from django.db.models.functions import Cast

from public_data.models import OcsgeDiff

from .ImpermeabilisationDifference import (
    ImpermeabilisationDifference,
    ImpermeabilisationDifferenceSol,
)


class ImpermeabilisationDifferenceService:
    @staticmethod
    def get_by_geom(
        geom: MultiPolygon,
        start_date: int,
        end_date: int,
    ) -> ImpermeabilisationDifference:
        Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))

        difference = ImpermeabilisationDifference(
            start_date=start_date,
            end_date=end_date,
            usage=[],
            couverture=[],
        )
        usage: list[ImpermeabilisationDifferenceSol] = []

        for sol in ["usage", "couverture"]:
            short_sol = "us" if sol == "usage" else "cs"

            result = (
                OcsgeDiff.objects.intersect(geom)
                .filter(
                    year_old__gte=start_date,
                    year_new__lte=end_date,
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

            for item in result:
                if sol == "usage":
                    usage.append(ImpermeabilisationDifferenceSol(**item))
                else:
                    difference.couverture.append(ImpermeabilisationDifferenceSol(**item))

        grouped: dict[str, ImpermeabilisationDifferenceSol] = {}

        for item in usage:
            if item.code_prefix == "US235":
                level_one_code = "US235"
            else:
                first_number_after_us = item.code_prefix.split("US")[1][0]
                level_one_code = f"US{first_number_after_us}"

            existing_aggregate: ImpermeabilisationDifference | None = grouped.get(level_one_code, None)

            if existing_aggregate:
                grouped[level_one_code] = ImpermeabilisationDifferenceSol(
                    code_prefix=level_one_code,
                    imper=item.imper + existing_aggregate.imper,
                    desimper=item.desimper + existing_aggregate.desimper,
                )
            else:
                grouped[level_one_code] = ImpermeabilisationDifferenceSol(
                    code_prefix=level_one_code,
                    imper=item.imper,
                    desimper=item.desimper,
                )

        for value in grouped.values():
            difference.usage.append(value)

        return difference
