from django.template.loader import render_to_string

from public_data.domain.consommation.entity import ConsommationCollection


class ConsoProportionalComparisonTableMapper:
    @staticmethod
    def map(consommation_progression: list[ConsommationCollection]):
        first_land_consommation = consommation_progression[0]
        land_type_label = first_land_consommation.land.land_type_label

        headers = [land_type_label] + [str(conso.year) for conso in first_land_consommation.consommation] + ["Total"]

        data = [
            [land_conso.land.name]
            + [round(annual_conso.per_mille_of_area, 2) for annual_conso in land_conso.consommation]
            + [round(land_conso.total_proportional_conso_over_period, 2)]
            for land_conso in consommation_progression
        ]

        return render_to_string(
            "public_data/partials/conso_proportional_comparison_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
