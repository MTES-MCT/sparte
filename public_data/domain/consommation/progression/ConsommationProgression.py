from dataclasses import dataclass


@dataclass(frozen=True)
class AnnualConsommation:
    year: int
    habitat: float
    activite: float
    mixte: float
    route: float
    ferre: float
    non_reseigne: float
    total: float


@dataclass(frozen=True)
class ConsommationProgression:
    start_date: int
    end_date: int
    consommation: list[AnnualConsommation]
