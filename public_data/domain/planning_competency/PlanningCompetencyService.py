from abc import ABC, abstractmethod

from public_data.models.administration import Land


class MissingPlanningCompetencyData(Exception):
    pass


class PlanningCompetencyService(ABC):
    @abstractmethod
    @staticmethod
    def planning_document_in_revision(self, land: Land) -> bool:
        pass

    @abstractmethod
    @staticmethod
    def has_planning_competency(self, land: Land) -> bool:
        pass
