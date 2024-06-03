from abc import ABC, abstractmethod

from public_data.models.administration import Land


class MissingPlanningCompetencyData(Exception):
    pass


class PlanningCompetencyService(ABC):
    @staticmethod
    @abstractmethod
    def planning_document_in_revision(self, land: Land) -> bool:
        pass

    @staticmethod
    @abstractmethod
    def has_planning_competency(self, land: Land) -> bool:
        """
        Whether the land has planning competency over its territory.
        Only communes and EPCI have planning competency in the sense of this method.

        Departement and region can have planning competency (RNU), but not over their entire
        territory, so they are not considered here.
        """
