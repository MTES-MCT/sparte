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
    per_mille_of_area: float
