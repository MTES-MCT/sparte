from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AnnualConsommation:
    year: int
    habitat: float
    activite: float
    mixte: float
    route: float
    ferre: float
    non_renseigne: float
    total: float
    total_percent_of_area: float
