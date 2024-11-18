from dataclasses import dataclass

from public_data.models import Land


@dataclass(frozen=True, slots=True)
class AnnualConsommation:
    year: int
    habitat: float
    activite: float
    mixte: float
    route: float
    ferre: float
    non_reseigne: float
    total: float
    per_mille_of_area: float


@dataclass(frozen=True, slots=True)
class ConsommationProgressionAggregation:
    start_date: int
    end_date: int
    consommation: list[AnnualConsommation]


@dataclass(frozen=True, slots=True)
class ConsommationProgressionLand:
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
