from dataclasses import dataclass

from public_data.models import Land

from .AnnualPopulation import AnnualPopulation


@dataclass(frozen=True, slots=True)
class AnnualPopulationCollection:
    land: Land
    start_date: int
    end_date: int
    population: list[AnnualPopulation]

    @property
    def first_year_population(self) -> AnnualPopulation:
        return self.population[0]

    @property
    def last_year_population(self) -> AnnualPopulation:
        return self.population[-1]
