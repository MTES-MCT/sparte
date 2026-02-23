from abc import ABC, abstractmethod

from public_data.domain.urbanisme.logement_vacant.entity import LogementVacantCollection
from public_data.models import LandModel


class BaseLogementVacantProgressionService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: LandModel,
        start_date: int,
        end_date: int,
    ) -> LogementVacantCollection:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[LandModel],
        start_date: int,
        end_date: int,
    ) -> list[LogementVacantCollection]:
        raise NotImplementedError
