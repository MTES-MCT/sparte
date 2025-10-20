"""Tests for Consommation charts migrated to DiagnosticChart."""
from unittest.mock import Mock, patch

from django.test import TestCase

from project.charts import (
    AnnualConsoByDeterminantChart,
    AnnualConsoComparisonChart,
    AnnualConsoProportionalComparisonChart,
    AnnualTotalConsoChart,
    ConsoByDeterminantPieChart,
    PopulationConsoComparisonChart,
    PopulationConsoProgressionChart,
    PopulationDensityChart,
)
from public_data.models import LandModel
from utils.schema import init_unmanaged_schema_for_tests


class BaseChartTestCase(TestCase):
    """Base test case with common setup for chart tests."""

    def setUp(self):
        """Set up mock land and params for tests."""
        super().setUp()
        init_unmanaged_schema_for_tests()

        self.mock_land = Mock(spec=LandModel)
        self.mock_land.land_id = "12345"
        self.mock_land.land_type = "COMM"
        self.mock_land.name = "Test Territory"
        self.mock_land.official_id = "12345"

        # Create a more realistic land_proxy mock
        self.mock_land_proxy = Mock()
        self.mock_land_proxy.id = "12345"
        self.mock_land_proxy.name = "Test Territory"
        self.mock_land_proxy.official_id = "12345"
        self.mock_land_proxy.area = 1000.0
        self.mock_land.land_proxy = self.mock_land_proxy

        self.params = {
            "start_date": 2011,
            "end_date": 2021,
            "level": "COMM",
        }


class AnnualTotalConsoChartTest(BaseChartTestCase):
    """Tests for AnnualTotalConsoChart."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_chart_initialization(self, mock_service):
        """Test that chart initializes with land and params."""
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_data_property_calls_service(self, mock_service):
        """Test that data property calls the correct service."""
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)
        _ = chart.data

        mock_service.return_value.get_by_land.assert_called_once_with(
            land=self.mock_land,
            start_date=2011,
            end_date=2021,
        )

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_series_property_structure(self, mock_service):
        """Test that series property returns correct structure."""
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)
        series = chart.series

        self.assertIsInstance(series, list)
        self.assertTrue(len(series) > 0)
        self.assertIn("name", series[0])
        self.assertIn("data", series[0])

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_param_property_has_required_fields(self, mock_service):
        """Test that param property has all required Highcharts fields."""
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)
        param = chart.param

        self.assertIn("chart", param)
        self.assertIn("title", param)
        self.assertIn("xAxis", param)
        self.assertIn("yAxis", param)
        self.assertIn("series", param)
        self.assertEqual(param["chart"]["type"], "column")


class AnnualConsoByDeterminantChartTest(BaseChartTestCase):
    """Tests for AnnualConsoByDeterminantChart."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_chart_initialization(self, mock_service):
        """Test that chart initializes correctly."""
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualConsoByDeterminantChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertEqual(chart.params, self.params)


class ConsoByDeterminantPieChartTest(BaseChartTestCase):
    """Tests for ConsoByDeterminantPieChart."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_stats_service")
    def test_chart_initialization(self, mock_service):
        """Test that pie chart initializes correctly."""
        mock_stats = Mock()
        mock_service.return_value.get_by_land.return_value = mock_stats

        chart = ConsoByDeterminantPieChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)
        self.assertIn("start_date", chart.params)
        self.assertIn("end_date", chart.params)


class AnnualConsoComparisonChartTest(BaseChartTestCase):
    """Tests for AnnualConsoComparisonChart."""

    def setUp(self):
        """Set up with comparison lands."""
        super().setUp()
        self.params["comparison_lands"] = []

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_chart_with_comparison_lands(self, mock_service):
        """Test that chart handles comparison lands."""
        mock_service.return_value.get_by_lands.return_value = []

        chart = AnnualConsoComparisonChart(land=self.mock_land, params=self.params)

        self.assertIn("comparison_lands", chart.params)


class AnnualConsoProportionalComparisonChartTest(BaseChartTestCase):
    """Tests for AnnualConsoProportionalComparisonChart."""

    def setUp(self):
        """Set up with comparison lands."""
        super().setUp()
        self.params["comparison_lands"] = []

    @patch("public_data.domain.containers.PublicDataContainer.consommation_stats_service")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_chart_initialization(self, mock_progression_service, mock_stats_service):
        """Test that proportional chart initializes."""
        mock_progression_service.return_value.get_by_lands.return_value = []
        mock_stats_service.return_value.get_by_lands.return_value = []

        chart = AnnualConsoProportionalComparisonChart(land=self.mock_land, params=self.params)

        self.assertIn("comparison_lands", chart.params)


class PopulationDensityChartTest(BaseChartTestCase):
    """Tests for PopulationDensityChart."""

    @patch("public_data.domain.containers.PublicDataContainer.population_progression_service")
    def test_chart_initialization(self, mock_service):
        """Test that population density chart initializes."""
        # Create mock population data with at least one year
        mock_pop_item = Mock()
        mock_pop_item.year = 2021
        mock_pop_item.population = 10000

        mock_progression = Mock()
        mock_progression.population = [mock_pop_item]
        mock_service.return_value.get_by_land.return_value = mock_progression

        # Add surface/area to the mock land for density calculation
        self.mock_land.surface = 100  # hectares

        chart = PopulationDensityChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)


class PopulationConsoProgressionChartTest(BaseChartTestCase):
    """Tests for PopulationConsoProgressionChart."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.population_progression_service")
    def test_chart_initialization(self, mock_pop_service, mock_conso_service):
        """Test that population-conso progression chart initializes."""
        # Create mock population data
        mock_pop_item = Mock()
        mock_pop_item.year = 2021
        mock_pop_item.population = 10000
        mock_pop_item.population_calculated = False

        mock_pop_progression = Mock()
        mock_pop_progression.population = [mock_pop_item]
        mock_pop_service.return_value.get_by_land.return_value = mock_pop_progression

        # Create mock consommation data with numeric values for rounding
        mock_conso_item = Mock()
        mock_conso_item.year = 2021
        mock_conso_item.total = 10.5
        mock_conso_item.habitat = 5.25

        mock_conso_progression = Mock()
        mock_conso_progression.consommation = [mock_conso_item]
        mock_conso_service.return_value.get_by_land.return_value = mock_conso_progression

        chart = PopulationConsoProgressionChart(land=self.mock_land, params=self.params)

        self.assertEqual(chart.land, self.mock_land)


class PopulationConsoComparisonChartTest(BaseChartTestCase):
    """Tests for PopulationConsoComparisonChart."""

    def setUp(self):
        """Set up with comparison lands."""
        super().setUp()
        self.params["comparison_lands"] = []

    @patch("public_data.domain.containers.PublicDataContainer.population_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_comparison_service")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_stats_service")
    @patch("public_data.domain.containers.PublicDataContainer.population_stats_service")
    def test_chart_with_comparison_lands(
        self, mock_pop_service, mock_conso_service, mock_comparison_service, mock_pop_prog_service
    ):
        """Test that comparison chart handles multiple territories."""
        # Create mock land for comparison
        mock_land_item = Mock()
        mock_land_item.id = "12345"
        mock_land_item.land_id = "12345"
        mock_land_item.name = "Test Land"

        # Create mock stats with proper structure for bubble series
        mock_pop_stats = Mock()
        mock_pop_stats.land = mock_land_item
        mock_pop_stats.evolution = 100.0  # Non-zero for max() calculation

        mock_conso_stats = Mock()
        mock_conso_stats.land = mock_land_item
        mock_conso_stats.total = 10.5

        # Mock population progression for last year
        mock_pop_year = Mock()
        mock_pop_year.population = 10000

        mock_pop_progression = Mock()
        mock_pop_progression.land = mock_land_item
        mock_pop_progression.last_year_population = mock_pop_year

        # Mock comparison service with proper attributes
        mock_comparison_land = Mock()
        mock_comparison_land.name = "Test Territory"

        mock_comparison = Mock()
        mock_comparison.land = mock_comparison_land
        mock_comparison.relevance_level = "COMM"
        mock_comparison.median_ratio_pop_conso = 0.5  # Numeric value for division

        mock_comparison_service.return_value.get_by_land.return_value = mock_comparison

        mock_pop_service.return_value.get_by_lands.return_value = [mock_pop_stats]
        mock_conso_service.return_value.get_by_lands.return_value = [mock_conso_stats]
        mock_pop_prog_service.return_value.get_by_lands.return_value = [mock_pop_progression]

        chart = PopulationConsoComparisonChart(land=self.mock_land, params=self.params)

        self.assertIn("comparison_lands", chart.params)


class ChartIntegrationTest(BaseChartTestCase):
    """Integration tests to ensure all charts work together."""

    @patch("public_data.domain.containers.PublicDataContainer.consommation_comparison_service")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_stats_service")
    @patch("public_data.domain.containers.PublicDataContainer.population_progression_service")
    @patch("public_data.domain.containers.PublicDataContainer.population_stats_service")
    def test_all_charts_can_be_instantiated(
        self, mock_pop_stats, mock_pop_prog, mock_conso_stats, mock_conso_prog, mock_comparison
    ):
        """Test that all charts can be created without errors."""
        # Setup comprehensive mocks
        # Population progression mock
        mock_pop_item = Mock()
        mock_pop_item.year = 2021
        mock_pop_item.population = 10000
        mock_pop_item.population_calculated = False

        mock_pop_progression = Mock()
        mock_pop_progression.population = [mock_pop_item]
        mock_pop_prog.return_value.get_by_land.return_value = mock_pop_progression

        # Consommation progression mock
        mock_conso_item = Mock()
        mock_conso_item.year = 2021
        mock_conso_item.total = 10.5
        mock_conso_item.habitat = 5.25

        mock_conso_progression = Mock()
        mock_conso_progression.consommation = [mock_conso_item]
        mock_conso_prog.return_value.get_by_land.return_value = mock_conso_progression
        mock_conso_prog.return_value.get_by_lands.return_value = []

        # Stats mocks
        mock_conso_stats_obj = Mock()
        mock_conso_stats.return_value.get_by_land.return_value = mock_conso_stats_obj
        mock_conso_stats.return_value.get_by_lands.return_value = []

        mock_pop_stats.return_value.get_by_lands.return_value = []

        # Comparison service mock with proper structure
        mock_land_item = Mock()
        mock_land_item.id = "12345"
        mock_land_item.land_id = "12345"
        mock_land_item.name = "Test Land"

        mock_comparison_land = Mock()
        mock_comparison_land.name = "Test Territory"

        mock_comparison_obj = Mock()
        mock_comparison_obj.land = mock_comparison_land
        mock_comparison_obj.relevance_level = "COMM"
        mock_comparison_obj.median_ratio_pop_conso = 0.5
        mock_comparison.return_value.get_by_land.return_value = mock_comparison_obj

        # Mock population and consommation stats for comparison chart
        mock_pop_stat_item = Mock()
        mock_pop_stat_item.land = mock_land_item
        mock_pop_stat_item.evolution = 100.0

        mock_conso_stat_item = Mock()
        mock_conso_stat_item.land = mock_land_item
        mock_conso_stat_item.total = 10.5

        mock_pop_prog_item = Mock()
        mock_pop_prog_item.land = mock_land_item
        mock_pop_year = Mock()
        mock_pop_year.population = 10000
        mock_pop_prog_item.last_year_population = mock_pop_year

        mock_pop_stats.return_value.get_by_lands.return_value = [mock_pop_stat_item]
        mock_conso_stats.return_value.get_by_lands.return_value = [mock_conso_stat_item]
        mock_pop_prog.return_value.get_by_lands.return_value = [mock_pop_prog_item]

        # Add surface for density calculation
        self.mock_land.surface = 100

        params_with_comparison = {**self.params, "comparison_lands": []}

        charts_to_test = [
            (AnnualTotalConsoChart, self.params),
            (AnnualConsoByDeterminantChart, self.params),
            (ConsoByDeterminantPieChart, self.params),
            (AnnualConsoComparisonChart, params_with_comparison),
            (AnnualConsoProportionalComparisonChart, params_with_comparison),
            (PopulationDensityChart, self.params),
            (PopulationConsoProgressionChart, self.params),
            (PopulationConsoComparisonChart, params_with_comparison),
        ]

        for chart_class, params in charts_to_test:
            with self.subTest(chart=chart_class.__name__):
                chart = chart_class(land=self.mock_land, params=params)
                self.assertIsNotNone(chart)
                self.assertEqual(chart.land, self.mock_land)
