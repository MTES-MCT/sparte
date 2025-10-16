from abc import ABC, abstractmethod

from public_data.domain.consommation.entity import ConsommationStatistics
from public_data.models.administration import LandModel


class BaseConsommationStatsService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: LandModel,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatistics:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[LandModel],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatistics]:
        raise NotImplementedError
