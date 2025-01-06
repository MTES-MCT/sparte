from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class ConsommationStatistics:
    land: Land
    start_date: int
    end_date: int
    total: float
    activite: float
    habitat: float
    mixte: float
    route: float
    ferre: float
    non_renseigne: float
    total_percent_of_area: float
