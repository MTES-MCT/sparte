from dataclasses import dataclass

from public_data.models import Land

from .AnnualConsommation import AnnualConsommation


@dataclass(frozen=True, slots=True)
class ConsommationProgressionCollectionLand:
    land: Land
    start_date: int
    end_date: int
    consommation: list[AnnualConsommation]

    @property
    def total_conso_over_period(self) -> float:
        return sum([conso.total for conso in self.consommation])

    @property
    def total_proportional_conso_over_period(self) -> float:
        return sum([conso.per_mille_of_area for conso in self.consommation])
