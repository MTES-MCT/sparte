from django.template.loader import render_to_string

from public_data.domain.consommation.entity import ConsommationCollection


class ConsoComparisonMapper:
    @staticmethod
    def map(consommation_progression: list[ConsommationCollection]):
        first_land_consommation = consommation_progression[0]

        headers = [""] + [str(conso.year) for conso in first_land_consommation.consommation] + ["Total"]

        data = [
            [land_conso.land.name]
            + [round(annual_conso.total, 2) for annual_conso in land_conso.consommation]
            + [round(land_conso.total_conso_over_period, 2)]
            for land_conso in consommation_progression
        ]

        return render_to_string(
            "public_data/partials/conso_comparison_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
