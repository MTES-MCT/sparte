from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class ConsommationStatistics:
    land: Land
    start_date: int
    end_date: int
    total: float
    total_percent: float
