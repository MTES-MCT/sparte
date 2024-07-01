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

    @property
    def total_imper(self) -> float:
        return sum(item.imper for item in self.usage)

    @property
    def total_desimper(self) -> float:
        return sum(item.desimper for item in self.usage)

    @property
    def imper_nette(self) -> float:
        return self.total_imper - self.total_desimper
