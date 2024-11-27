from django.template.loader import render_to_string

from public_data.domain.consommation.entity import AnnualConsommation
from public_data.domain.demography.population.entity import AnnualPopulation


class PopulationConsoProgressionTableMapper:
    @staticmethod
    def map(
        consommation_progression: list[AnnualConsommation],
        population_progression: list[AnnualPopulation],
    ):
        headers = [
            "Année",
            "Consommation totale (ha)",
            "Consommation à destination de l'habitat (ha)",
            "Population (hab)",
        ]

        data = [
            {
                "year": str(consommation.year),
                "total": round(consommation.total, 2),
                "habitat": round(consommation.habitat, 2),
                "population": int(population.population),
                "evolution": int(population.evolution),
            }
            for consommation, population in zip(consommation_progression, population_progression)
        ]

        return render_to_string(
            "public_data/partials/population_conso_progression_table.html",
            {
                "headers": headers,
                "data": data,
            },
        )
