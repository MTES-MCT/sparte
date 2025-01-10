from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AnnualAutorisationLogement:
    year: int
    logements_autorises: int
    percent_autorises_on_parc_general: float
