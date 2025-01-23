from abc import ABC, abstractmethod

from public_data.domain.urbanisme.autorisation_logement.entity import (
    AutorisationLogementCollection,
)
from public_data.models import Land


class BaseAutorisationLogementProgressionService(ABC):
    @abstractmethod
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> AutorisationLogementCollection:
        raise NotImplementedError

    @abstractmethod
    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[AutorisationLogementCollection]:
        raise NotImplementedError
