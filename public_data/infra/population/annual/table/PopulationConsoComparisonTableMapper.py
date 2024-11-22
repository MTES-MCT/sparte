from django.template.loader import render_to_string

from public_data.domain.consommation.stats.ConsommationStats import (
    ConsommationStatsLand,
)
from public_data.domain.demography.population.progression.PopulationProgression import (
    PopulationProgressionLand,
)
from public_data.domain.demography.population.stats.PopulationStats import (
    PopulationStatsLand,
)


class PopulationConsoComparisonTableMapper:
    @staticmethod
    def map(
        consommation_comparison_stats: list[ConsommationStatsLand],
        population_comparison_stats: list[PopulationStatsLand],
        population_comparison_progression: list[PopulationProgressionLand],
    ):
        first_land_consommation = consommation_comparison_stats[0]

        land_type_label = first_land_consommation.land.land_type_label

        headers = [land_type_label] + ["Consommation (ha)", "Évolution démographique (hab)", "Population totale (hab)"]

        data = [
            [land_conso.land.name] + [round(annual_conso.total, 2) for annual_conso in land_conso.consommation]
            for land_conso in consommation_comparison_stats
        ]

        data = [
            [
                consommation_stats.land.name,
                consommation_stats.consommation[0].total_hectare,
                (
                    f"{int(population_stats.population[0].evolution)} "
                    + PopulationConsoComparisonTableMapper.get_trend(population_stats.population[0].evolution_percent)
                ),
                int(population_progression.population[0].population),
            ]
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

    @staticmethod
    def get_trend(evolution: int) -> str:
        if evolution > 0:
            return (
                f"<p class='fr-badge fr-badge--success fr-badge--sm fr-badge--no-icon fr-ml-1w'>"
                f"+{round(evolution, 3)}% <i class='bi bi-arrow-up-right fr-ml-1w'></i></p>"
            )
        elif evolution < 0:
            return (
                f"<p class='fr-badge fr-badge--error fr-badge--sm fr-badge--no-icon fr-ml-1w'>"
                f"{round(evolution, 3)}% <i class='bi bi-arrow-down-right fr-ml-1w'></i></p>"
            )
        else:
            return ""
