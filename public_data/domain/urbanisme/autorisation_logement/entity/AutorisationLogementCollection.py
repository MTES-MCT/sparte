from dataclasses import dataclass

from public_data.models import Land

from .AnnualAutorisationLogement import AnnualAutorisationLogement


@dataclass(frozen=True, slots=True)
class AutorisationLogementCollection:
    land: Land
    start_date: int
    end_date: int
    autorisation_logement: list[AnnualAutorisationLogement]

    def get_last_year_autorisation_logement(self) -> AnnualAutorisationLogement | None:
        try:
            return self.autorisation_logement[-1]
        except IndexError:
            return None
