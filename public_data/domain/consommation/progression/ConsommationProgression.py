from dataclasses import dataclass


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


@dataclass(frozen=True, slots=True)
class ConsommationProgressionAggregation:
    start_date: int
    end_date: int
    communes_code_insee: list[str]
    consommation: list[AnnualConsommation]


@dataclass(frozen=True, slots=True)
class ConsommationProgressionByCommune:
    commune_code_insee: str
    start_date: int
    end_date: int
    consommation: list[AnnualConsommation]
