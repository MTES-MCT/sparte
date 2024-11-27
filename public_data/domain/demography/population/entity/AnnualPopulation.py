from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AnnualPopulation:
    year: int
    population: int
    evolution: int
    population_calculated: bool
    evolution_calculated: bool
    # Si la valeur de calculated est True, cela signifie que la population ne vient pas d'une source officielle
