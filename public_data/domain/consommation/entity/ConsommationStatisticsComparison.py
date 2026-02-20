from dataclasses import dataclass

from public_data.models import LandModel


@dataclass(frozen=True, slots=True)
class ConsommationStatisticsComparison:
    land: LandModel
    relevance_level: str
    start_date: int
    end_date: int
    median_ratio_pop_conso: float
