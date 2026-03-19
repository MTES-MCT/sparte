from dataclasses import dataclass

from public_data.models import LandModel


@dataclass(frozen=True, slots=True)
class PopulationStatistics:
    land: LandModel
    start_date: int
    end_date: int
    evolution: int
    evolution_percent: float
