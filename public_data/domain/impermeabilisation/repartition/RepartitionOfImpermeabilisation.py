from dataclasses import dataclass


@dataclass(frozen=True)
class RepartitionOfImpermeabilisationByCommunesSol:
    code_prefix: str
    label: str
    label_short: str
    surface: float


@dataclass(frozen=True)
class RepartitionOfImpermeabilisation:
    usage: list[RepartitionOfImpermeabilisationByCommunesSol]
    couverture: list[RepartitionOfImpermeabilisationByCommunesSol]
    year: int
