from abc import ABC, abstractmethod

from public_data.domain.demography.population.entity import AnnualPopulationCollection
from public_data.models import Land


class BasePopulationProgressionService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> AnnualPopulationCollection:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[AnnualPopulationCollection]:
        raise NotImplementedError
