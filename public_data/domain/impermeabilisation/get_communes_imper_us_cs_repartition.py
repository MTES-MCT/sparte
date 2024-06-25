from django.db.models import F, Sum
from django.db.models.query import QuerySet

from public_data.models import Commune, CommuneSol


def get_communes_imper_us_cs_repartition(communes: QuerySet[Commune], year: int) -> dict[str, list]:
    commune_sols = CommuneSol.objects.filter(
        city__in=communes,
        matrix__is_impermeable=True,
        year=year,
    )

    repartition = {
        "usage": [],
        "couverture": [],
    }

    for sol in repartition.keys():
        repartition[sol] = (
            commune_sols.annotate(
                code_prefix=F(f"matrix__{sol}__code_prefix"),
                label=F(f"matrix__{sol}__label"),
                label_short=F(f"matrix__{sol}__label_short"),
            )
            .order_by("code_prefix", "label", "label_short")
            .values("code_prefix", "label", "label_short")
            .annotate(surface=Sum("surface"))
        )

    return repartition
