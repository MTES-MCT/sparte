from dataclasses import dataclass

from public_data.models import Land

from .AnnualLogementVacant import AnnualLogementVacant


@dataclass(frozen=True, slots=True)
class LogementVacantCollection:
    land: Land
    start_date: int
    end_date: int
    logement_vacant: list[AnnualLogementVacant]

    def get_last_year_logement_vacant(self) -> AnnualLogementVacant | None:
        try:
            return self.logement_vacant[-1]
        except IndexError:
            return None
