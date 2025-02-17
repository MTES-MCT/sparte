from abc import ABC, abstractmethod

from include.domain.data.ocsge.entities.OcsgeSource import OcsgeSource
from include.domain.data.ocsge.enums import SourceName


class BaseOcsgeSourceService(ABC):
    @abstractmethod
    def get(self, year: int, departement: str, type: SourceName) -> OcsgeSource:
        pass

    @abstractmethod
    def get_all(self) -> list[OcsgeSource]:
        pass
