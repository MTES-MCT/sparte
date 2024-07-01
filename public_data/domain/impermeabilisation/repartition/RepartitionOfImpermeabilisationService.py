from django.db.models import F, Sum
from django.db.models.fields import FloatField
from django.db.models.query import QuerySet

from public_data.models import Commune, CommuneSol

from .RepartitionOfImpermeabilisation import (
    RepartitionOfImpermeabilisation,
    RepartitionOfImpermeabilisationByCommunesSol,
)


class RepartitionOfImpermeabilisationService:
    @staticmethod
    def get_by_communes(communes: QuerySet[Commune], year: int) -> RepartitionOfImpermeabilisation:
        commune_sols = CommuneSol.objects.filter(
            city__in=communes,
            matrix__is_impermeable=True,
            year=year,
        )

        repartition = RepartitionOfImpermeabilisation(
            usage=[],
            couverture=[],
            year=year,
        )

        for sol in ["usage", "couverture"]:
            result = (
                commune_sols.annotate(
                    code_prefix=F(f"matrix__{sol}__code_prefix"),
                    label=F(f"matrix__{sol}__label"),
                    label_short=F(f"matrix__{sol}__label_short"),
                )
                .order_by("code_prefix", "label", "label_short")
                .values("code_prefix", "label", "label_short")
                .annotate(surface=Sum("surface", output_field=FloatField()))
            )

            for item in result:
                if sol == "usage":
                    repartition.usage.append(RepartitionOfImpermeabilisationByCommunesSol(**item))
                else:
                    repartition.couverture.append(RepartitionOfImpermeabilisationByCommunesSol(**item))

        return repartition
