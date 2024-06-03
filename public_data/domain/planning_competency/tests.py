from django.core.management import call_command
from django.test import TestCase

from public_data.models.administration import Commune, Epci, Land

from .PlanningCompetencyServiceSudocuh import PlanningCompetencyServiceSudocuh


class PlanningCompetencyServiceSudocuhTestCase(TestCase):
    def setUp(self) -> None:
        call_command(command_name="import_sudocuh")

    def test_commune_does_not_have_planning_competency(self):
        lyon = Commune.objects.get(insee="69123")
        land = Land(public_key=f"COMM_{lyon.id}")
        self.assertFalse(PlanningCompetencyServiceSudocuh.has_planning_competency(land))

    def test_commune_rnu_creating_planning_document_has_planning_competency(self):
        bregnier_cordon = Commune.objects.get(insee="01058")
        land = Land(public_key=f"COMM_{bregnier_cordon.id}")
        self.assertTrue(PlanningCompetencyServiceSudocuh.has_planning_competency(land))

    def test_epci_does_not_have_planning_competency(self):
        cc_dombes = Epci.objects.get(source_id="200069193")
        land = Land(public_key=f"EPCI_{cc_dombes.id}")
        self.assertFalse(PlanningCompetencyServiceSudocuh.has_planning_competency(land))

    def test_commune_have_planning_competency(self):
        ambronay = Commune.objects.get(insee="01007")
        land = Land(public_key=f"COMM_{ambronay.id}")
        self.assertTrue(PlanningCompetencyServiceSudocuh.has_planning_competency(land))

    def test_epci_have_planning_competency(self):
        ca_haut_bugey = Epci.objects.get(source_id="200042935")
        land = Land(public_key=f"EPCI_{ca_haut_bugey.id}")
        self.assertTrue(PlanningCompetencyServiceSudocuh.has_planning_competency(land))

    def test_commune_planning_document_in_revision(self):
        longes = Commune.objects.get(insee="69119")
        land = Land(public_key=f"COMM_{longes.id}")
        self.assertTrue(PlanningCompetencyServiceSudocuh.planning_document_in_revision(land))

    def test_commune_planning_document_not_in_revision(self):
        ambronay = Commune.objects.get(insee="01007")
        land = Land(public_key=f"COMM_{ambronay.id}")
        self.assertFalse(PlanningCompetencyServiceSudocuh.planning_document_in_revision(land))
