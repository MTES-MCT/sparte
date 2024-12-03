from public_data.domain.consommation.entity import ConsommationCollection


class ConsoProportionalComparisonExportTableMapper:
    @staticmethod
    def map(consommation_progression: list[ConsommationCollection]):
        first_land_consommation = consommation_progression[0]
        headers = [str(object=conso.year) for conso in first_land_consommation.consommation] + ["Total"]

        rows = [
            {
                "name": land_conso.land.name,
                "data": [round(annual_conso.per_mille_of_area, 2) for annual_conso in land_conso.consommation]
                + [round(land_conso.total_proportional_conso_over_period, 2)],
            }
            for land_conso in consommation_progression
        ]

        return {
            "headers": headers,
            "rows": rows,
        }
