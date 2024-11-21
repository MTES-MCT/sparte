from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class AnnualPopulation:
    year: int
    population: float
    evolution: float
    density: float


@dataclass(frozen=True, slots=True)
class AnnualPopulationLand:
    land: Land
    year: int
