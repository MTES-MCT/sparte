from unittest import TestCase, mock

from django.test import SimpleTestCase

from public_data.domain.national_map_indicators import (
    BIVARIATES,
    bilinear_palette,
    build_indicators,
    classify_3x3,
    fixed_periods,
    group_by_land,
    period_error,
    period_sum,
)

PURPLE_CORNERS = ("#b5b8d9", "#4a1486", "#e34a33", "#fdbe85")

LAND_KEYS = {
    "surface_ha",
    "conso_ha",
    "conso_pct_surface",
    "conso_habitat_ha",
    "conso_activite_ha",
    "conso_mixte_ha",
    "conso_route_ha",
    "conso_ferroviaire_ha",
    "conso_inconnu_ha",
    "annual_conso_2011_2021",
    "annual_conso_2021_end",
    "conso_evolution_between_periods",
    "conso_2011_end",
    "conso_2011_2021",
    "conso_2021_end",
    "bivariate_activite_emplois",
    "bivariate_habitat_menages",
    "bivariate_habitat_population",
}


def _vintage(total_ha, habitat_ha=0.0, activite_ha=0.0):
    """Consommations d'une année en m², à partir d'hectares."""
    return {
        "total": total_ha * 10_000,
        "habitat": habitat_ha * 10_000,
        "activite": activite_ha * 10_000,
        "mixte": 0.0,
        "route": 0.0,
        "ferroviaire": 0.0,
        "inconnu": 0.0,
    }


# Territoire A : 1 ha par an de 2011 à 2024 (0,6 habitat + 0,4 activité)
CONSO_A = {year: _vintage(1, 0.6, 0.4) for year in range(2011, 2025)}
# Territoire B : 2 ha par an jusqu'en 2020, puis 3 ha par an
CONSO_B = {year: _vintage(2 if year <= 2020 else 3) for year in range(2011, 2025)}


class PaletteAndClassificationTest(TestCase):
    def test_bilinear_palette_corners_and_size(self):
        palette = bilinear_palette(*PURPLE_CORNERS)
        self.assertEqual(len(palette), 9)
        self.assertEqual(palette[0], "#b5b8d9")  # conso faible, indicateur faible
        self.assertEqual(palette[2], "#4a1486")  # conso faible, indicateur fort
        self.assertEqual(palette[6], "#e34a33")  # conso forte, indicateur faible
        self.assertEqual(palette[8], "#fdbe85")  # conso forte, indicateur fort
        for color in palette:
            self.assertRegex(color, r"^#[0-9a-f]{6}$")

    def test_palette_and_classification_match_dossier_complet(self):
        from project.charts.dossier_complet.DcBivariateConsoMap import (
            bilinear_palette as dc_bilinear_palette,
        )
        from project.charts.dossier_complet.DcBivariateConsoMap import (
            classify_3x3 as dc_classify_3x3,
        )

        for bivariate in BIVARIATES.values():
            self.assertEqual(bilinear_palette(*bivariate.corners), dc_bilinear_palette(*bivariate.corners))
        for conso in (None, 0.0, 0.3, 0.31, 0.6, 0.61):
            for indic in (None, -1.0, 0.0, 0.01, 2.0, 2.01):
                self.assertEqual(
                    classify_3x3(conso, indic, 0.3, 0.6, 0.0, 2.0),
                    dc_classify_3x3(conso, indic, 0.3, 0.6, 0.0, 2.0),
                    (conso, indic),
                )

    def test_classify_3x3_bounds(self):
        thresholds = (0.3, 0.6, 0.0, 2.0)
        # Les seuils sont inclus dans la classe inférieure
        self.assertEqual(classify_3x3(0.3, 0.0, *thresholds), 0)
        self.assertEqual(classify_3x3(0.31, 0.01, *thresholds), 4)
        self.assertEqual(classify_3x3(0.6, 2.0, *thresholds), 4)
        self.assertEqual(classify_3x3(0.61, 2.01, *thresholds), 8)
        # Consommation absente : faible ; indicateur absent : intermédiaire
        self.assertEqual(classify_3x3(None, 5.0, *thresholds), 2)
        self.assertEqual(classify_3x3(1.0, None, *thresholds), 7)


class PeriodsTest(TestCase):
    def test_fixed_periods(self):
        self.assertEqual(fixed_periods(2024), {"p1": (2011, 2020), "p2": (2021, 2024), "total": (2011, 2024)})

    def test_period_error(self):
        self.assertIsNone(period_error(2011, 2020, 2011, 2024))
        self.assertIsNone(period_error(2024, 2024, 2011, 2024))
        self.assertIn("inférieur ou égal", period_error(2021, 2020, 2011, 2024))
        self.assertIn("2011 et 2024", period_error(2010, 2020, 2011, 2024))
        self.assertIn("2011 et 2024", period_error(2011, 2025, 2011, 2024))

    def test_period_sum(self):
        self.assertEqual(period_sum(CONSO_A, (2011, 2020))["total"], 100_000)
        self.assertEqual(period_sum(CONSO_A, (2024, 2024))["habitat"], 6_000)
        self.assertIsNone(period_sum(CONSO_A, (2025, 2030)))
        self.assertIsNone(period_sum({}, (2011, 2020)))


class BuildIndicatorsTest(TestCase):
    def setUp(self):
        self.result = build_indicators(
            scale="REGION",
            period=(2011, 2020),
            years=(2011, 2024),
            surfaces={"A": 100.0, "B": 1000.0, "C": 50.0},
            conso={"A": CONSO_A, "B": CONSO_B},
            bivariate_rates={
                "bivariate_activite_emplois": {"A": (0.5, 1.0)},
                "bivariate_habitat_menages": {"A": (0.1, None), "B": (0.9, 3.0)},
                "bivariate_habitat_population": {"A": (0.5, 1.0)},
            },
            bivariate_thresholds={
                "bivariate_activite_emplois": (0.3, 0.6, 0.0, 2.0),
                "bivariate_habitat_menages": (0.3, 0.6, 0.0, 2.0),
                "bivariate_habitat_population": None,
            },
        )

    def test_header(self):
        self.assertEqual(self.result["scale"], "REGION")
        self.assertEqual((self.result["start_year"], self.result["end_year"]), (2011, 2020))
        self.assertEqual(self.result["years"], {"min": 2011, "max": 2024})
        self.assertEqual(self.result["fixed_periods"], {"p1": [2011, 2020], "p2": [2021, 2024], "total": [2011, 2024]})

    def test_every_land_has_every_key(self):
        self.assertEqual(set(self.result["lands"]), {"A", "B", "C"})
        for land in self.result["lands"].values():
            self.assertEqual(set(land), LAND_KEYS)

    def test_conso_of_the_period(self):
        a = self.result["lands"]["A"]
        self.assertEqual(a["surface_ha"], 100.0)
        self.assertEqual(a["conso_ha"], 10.0)
        self.assertEqual(a["conso_pct_surface"], 10.0)
        self.assertEqual(a["conso_habitat_ha"], 6.0)
        self.assertEqual(a["conso_activite_ha"], 4.0)
        self.assertEqual(a["conso_mixte_ha"], 0.0)

    def test_reference_periods(self):
        a = self.result["lands"]["A"]
        self.assertEqual(a["annual_conso_2011_2021"], 1.0)
        self.assertEqual(a["annual_conso_2021_end"], 1.0)
        self.assertEqual(a["conso_evolution_between_periods"], 0.0)
        self.assertEqual(a["conso_2011_end"], 14.0)
        self.assertEqual(a["conso_2011_2021"], 10.0)
        self.assertEqual(a["conso_2021_end"], 4.0)

        b = self.result["lands"]["B"]
        self.assertEqual(b["annual_conso_2011_2021"], 2.0)
        self.assertEqual(b["annual_conso_2021_end"], 3.0)
        self.assertEqual(b["conso_evolution_between_periods"], 50.0)

    def test_land_without_conso(self):
        c = self.result["lands"]["C"]
        self.assertEqual(c["surface_ha"], 50.0)
        for key in LAND_KEYS - {"surface_ha"}:
            self.assertIsNone(c[key], key)

    def test_bivariate_per_land(self):
        a = self.result["lands"]["A"]
        b = self.result["lands"]["B"]
        self.assertEqual(a["bivariate_activite_emplois"], {"class": 4, "conso_rate": 0.5, "indic_rate": 1.0})
        self.assertEqual(a["bivariate_habitat_menages"], {"class": 1, "conso_rate": 0.1, "indic_rate": None})
        self.assertEqual(b["bivariate_habitat_menages"], {"class": 8, "conso_rate": 0.9, "indic_rate": 3.0})
        # Pas de taux pour B sur cette carte
        self.assertIsNone(b["bivariate_activite_emplois"])
        # Pas de seuils pour cette période : null même avec un taux
        self.assertIsNone(a["bivariate_habitat_population"])

    def test_bivariate_descriptions(self):
        bivariate = self.result["bivariate"]
        self.assertEqual(set(bivariate), set(BIVARIATES))
        emplois = bivariate["bivariate_activite_emplois"]
        self.assertEqual(emplois["palette"], bilinear_palette(*PURPLE_CORNERS))
        self.assertEqual(emplois["conso_thresholds"], [0.3, 0.6])
        self.assertEqual(emplois["indic_thresholds"], [0.0, 2.0])
        self.assertEqual(emplois["conso_label"], "Consommation annuelle pour l'activité")
        self.assertEqual(emplois["indicator_label"], "Évolution de l'emploi")
        self.assertEqual(emplois["indicator_unit"], "%")
        population = bivariate["bivariate_habitat_population"]
        self.assertEqual(len(population["palette"]), 9)
        self.assertIsNone(population["conso_thresholds"])
        self.assertIsNone(population["indic_thresholds"])

    def test_rounding(self):
        result = build_indicators(
            "DEPART",
            (2011, 2011),
            (2011, 2024),
            {"A": 123.456789},
            {"A": {2011: _vintage(0.123456)}},
            {"bivariate_activite_emplois": {"A": (0.123456789, 1.98765432)}},
            {"bivariate_activite_emplois": (0.1, 0.2, 0.3, 0.4)},
        )
        a = result["lands"]["A"]
        self.assertEqual(a["surface_ha"], 123.46)
        self.assertEqual(a["conso_ha"], 0.12)
        self.assertEqual(a["bivariate_activite_emplois"], {"class": 5, "conso_rate": 0.1235, "indic_rate": 1.9877})


class GroupingTest(TestCase):
    def test_group_by_land(self):
        rows = [
            {"land_id": "84", "year": 2011, "total": 1.0, "habitat": None},
            {"land_id": "84", "year": 2012, "total": 2.0, "habitat": 1.0},
            {"land_id": "11", "year": 2011, "total": 3.0, "habitat": 3.0},
        ]
        grouped = group_by_land(rows)
        self.assertEqual(set(grouped), {"84", "11"})
        self.assertEqual(grouped["84"][2011]["total"], 1.0)
        self.assertEqual(grouped["84"][2011]["habitat"], 0)
        self.assertEqual(grouped["84"][2012]["habitat"], 1.0)
        self.assertEqual(grouped["11"][2011]["route"], 0)


@mock.patch("public_data.views.NationalMapIndicatorsView.available_years", return_value=(2011, 2024))
class NationalMapIndicatorsViewTest(SimpleTestCase):
    url = "/public/national-map/indicators"
    payload = {"scale": "REGION", "lands": {"84": {"conso_ha": 1.0}}}

    def test_invalid_scale(self, available_years):
        response = self.client.get(self.url, {"scale": "COMM"})
        self.assertEqual(response.status_code, 400)
        available_years.assert_not_called()

    def test_invalid_period(self, _):
        for params in (
            {"start_year": "2021", "end_year": "2020"},
            {"start_year": "2010", "end_year": "2020"},
            {"start_year": "2011", "end_year": "2025"},
            {"start_year": "abc"},
            {"end_year": ""},
        ):
            response = self.client.get(self.url, {"scale": "REGION", **params})
            self.assertEqual(response.status_code, 400, params)
            self.assertIn("detail", response.json())

    @mock.patch("public_data.views.NationalMapIndicatorsView.build")
    def test_returns_indicators_with_http_cache(self, build, _):
        build.return_value = self.payload
        response = self.client.get(self.url, {"scale": "DEPART", "start_year": "2013", "end_year": "2017"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), self.payload)
        self.assertEqual(response["Cache-Control"], "public, max-age=600")
        build.assert_called_once_with("DEPART", (2013, 2017), (2011, 2024), None)

    @mock.patch("public_data.views.NationalMapIndicatorsView.build")
    def test_default_values(self, build, _):
        build.return_value = self.payload
        self.client.get(self.url)
        build.assert_called_once_with("REGION", (2011, 2024), (2011, 2024), None)

    @mock.patch("public_data.views.NationalMapIndicatorsView.build")
    def test_single_year(self, build, _):
        build.return_value = self.payload
        self.client.get(self.url, {"start_year": "2024", "end_year": "2024"})
        build.assert_called_once_with("REGION", (2024, 2024), (2011, 2024), None)

    def test_no_data(self, available_years):
        available_years.return_value = None
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 404)
