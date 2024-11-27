from abc import ABC, abstractmethod

from public_data.domain.consommation.entity.ConsommationStatistics import (
    ConsommationStatistics,
)
from public_data.models import Land


class BaseConsommationStatsService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatistics:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatistics]:
        raise NotImplementedError
