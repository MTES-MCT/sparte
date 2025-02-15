from dataclasses import dataclass

from public_data.models import Land

from .AnnualConsommation import AnnualConsommation


@dataclass(frozen=True, slots=True)
class ConsommationCollection:
    land: Land
    start_date: int
    end_date: int
    consommation: list[AnnualConsommation]
    total_conso_over_period: float

    @property
    def total_percent_of_area_over_period(self) -> float:
        return sum([conso.total_percent_of_area for conso in self.consommation])
