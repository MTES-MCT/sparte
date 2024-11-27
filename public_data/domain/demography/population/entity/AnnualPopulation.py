from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AnnualPopulation:
    year: int
    population: int
    evolution: int
