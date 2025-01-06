from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class PopulationStatistics:
    land: Land
    start_date: int
    end_date: int
    evolution: int
    evolution_percent: float
