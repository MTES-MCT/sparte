from dataclasses import dataclass

from public_data.models import Land

from .AnnualAutorisationLogement import AnnualAutorisationLogement


@dataclass(frozen=True, slots=True)
class AutorisationLogementCollection:
    land: Land
    start_date: int
    end_date: int
    autorisation_logement: list[AnnualAutorisationLogement]
