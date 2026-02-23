from abc import ABC, abstractmethod

from public_data.domain.consommation.entity import ConsommationStatisticsComparison
from public_data.models import LandModel


class BaseConsommationStatsComparisonService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: LandModel,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatisticsComparison:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[LandModel],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatisticsComparison]:
        raise NotImplementedError
