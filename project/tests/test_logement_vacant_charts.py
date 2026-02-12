"""Tests for LogementVacant charts with required parameters validation."""
from unittest.mock import Mock, patch

from django.test import TestCase

from project.charts.urbanisme import (
    LogementVacantAutorisationLogementRatioProgressionChart,
    LogementVacantConsoProgressionChart,
    LogementVacantTauxProgressionChart,
)
from public_data.models import LandModel
from utils.schema import init_unmanaged_schema_for_tests


class BaseLogementVacantChartTestCase(TestCase):
    """Base test case with common setup for logement vacant chart tests."""

    def setUp(self):
        """Set up mock land and params for tests."""
        super().setUp()
        init_unmanaged_schema_for_tests()

        self.mock_land = Mock(spec=LandModel)
        self.mock_land.land_id = "69123"
        self.mock_land.land_type = "COMM"
        self.mock_land.name = "Lyon 3e"
        self.mock_land.official_id = "69123"

        self.params = {
            "start_date": "2019",
            "end_date": "2023",
        }


class LogementVacantTauxProgressionChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantTauxProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_service):
        """Test that chart initializes with valid land and params."""
        mock_progression = Mock()
        mock_progression.logement_vacant = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = LogementVacantTauxProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_start_date(self):
        """Test that chart raises ValueError when start_date is missing."""
        params = {"end_date": "2023"}

        with self.assertRaises(ValueError) as context:
            LogementVacantTauxProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: start_date", str(context.exception))

    def test_chart_initialization_missing_end_date(self):
        """Test that chart raises ValueError when end_date is missing."""
        params = {"start_date": "2019"}

        with self.assertRaises(ValueError) as context:
            LogementVacantTauxProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: end_date", str(context.exception))

    def test_chart_initialization_missing_both_params(self):
        """Test that chart raises ValueError when both required params are missing."""
        params = {}

        with self.assertRaises(ValueError) as context:
            LogementVacantTauxProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters", str(context.exception))
        self.assertIn("start_date", str(context.exception))
        self.assertIn("end_date", str(context.exception))


class LogementVacantConsoProgressionChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantConsoProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_lv_service, mock_conso_service):
        """Test that chart initializes with valid params."""
        mock_lv_progression = Mock()
        mock_lv_progression.logement_vacant = []
        mock_lv_service.return_value.get_by_land.return_value = mock_lv_progression

        mock_conso_progression = Mock()
        mock_conso_progression.consommation = []
        mock_conso_service.return_value.get_by_land.return_value = mock_conso_progression

        chart = LogementVacantConsoProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_params(self):
        """Test that chart raises ValueError when required params are missing."""
        params = {"start_date": "2019"}

        with self.assertRaises(ValueError) as context:
            LogementVacantConsoProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: end_date", str(context.exception))


class LogementVacantAutorisationLogementRatioProgressionChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantAutorisationLogementRatioProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.autorisation_logement_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_service):
        """Test that chart initializes with valid params."""
        mock_progression = Mock()
        mock_item = Mock()
        mock_item.percent_autorises_on_vacants_parc_general = 75.5
        mock_progression.autorisation_logement = [mock_item]
        mock_progression.get_last_year_autorisation_logement.return_value = mock_item
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = LogementVacantAutorisationLogementRatioProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_params(self):
        """Test that chart raises ValueError when required params are missing."""
        params = {}

        with self.assertRaises(ValueError) as context:
            LogementVacantAutorisationLogementRatioProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters", str(context.exception))


class LogementVacantChartIntegrationTest(BaseLogementVacantChartTestCase):
    """Integration tests to ensure all logement vacant charts work together."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.autorisation_logement_progression_service")
    def test_all_charts_can_be_instantiated(self, mock_auto_service, mock_lv_service, mock_conso_service):
        """Test that all logement vacant charts can be created without errors."""
        mock_auto_progression = Mock()
        mock_auto_item = Mock()
        mock_auto_item.logements_autorises = 100
        mock_auto_item.percent_autorises_on_parc_general = 1.5
        mock_auto_item.percent_autorises_on_vacants_parc_general = 75.5
        mock_auto_progression.autorisation_logement = [mock_auto_item]
        mock_auto_progression.get_last_year_autorisation_logement.return_value = mock_auto_item
        mock_auto_service.return_value.get_by_land.return_value = mock_auto_progression

        mock_lv_progression = Mock()
        mock_lv_progression.logement_vacant = []
        mock_lv_service.return_value.get_by_land.return_value = mock_lv_progression

        mock_conso_progression = Mock()
        mock_conso_progression.consommation = []
        mock_conso_service.return_value.get_by_land.return_value = mock_conso_progression

        charts_to_test = [
            LogementVacantTauxProgressionChart,
            LogementVacantConsoProgressionChart,
            LogementVacantAutorisationLogementRatioProgressionChart,
        ]

        for chart_class in charts_to_test:
            with self.subTest(chart=chart_class.__name__):
                chart = chart_class(land=self.mock_land, params=self.params)
                self.assertIsNotNone(chart)
                self.assertEqual(chart.land, self.mock_land)
                self.assertEqual(chart.params, self.params)

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.autorisation_logement_progression_service")
    def test_all_charts_reject_invalid_params(self, mock_auto_service, mock_lv_service, mock_conso_service):
        """Test that all charts reject invalid (missing) parameters."""
        invalid_params = {}

        charts_to_test = [
            LogementVacantTauxProgressionChart,
            LogementVacantConsoProgressionChart,
            LogementVacantAutorisationLogementRatioProgressionChart,
        ]

        for chart_class in charts_to_test:
            with self.subTest(chart=chart_class.__name__):
                with self.assertRaises(ValueError) as context:
                    chart_class(land=self.mock_land, params=invalid_params)

                self.assertIn("Missing required parameters", str(context.exception))
