from dataclasses import dataclass


@dataclass(frozen=True)
class ImpermeabilisationDifferenceSol:
    code_prefix: str
    label: str
    label_short: str
    imper: float
    desimper: float


@dataclass(frozen=True)
class ImpermeabilisationDifference:
    start_date: int
    end_date: int
    usage: list[ImpermeabilisationDifferenceSol]
    couverture: list[ImpermeabilisationDifferenceSol]
