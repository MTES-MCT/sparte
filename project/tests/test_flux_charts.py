from unittest import TestCase
from unittest.mock import Mock, patch

from project.charts.artificialisation import (
    ArtifFluxByCouverture,
    ArtifFluxByUsage,
    ArtifNetFluxChart,
)
from project.charts.impermeabilisation import (
    ImperFluxByCouverture,
    ImperFluxByUsage,
    ImperNetFluxChart,
)


class TestArtifNetFluxChartParams(TestCase):
    """Tests pour vérifier que ArtifNetFluxChart valide correctement ses paramètres."""

    def setUp(self):
        """Crée un mock de land pour les tests."""
        self.mock_land = Mock()
        self.mock_land.land_type = "COMMUNE"
        self.mock_land.land_id = "75056"
        self.mock_land.is_interdepartemental = False

    def test_init_without_millesime_new_index_raises_error(self):
        """Test que l'absence de millesime_new_index lève une ValueError."""
        params = {"millesime_old_index": 1}

        with self.assertRaises(ValueError) as context:
            ArtifNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    def test_init_without_millesime_old_index_raises_error(self):
        """Test que l'absence de millesime_old_index lève une ValueError."""
        params = {"millesime_new_index": 2}

        with self.assertRaises(ValueError) as context:
            ArtifNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("millesime_old_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    def test_init_without_any_params_raises_error(self):
        """Test que l'absence de tous les paramètres lève une ValueError."""
        params = {}

        with self.assertRaises(ValueError) as context:
            ArtifNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_all_required_params_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec tous les paramètres requis."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "millesime_old_index": 1}

        # Ne devrait pas lever d'erreur
        try:
            chart = ArtifNetFluxChart(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ArtifNetFluxChart raised ValueError with valid params")

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_optional_departement_param_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec le paramètre optionnel departement."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "millesime_old_index": 1, "departement": "75"}

        # Ne devrait pas lever d'erreur
        try:
            chart = ArtifNetFluxChart(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ArtifNetFluxChart raised ValueError with valid params including departement")


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


class TestArtifFluxByCouvertureParams(TestCase):
    """Tests pour vérifier que ArtifFluxByCouverture valide correctement ses paramètres."""

    def setUp(self):
        """Crée un mock de land pour les tests."""
        self.mock_land = Mock()
        self.mock_land.land_type = "COMMUNE"
        self.mock_land.land_id = "75056"
        self.mock_land.is_interdepartemental = False

    def test_init_without_millesime_new_index_raises_error(self):
        """Test que l'absence de millesime_new_index lève une ValueError (hérité de ArtifFluxByUsage)."""
        params = {}

        with self.assertRaises(ValueError) as context:
            ArtifFluxByCouverture(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_millesime_new_index_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec millesime_new_index."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2}

        # Ne devrait pas lever d'erreur
        try:
            chart = ArtifFluxByCouverture(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ArtifFluxByCouverture raised ValueError with valid params")


class TestImperFluxByUsageParams(TestCase):
    """Tests pour vérifier que ImperFluxByUsage valide correctement ses paramètres."""

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
            ImperFluxByUsage(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_millesime_new_index_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec millesime_new_index."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2}

        # Ne devrait pas lever d'erreur
        try:
            chart = ImperFluxByUsage(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ImperFluxByUsage raised ValueError with valid params")

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_optional_departement_param_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec le paramètre optionnel departement."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "departement": "75"}

        # Ne devrait pas lever d'erreur
        try:
            chart = ImperFluxByUsage(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ImperFluxByUsage raised ValueError with valid params including departement")


class TestImperFluxByCouvertureParams(TestCase):
    """Tests pour vérifier que ImperFluxByCouverture valide correctement ses paramètres."""

    def setUp(self):
        """Crée un mock de land pour les tests."""
        self.mock_land = Mock()
        self.mock_land.land_type = "COMMUNE"
        self.mock_land.land_id = "75056"
        self.mock_land.is_interdepartemental = False

    def test_init_without_millesime_new_index_raises_error(self):
        """Test que l'absence de millesime_new_index lève une ValueError (hérité de ImperFluxByUsage)."""
        params = {}

        with self.assertRaises(ValueError) as context:
            ImperFluxByCouverture(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_millesime_new_index_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec millesime_new_index."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2}

        # Ne devrait pas lever d'erreur
        try:
            chart = ImperFluxByCouverture(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ImperFluxByCouverture raised ValueError with valid params")


class TestImperNetFluxChartParams(TestCase):
    """Tests pour vérifier que ImperNetFluxChart valide correctement ses paramètres."""

    def setUp(self):
        """Crée un mock de land pour les tests."""
        self.mock_land = Mock()
        self.mock_land.land_type = "COMMUNE"
        self.mock_land.land_id = "75056"
        self.mock_land.is_interdepartemental = False

    def test_init_without_millesime_new_index_raises_error(self):
        """Test que l'absence de millesime_new_index lève une ValueError."""
        params = {"millesime_old_index": 1}

        with self.assertRaises(ValueError) as context:
            ImperNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("millesime_new_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    def test_init_without_millesime_old_index_raises_error(self):
        """Test que l'absence de millesime_old_index lève une ValueError."""
        params = {"millesime_new_index": 2}

        with self.assertRaises(ValueError) as context:
            ImperNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("millesime_old_index", str(context.exception))
        self.assertIn("obligatoire", str(context.exception))

    def test_init_without_any_params_raises_error(self):
        """Test que l'absence de tous les paramètres lève une ValueError."""
        params = {}

        with self.assertRaises(ValueError) as context:
            ImperNetFluxChart(land=self.mock_land, params=params)

        self.assertIn("obligatoire", str(context.exception))

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_all_required_params_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec tous les paramètres requis."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "millesime_old_index": 1}

        # Ne devrait pas lever d'erreur
        try:
            chart = ImperNetFluxChart(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ImperNetFluxChart raised ValueError with valid params")

    @patch("highcharts.charts.Chart.get_param")
    def test_init_with_optional_departement_param_succeeds(self, mock_get_param):
        """Test que l'initialisation réussit avec le paramètre optionnel departement."""
        mock_get_param.return_value = {}
        params = {"millesime_new_index": 2, "millesime_old_index": 1, "departement": "75"}

        # Ne devrait pas lever d'erreur
        try:
            chart = ImperNetFluxChart(land=self.mock_land, params=params)
            self.assertIsNotNone(chart)
        except ValueError:
            self.fail("ImperNetFluxChart raised ValueError with valid params including departement")
