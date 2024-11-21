from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class ConsommationStats:
    total: int


@dataclass(frozen=True, slots=True)
class ConsommationStatsAggregation:
    start_date: int
    end_date: int
    consommation: list[ConsommationStats]


@dataclass(frozen=True, slots=True)
class ConsommationStatsLand:
    land: Land
    start_date: int
    end_date: int
    consommation: list[ConsommationStats]
