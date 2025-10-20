"""Tests for LogementVacant charts with required parameters validation."""
from unittest.mock import Mock, patch

from django.test import TestCase

from project.charts.urbanisme import (
    LogementVacantAutorisationLogementComparisonChart,
    LogementVacantAutorisationLogementRatioGaugeChart,
    LogementVacantAutorisationLogementRatioProgressionChart,
    LogementVacantConsoProgressionChart,
    LogementVacantProgressionChart,
    LogementVacantRatioProgressionChart,
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


class LogementVacantProgressionChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_service):
        """Test that chart initializes with valid land and params."""
        mock_progression = Mock()
        mock_progression.logement_vacant = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = LogementVacantProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_start_date(self):
        """Test that chart raises ValueError when start_date is missing."""
        params = {"end_date": "2023"}

        with self.assertRaises(ValueError) as context:
            LogementVacantProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: start_date", str(context.exception))

    def test_chart_initialization_missing_end_date(self):
        """Test that chart raises ValueError when end_date is missing."""
        params = {"start_date": "2019"}

        with self.assertRaises(ValueError) as context:
            LogementVacantProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: end_date", str(context.exception))

    def test_chart_initialization_missing_both_params(self):
        """Test that chart raises ValueError when both required params are missing."""
        params = {}

        with self.assertRaises(ValueError) as context:
            LogementVacantProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters", str(context.exception))
        self.assertIn("start_date", str(context.exception))
        self.assertIn("end_date", str(context.exception))


class LogementVacantRatioProgressionChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantRatioProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_service):
        """Test that chart initializes with valid params."""
        mock_progression = Mock()
        mock_progression.logement_vacant = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = LogementVacantRatioProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_params(self):
        """Test that chart raises ValueError when required params are missing."""
        params = {}

        with self.assertRaises(ValueError) as context:
            LogementVacantRatioProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters", str(context.exception))


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
        params = {"start_date": "2019"}  # Missing end_date

        with self.assertRaises(ValueError) as context:
            LogementVacantConsoProgressionChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters: end_date", str(context.exception))


class LogementVacantAutorisationLogementComparisonChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantAutorisationLogementComparisonChart."""

    @patch("public_data.domain.containers.PublicDataContainer.logement_vacant_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.autorisation_logement_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_auto_service, mock_lv_service):
        """Test that chart initializes with valid params."""
        mock_auto_progression = Mock()
        mock_auto_item = Mock()
        mock_auto_item.logements_autorises = 100
        mock_auto_item.percent_autorises_on_parc_general = 1.5
        mock_auto_progression.autorisation_logement = [mock_auto_item]
        mock_auto_progression.get_last_year_autorisation_logement.return_value = mock_auto_item
        mock_auto_service.return_value.get_by_land.return_value = mock_auto_progression

        mock_lv_progression = Mock()
        mock_lv_item = Mock()
        mock_lv_item.logements_vacants_parc_prive = 50
        mock_lv_item.logements_vacants_parc_social = 30
        mock_lv_item.logements_vacants_parc_prive_on_parc_general_percent = 2.0
        mock_lv_item.logements_vacants_parc_social_on_parc_general_percent = 1.2
        mock_lv_item.logements_vacants_parc_prive_percent = 1.29
        mock_lv_item.logements_vacants_parc_social_percent = 5.96
        mock_lv_progression.logement_vacant = [mock_lv_item]
        mock_lv_progression.get_last_year_logement_vacant.return_value = mock_lv_item
        mock_lv_service.return_value.get_by_land.return_value = mock_lv_progression

        chart = LogementVacantAutorisationLogementComparisonChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_params(self):
        """Test that chart raises ValueError when required params are missing."""
        params = {}

        with self.assertRaises(ValueError) as context:
            LogementVacantAutorisationLogementComparisonChart(land=self.mock_land, params=params)

        self.assertIn("Missing required parameters", str(context.exception))


class LogementVacantAutorisationLogementRatioGaugeChartTest(BaseLogementVacantChartTestCase):
    """Tests for LogementVacantAutorisationLogementRatioGaugeChart."""

    @patch("public_data.domain.containers.PublicDataContainer.autorisation_logement_progression_service")
    def test_chart_initialization_with_valid_params(self, mock_service):
        """Test that chart initializes with valid params."""
        mock_progression = Mock()
        mock_item = Mock()
        mock_item.percent_autorises_on_vacants_parc_general = 75.5
        mock_progression.autorisation_logement = [mock_item]
        mock_progression.get_last_year_autorisation_logement.return_value = mock_item
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = LogementVacantAutorisationLogementRatioGaugeChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    def test_chart_initialization_missing_params(self):
        """Test that chart raises ValueError when required params are missing."""
        params = {"start_date": "2019"}  # Missing end_date

        with self.assertRaises(ValueError) as context:
            LogementVacantAutorisationLogementRatioGaugeChart(land=self.mock_land, params=params)

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
        # Setup autorisation logement mock
        mock_auto_progression = Mock()
        mock_auto_item = Mock()
        mock_auto_item.logements_autorises = 100
        mock_auto_item.percent_autorises_on_parc_general = 1.5
        mock_auto_item.percent_autorises_on_vacants_parc_general = 75.5
        mock_auto_progression.autorisation_logement = [mock_auto_item]
        mock_auto_progression.get_last_year_autorisation_logement.return_value = mock_auto_item
        mock_auto_service.return_value.get_by_land.return_value = mock_auto_progression

        # Setup logement vacant mock
        mock_lv_progression = Mock()
        mock_lv_item = Mock()
        mock_lv_item.logements_vacants_parc_prive = 50
        mock_lv_item.logements_vacants_parc_social = 30
        mock_lv_item.logements_vacants_parc_prive_percent = 1.29
        mock_lv_item.logements_vacants_parc_social_percent = 5.96
        mock_lv_item.logements_vacants_parc_prive_on_parc_general_percent = 2.0
        mock_lv_item.logements_vacants_parc_social_on_parc_general_percent = 1.2
        mock_lv_item.logements_vacants_parc_general = 80
        mock_lv_progression.logement_vacant = [mock_lv_item]
        mock_lv_progression.get_last_year_logement_vacant.return_value = mock_lv_item
        mock_lv_service.return_value.get_by_land.return_value = mock_lv_progression

        # Setup consommation mock
        mock_conso_progression = Mock()
        mock_conso_item = Mock()
        mock_conso_item.total = 10.5
        mock_conso_item.habitat = 5.25
        mock_conso_progression.consommation = [mock_conso_item]
        mock_conso_service.return_value.get_by_land.return_value = mock_conso_progression

        charts_to_test = [
            LogementVacantProgressionChart,
            LogementVacantRatioProgressionChart,
            LogementVacantConsoProgressionChart,
            LogementVacantAutorisationLogementComparisonChart,
            LogementVacantAutorisationLogementRatioGaugeChart,
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
        invalid_params = {}  # No start_date or end_date

        charts_to_test = [
            LogementVacantProgressionChart,
            LogementVacantRatioProgressionChart,
            LogementVacantConsoProgressionChart,
            LogementVacantAutorisationLogementComparisonChart,
            LogementVacantAutorisationLogementRatioGaugeChart,
            LogementVacantAutorisationLogementRatioProgressionChart,
        ]

        for chart_class in charts_to_test:
            with self.subTest(chart=chart_class.__name__):
                with self.assertRaises(ValueError) as context:
                    chart_class(land=self.mock_land, params=invalid_params)

                self.assertIn("Missing required parameters", str(context.exception))
