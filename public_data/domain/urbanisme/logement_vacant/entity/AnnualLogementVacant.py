from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AnnualLogementVacant:
    year: int
    logements_parc_prive: int
    logements_vacants_parc_prive: int
    logements_parc_social: float
    logements_vacants_parc_social: float
    logements_vacants_parc_prive_percent: float
    logements_vacants_parc_social_percent: float
    logements_vacants_parc_general: float
    logements_vacants_parc_prive_on_parc_general_percent: float
    logements_vacants_parc_social_on_parc_general_percent: float
