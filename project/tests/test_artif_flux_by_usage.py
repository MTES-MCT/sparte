from unittest import TestCase
from unittest.mock import Mock, patch

from project.charts.artificialisation import ArtifFluxByUsage


class TestArtifFluxByUsageParams(TestCase):
    """Tests pour vérifier que ArtifFluxByUsage valide correctement ses paramètres."""

    def setUp(self):
        """Crée un mock de land pour les tests."""
        self.mock_land = Mock()
        self.mock_land.land_type = "COMMUNE"
        self.mock_land.land_id = "75056"
        self.mock_land.is_interdepartemental = False

    def test_init_without_millesime_new_index_raises_error(self):
        """Test que l'absence de millesime_new_index lève une ValueError."""
        params = {}

        with self.assertRaises(ValueError) as context:
            ArtifFluxByUsage(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_millesime_new_index_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec millesime_new_index."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2}

        # Ne devrait pas lever d'erreur
        try:
            chart = ArtifFluxByUsage(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ArtifFluxByUsage raised ValueError with valid params")

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_optional_departement_param_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec le paramètre optionnel departement."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "departement": "75"}

        # Ne devrait pas lever d'erreur
        try:
            chart = ArtifFluxByUsage(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ArtifFluxByUsage raised ValueError with valid params including departement")
