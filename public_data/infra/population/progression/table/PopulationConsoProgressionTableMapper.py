from django.template.loader import render_to_string

from public_data.domain.consommation.progression.ConsommationProgression import (
    ConsommationProgressionLand,
)
from public_data.domain.demography.population.progression.PopulationProgression import (
    PopulationProgressionLand,
)


class PopulationConsoProgressionTableMapper:
    @staticmethod
    def map(
        consommation_progression: list[ConsommationProgressionLand],
        population_progression: list[PopulationProgressionLand],
    ):
        headers = [
            "Année",
            "Consommation totale (ha)",
            "Consommation à destination de l'habitat (ha)",
            "Population (hab)",
        ]

        data = [
            [
                str(consommation.year),
                round(consommation.total / 10000, 3),
                round(consommation.habitat / 10000, 3),
                (
                    f"{int(population.population)} "
                    + PopulationConsoProgressionTableMapper.get_trend(population.evolution)
                ),
            ]
            for consommation, population in zip(consommation_progression, population_progression)
        ]

        return render_to_string(
            "public_data/partials/population_conso_progression_table.html",
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
                f"+{int(evolution)} <i class='bi bi-arrow-up-right fr-ml-1w'></i></p>"
            )
        elif evolution < 0:
            return (
                f"<p class='fr-badge fr-badge--error fr-badge--sm fr-badge--no-icon fr-ml-1w'>"
                f"{int(evolution)} <i class='bi bi-arrow-down-right fr-ml-1w'></i></p>"
            )
        else:
            return ""
