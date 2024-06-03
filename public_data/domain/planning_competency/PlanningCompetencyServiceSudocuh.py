from public_data.domain.planning_competency.PlanningCompetencyService import (
    PlanningCompetencyService,
)
from public_data.models.administration import AdminRef, Commune, Epci, Land
from public_data.models.sudocuh import DocumentUrbanismeChoices, Sudocuh, SudocuhEpci


class PlanningCompetencyServiceSudocuh(PlanningCompetencyService):
    @staticmethod
    def commune_has_planning_competency(commune: Commune):
        sudocuh = Sudocuh.objects.get(code_insee=commune.insee)
        is_rnu = sudocuh.du_opposable == DocumentUrbanismeChoices.RNU

        if is_rnu and not sudocuh.du_en_cours:
            # planning is managed by departement and no document is in creation
            return False

        if is_rnu and sudocuh.du_en_cours in [
            DocumentUrbanismeChoices.PLUi,
            DocumentUrbanismeChoices.PLUiS,
            DocumentUrbanismeChoices.RNU,
        ]:
            # planning is managed by departement and the document in creation
            # is the competency of either an EPCI or the departement
            return False

        # At this step, remaining communes are either creating a PLU, CC, or POS
        # We only need to check if they are creating it themselves
        # (checked by the equality of the two fields below)
        return sudocuh.nom_commune == sudocuh.collectivite_porteuse

    @staticmethod
    def has_planning_competency(land: Land) -> bool:
        if land.land_type == AdminRef.EPCI:
            return SudocuhEpci.objects.get(siren=land.official_id).competence_plan

        if land.land_type == AdminRef.COMMUNE:
            return PlanningCompetencyServiceSudocuh.commune_has_planning_competency(
                commune=Commune.objects.get(insee=land.official_id)
            )

        # if the land is not a commune or an EPCI, it does not have planning competency
        return False

    @staticmethod
    def planning_document_in_revision(land: Land) -> bool:
        if land.land_type == AdminRef.COMMUNE:
            commune = Commune.objects.get(insee=land.official_id)
            return Sudocuh.objects.get(code_insee=commune.insee).du_en_cours is not None

        if land.land_type == AdminRef.EPCI:
            epci = Epci.objects.get(source_id=land.official_id)

            return Sudocuh.objects.get(siren_epci=epci.source_id).du_en_cours is not None

        return False
