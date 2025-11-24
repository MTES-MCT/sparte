"""
Tests for AnnualTotalConsoChart, focusing on complex interdepartmental logic.

This file tests the complex behavior of data_table when dealing with:
- Départements containing fully covered EPCIs
- Départements containing partially covered EPCIs (interdépartemental)
- Display of communes that compose interdepartmental EPCIs
"""
from unittest.mock import Mock, patch

from django.test import TestCase

from project.charts import AnnualTotalConsoChart
from public_data.models import AdminRef, LandModel
from utils.schema import init_unmanaged_schema_for_tests


class AnnualTotalConsoChartBasicTest(TestCase):
    """Basic tests for AnnualTotalConsoChart."""

    def setUp(self):
        """Set up mock land and params for tests."""
        super().setUp()
        init_unmanaged_schema_for_tests()

        self.mock_land = Mock(spec=LandModel)
        self.mock_land.land_id = "69"
        self.mock_land.land_type = AdminRef.DEPARTEMENT
        self.mock_land.name = "Rhône"
        self.mock_land.official_id = "69"

        self.mock_land_proxy = Mock()
        self.mock_land_proxy.id = "69"
        self.mock_land_proxy.name = "Rhône"
        self.mock_land_proxy.official_id = "69"
        self.mock_land_proxy.area = 100000.0
        self.mock_land.land_proxy = self.mock_land_proxy

        self.params = {
            "start_date": 2011,
            "end_date": 2021,
        }

    def _create_mock_annual_consumption(self, year, total=10.5, habitat=5.0, activite=3.0):
        """Helper to create mock AnnualConsommation objects."""
        mock_conso = Mock()
        mock_conso.year = year
        mock_conso.total = total
        mock_conso.habitat = habitat
        mock_conso.activite = activite
        mock_conso.mixte = 1.0
        mock_conso.route = 0.5
        mock_conso.ferre = 0.5
        mock_conso.non_renseigne = 0.5
        return mock_conso

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
    def test_data_property_caches_result(self, mock_service):
        """Test that data property caches the service call result."""
        mock_progression = Mock()
        mock_progression.consommation = [
            self._create_mock_annual_consumption(2011, 10.0),
            self._create_mock_annual_consumption(2012, 12.0),
        ]
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)

        # First access
        data1 = chart.data
        # Second access
        data2 = chart.data

        # Should only call service once due to caching
        mock_service.return_value.get_by_land.assert_called_once()
        self.assertIs(data1, data2)

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_series_with_real_data(self, mock_service):
        """Test series generation with realistic consumption data."""
        mock_progression = Mock()
        mock_progression.consommation = [
            self._create_mock_annual_consumption(2011, 10.5),
            self._create_mock_annual_consumption(2012, 12.3),
            self._create_mock_annual_consumption(2013, 8.7),
        ]
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_land, params=self.params)
        series = chart.series

        self.assertEqual(len(series), 1)
        self.assertEqual(series[0]["name"], "Rhône")
        self.assertEqual(len(series[0]["data"]), 3)

        # Verify data points
        self.assertEqual(series[0]["data"][0]["name"], "2011")
        self.assertEqual(series[0]["data"][0]["y"], 10.5)
        self.assertEqual(series[0]["data"][1]["y"], 12.3)
        self.assertEqual(series[0]["data"][2]["y"], 8.7)


class AnnualTotalConsoChartInterdepartementalTest(TestCase):
    """
    Tests for interdepartmental EPCI logic in data_table.

    Scenario: Département du Rhône (69) contains:
    - EPCI A: Fully within Rhône (not interdepartmental)
    - EPCI B: Partially in Rhône, partially in Loire (42) - INTERDEPARTMENTAL
      - Commune B1: In Rhône
      - Commune B2: In Rhône
      - Commune B3: In Loire (not in our département)
    """

    def setUp(self):
        """Set up complex scenario with interdepartmental EPCI."""
        super().setUp()
        init_unmanaged_schema_for_tests()

        # Département du Rhône (69)
        self.mock_depart = Mock(spec=LandModel)
        self.mock_depart.land_id = "69"
        self.mock_depart.land_type = AdminRef.DEPARTEMENT
        self.mock_depart.name = "Rhône"
        self.mock_depart.child_land_types = [AdminRef.EPCI]

        self.params = {
            "start_date": 2011,
            "end_date": 2013,
            "child_type": AdminRef.EPCI,
        }

    def _create_mock_epci(self, land_id, name, is_interdepartemental=False, parent_keys=None):
        """Create mock EPCI."""
        mock_epci = Mock(spec=LandModel)
        mock_epci.land_id = land_id
        mock_epci.land_type = AdminRef.EPCI
        mock_epci.name = name
        mock_epci.is_interdepartemental = is_interdepartemental
        mock_epci.parent_keys = parent_keys or ["DEPART_69"]

        if is_interdepartemental:
            mock_epci.child_land_types = [AdminRef.COMMUNE]
        else:
            mock_epci.child_land_types = []

        return mock_epci

    def _create_mock_commune(self, land_id, name, parent_keys):
        """Create mock Commune."""
        mock_comm = Mock(spec=LandModel)
        mock_comm.land_id = land_id
        mock_comm.land_type = AdminRef.COMMUNE
        mock_comm.name = name
        mock_comm.parent_keys = parent_keys
        mock_comm.is_interdepartemental = False
        return mock_comm

    def _create_mock_conso(self, land_id, land_type, year, total):
        """Create mock LandConso."""
        mock = Mock()
        mock.land_id = land_id
        mock.land_type = land_type
        mock.year = year
        mock.total = total * 10000  # Convert ha to m²
        return mock

    @patch("project.charts.AnnualTotalConsoChart.LandConso")
    @patch("project.charts.AnnualTotalConsoChart.LandModel")
    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_data_table_with_interdepartmental_epci(  # noqa: C901
        self, mock_service, mock_landmodel_class, mock_landconso_class
    ):
        """
        Test data_table displays:
        - EPCI A (fully in département) with its total
        - Communes B1, B2 (from interdepartmental EPCI B, only those in Rhône)
        - NOT Commune B3 (in Loire)
        - EPCI B total = sum of B1 + B2 (not including B3)
        """
        # Setup: Main chart data (empty for this test, we focus on data_table)
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        # Setup: EPCIs in the département
        epci_a = self._create_mock_epci("200001", "EPCI A", is_interdepartemental=False)
        epci_b = self._create_mock_epci(
            "200002",
            "EPCI B",
            is_interdepartemental=True,
            parent_keys=["DEPART_69", "DEPART_42"],
        )

        # Setup: Communes of interdepartmental EPCI B
        commune_b1 = self._create_mock_commune("69001", "Commune B1", ["EPCI_200002", "DEPART_69"])
        commune_b2 = self._create_mock_commune("69002", "Commune B2", ["EPCI_200002", "DEPART_69"])
        # commune_b3 in Loire (42) is implicitly NOT included in the test
        # It's in the consumption data but should not appear in results for Rhône

        # Mock LandModel.objects.filter() - handles multiple calls
        def mock_landmodel_filter(**kwargs):
            mock_qs = Mock()
            land_type = kwargs.get("land_type")
            parent_keys_contains = kwargs.get("parent_keys__contains", [])

            # First call: Get EPCIs in département
            if land_type == AdminRef.EPCI and "DEPART_69" in parent_keys_contains:
                mock_qs.__iter__ = lambda self: iter([epci_a, epci_b])
                # Setup values_list properly
                mock_values_list = Mock()
                mock_values_list.__iter__ = lambda self: iter(["200001", "200002"])
                mock_qs.values_list.return_value = mock_values_list
            # Second call: Get communes of EPCI B that are in département 69
            elif land_type == AdminRef.COMMUNE and "EPCI_200002" in parent_keys_contains:
                # This is the chained filter, need to return a queryset that supports .filter()
                inner_mock_qs = Mock()

                # The second .filter() call checks for DEPART_69
                def inner_filter(**inner_kwargs):
                    inner_parent_keys = inner_kwargs.get("parent_keys__contains", [])
                    result_qs = Mock()
                    if "DEPART_69" in inner_parent_keys:
                        # Return only communes in Rhône
                        result_qs.__iter__ = lambda self: iter([commune_b1, commune_b2])
                        result_qs.exists.return_value = True
                        # Setup values_list properly
                        mock_inner_values_list = Mock()
                        mock_inner_values_list.__iter__ = lambda self: iter(["69001", "69002"])
                        result_qs.values_list.return_value = mock_inner_values_list
                    else:
                        result_qs.__iter__ = lambda self: iter([])
                        result_qs.exists.return_value = False
                    result_qs.order_by.return_value = result_qs
                    return result_qs

                inner_mock_qs.filter = inner_filter
                inner_mock_qs.__iter__ = lambda self: iter([commune_b1, commune_b2])
                inner_mock_qs.exists.return_value = True
                inner_mock_qs.order_by.return_value = inner_mock_qs
                return inner_mock_qs
            else:
                mock_qs.__iter__ = lambda self: iter([])
                mock_qs.exists.return_value = False
                # Setup values_list properly
                mock_empty_values_list = Mock()
                mock_empty_values_list.__iter__ = lambda self: iter([])
                mock_qs.values_list.return_value = mock_empty_values_list

            mock_qs.order_by.return_value = mock_qs
            return mock_qs

        mock_landmodel_class.objects.filter.side_effect = mock_landmodel_filter

        # Setup: Consumption data
        # EPCI A: 10 ha in 2011, 12 ha in 2012, 15 ha in 2013
        # Commune B1: 5 ha per year
        # Commune B2: 3 ha per year
        # Commune B3: 2 ha per year (should NOT be included in EPCI B total shown to Rhône)
        consumption_data = [
            # EPCI A
            self._create_mock_conso("200001", AdminRef.EPCI, 2011, 10),
            self._create_mock_conso("200001", AdminRef.EPCI, 2012, 12),
            self._create_mock_conso("200001", AdminRef.EPCI, 2013, 15),
            # Communes
            self._create_mock_conso("69001", AdminRef.COMMUNE, 2011, 5),
            self._create_mock_conso("69001", AdminRef.COMMUNE, 2012, 5),
            self._create_mock_conso("69001", AdminRef.COMMUNE, 2013, 5),
            self._create_mock_conso("69002", AdminRef.COMMUNE, 2011, 3),
            self._create_mock_conso("69002", AdminRef.COMMUNE, 2012, 3),
            self._create_mock_conso("69002", AdminRef.COMMUNE, 2013, 3),
            # B3 is in Loire, should not appear
            self._create_mock_conso("42001", AdminRef.COMMUNE, 2011, 2),
            self._create_mock_conso("42001", AdminRef.COMMUNE, 2012, 2),
            self._create_mock_conso("42001", AdminRef.COMMUNE, 2013, 2),
        ]

        # Mock LandConso.objects.filter()
        def mock_landconso_filter(**kwargs):
            mock_qs = Mock()
            land_type = kwargs.get("land_type")
            land_ids = kwargs.get("land_id__in", [])
            year_gte = kwargs.get("year__gte")
            year_lte = kwargs.get("year__lte")

            filtered = [
                c
                for c in consumption_data
                if (
                    c.land_type == land_type
                    and c.land_id in land_ids
                    and (year_gte is None or c.year >= year_gte)
                    and (year_lte is None or c.year <= year_lte)
                )
            ]
            mock_qs.__iter__ = lambda self, f=filtered: iter(f)
            return mock_qs

        mock_landconso_class.objects.filter.side_effect = mock_landconso_filter

        # Execute
        chart = AnnualTotalConsoChart(land=self.mock_depart, params=self.params)
        data_table = chart.data_table

        # Verify structure
        self.assertIn("headers", data_table)
        self.assertIn("rows", data_table)

        # Extract row data for easier testing
        # Strip indentation markers for easier testing
        rows_by_name = {}
        for row in data_table["rows"]:
            name = row["data"][0].strip()
            # Remove indentation prefix if present
            if name.startswith("└─"):
                name = name[2:].strip()
            rows_by_name[name] = row["data"]

        # Assertions
        # 1. EPCI A should be present with its values
        self.assertIn("EPCI A", rows_by_name)
        epci_a_row = rows_by_name["EPCI A"]
        self.assertEqual(epci_a_row[1], 10.0)  # 2011
        self.assertEqual(epci_a_row[2], 12.0)  # 2012
        self.assertEqual(epci_a_row[3], 15.0)  # 2013

        # 2. Commune B1 should be present (in Rhône)
        self.assertIn("Commune B1", rows_by_name)
        b1_row = rows_by_name["Commune B1"]
        self.assertEqual(b1_row[1], 5.0)  # 2011

        # 3. Commune B2 should be present (in Rhône)
        self.assertIn("Commune B2", rows_by_name)
        b2_row = rows_by_name["Commune B2"]
        self.assertEqual(b2_row[1], 3.0)  # 2011

        # 4. Commune B3 should NOT be present (in Loire)
        self.assertNotIn("Commune B3", rows_by_name)

        # 5. EPCI B should be present with sum of B1 + B2 (not B3!)
        # The display name includes "(interdépartemental)"
        epci_b_name = None
        for name in rows_by_name.keys():
            if "EPCI B" in name and "interdépartemental" in name:
                epci_b_name = name
                break

        self.assertIsNotNone(epci_b_name, "EPCI B (interdépartemental) should be in rows")
        epci_b_row = rows_by_name[epci_b_name]
        self.assertEqual(epci_b_row[1], 8.0)  # 2011: 5 + 3 = 8 (not 10!)
        self.assertEqual(epci_b_row[2], 8.0)  # 2012: 5 + 3 = 8
        self.assertEqual(epci_b_row[3], 8.0)  # 2013: 5 + 3 = 8

        # 6. Total row should sum only EPCI A + EPCI B (not individual communes)
        self.assertIn("Total", rows_by_name)
        total_row = rows_by_name["Total"]
        self.assertEqual(total_row[1], 18.0)  # 2011: 10 (EPCI A) + 8 (EPCI B) = 18
        self.assertEqual(total_row[2], 20.0)  # 2012: 12 + 8 = 20
        self.assertEqual(total_row[3], 23.0)  # 2013: 15 + 8 = 23

    @patch("public_data.domain.containers.PublicDataContainer.consommation_progression_service")
    def test_data_table_structure_documentation(self, mock_service):
        """
        Documentation test for data_table behavior with child_type parameter.

        This test documents the expected behavior but may need integration testing
        to fully verify the complex interdepartmental logic.

        Expected behavior:
        - When child_type is provided, displays children territories
        - For interdepartmental EPCIs, should show constituent communes
        - Totals should not double-count interdepartmental territories
        """
        # Setup basic chart
        mock_progression = Mock()
        mock_progression.consommation = []
        mock_service.return_value.get_by_land.return_value = mock_progression

        chart = AnnualTotalConsoChart(land=self.mock_depart, params=self.params)

        # Verify chart has data_table property
        self.assertTrue(hasattr(chart, "data_table"))

        # Verify data_table returns expected structure
        # Note: Without child_type, data_table should have specific structure
        params_without_child = {
            "start_date": 2011,
            "end_date": 2013,
        }
        chart2 = AnnualTotalConsoChart(land=self.mock_depart, params=params_without_child)
        data_table = chart2.data_table

        self.assertIn("headers", data_table)
        self.assertIn("rows", data_table)
        self.assertIsInstance(data_table["headers"], list)
        self.assertIsInstance(data_table["rows"], list)
