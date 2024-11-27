from abc import ABC, abstractmethod

from public_data.domain.demography.population.entity import (
    PopulationStatisticsComparison,
)
from public_data.models import Land


class BasePopulationStatsComparisonService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> PopulationStatisticsComparison:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[PopulationStatisticsComparison]:
        raise NotImplementedError
