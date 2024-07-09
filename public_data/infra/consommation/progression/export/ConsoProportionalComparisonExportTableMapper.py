from public_data.domain.consommation.progression.ConsommationProgression import (
    ConsommationProgressionLand,
)


class ConsoProportionalComparisonExportTableMapper:
    @staticmethod
    def map(consommation_progression: list[ConsommationProgressionLand]):
        first_land_consommation = consommation_progression[0]
        headers = [str(object=conso.year) for conso in first_land_consommation.consommation] + ["Total"]

        rows = [
            [land_conso.land.name]
            + [round(annual_conso.total, 2) for annual_conso in land_conso.consommation]
            + [round(land_conso.total_conso_over_period, 2)]
            for land_conso in consommation_progression
        ]

        return {
            "headers": headers,
            "rows": rows,
        }
