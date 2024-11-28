from django.template.loader import render_to_string

from public_data.domain.consommation.entity.ConsommationStatistics import (
    ConsommationStatistics,
)
from public_data.domain.demography.population.entity import (
    AnnualPopulationCollection,
    PopulationStatistics,
)


class PopulationConsoComparisonTableMapper:
    @staticmethod
    def map(
        from_year: int,
        to_year: int,
        consommation_comparison_stats: list[ConsommationStatistics],
        population_comparison_stats: list[PopulationStatistics],
        population_comparison_progression: list[AnnualPopulationCollection],
    ):
        first_land_consommation = consommation_comparison_stats[0]

        land_type_label = first_land_consommation.land.land_type_label

        headers = [land_type_label] + [
            "Consommation (ha)",
            "Évolution démographique",
            f"Population totale {to_year}",
        ]

        data = [
            {
                "land_name": consommation_stats.land.name,
                "consommation_total": round(consommation_stats.total, 2),
                "evolution": int(population_stats.evolution),
                "evolution_percent": population_stats.evolution_percent,
                "population_total": int(population_progression.last_year_population.population),
            }
            for consommation_stats, population_stats, population_progression in zip(
                consommation_comparison_stats, population_comparison_stats, population_comparison_progression
            )
        ]

        return render_to_string(
            "public_data/partials/population_conso_comparison_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
