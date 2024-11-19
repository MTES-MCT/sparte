from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class AnnualPopulation:
    year: int
    population: int
    evolution: int


@dataclass(frozen=True, slots=True)
class PopulationProgressionAggregation:
    start_date: int
    end_date: int
    population: list[AnnualPopulation]


@dataclass(frozen=True, slots=True)
class PopulationProgressionLand:
    land: Land
    start_date: int
    end_date: int
    population: list[AnnualPopulation]
