from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class StatsPopulation:
    evolution: int


@dataclass(frozen=True, slots=True)
class PopulationStatsAggregation:
    start_date: int
    end_date: int
    population: list[StatsPopulation]


@dataclass(frozen=True, slots=True)
class PopulationStatsLand:
    land: Land
    start_date: int
    end_date: int
    population: list[StatsPopulation]
