from unittest import TestCase, mock

from django.db import OperationalError, connection
from django.test import SimpleTestCase
from django.test import TestCase as DatabaseTestCase

from public_data.domain.national_map_indicators import (
    BIVARIATE_RATE_COLUMNS,
    BIVARIATES,
    CONSO_FIELDS,
    bilinear_palette,
    build_indicators,
    classify_3x3,
    cross_bivariate_rates,
    fixed_periods,
    group_by_land,
    period_error,
    period_sum,
    period_total,
    rates_from_columns,
)
from public_data.models import bivariate as bivariate_models
from public_data.models.bivariate import NationalMapBivariateRate
from public_data.views import NationalMapIndicatorsView

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
    "conso_evolution_between_periods",
    "bivariate_activite_emplois",
    "bivariate_habitat_menages",
    "bivariate_habitat_population",
}


def _vintage(total_ha, habitat_ha=0.0, activite_ha=0.0):
    """Consommations d'une année en m², à partir d'hectares, dans l'ordre de CONSO_FIELDS."""
    conso = {"total": total_ha * 10_000, "habitat": habitat_ha * 10_000, "activite": activite_ha * 10_000}
    return tuple(conso.get(field, 0.0) for field in CONSO_FIELDS)


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
        self.assertEqual(set(period_sum(CONSO_A, (2011, 2020))), set(CONSO_FIELDS))
        self.assertEqual(period_sum(CONSO_A, (2011, 2020))["total"], 100_000)
        self.assertEqual(period_sum(CONSO_A, (2024, 2024))["habitat"], 6_000)
        self.assertIsNone(period_sum(CONSO_A, (2025, 2030)))
        self.assertIsNone(period_sum({}, (2011, 2020)))

    def test_period_sum_ignore_les_valeurs_et_les_annees_manquantes(self):
        conso = {2011: (1.0, None, 1.0, 0.0, 0.0, 0.0, 0.0), 2013: (2.0, 2.0, None, 0.0, 0.0, 0.0, 0.0)}
        result = period_sum(conso, (2011, 2014))
        self.assertEqual((result["total"], result["habitat"], result["activite"]), (3.0, 2.0, 1.0))

    def test_period_total_est_le_total_de_period_sum(self):
        # Valeurs non entières : les deux fonctions doivent additionner dans le même ordre
        conso = {year: (0.1 * year, 0.07 * year, 0.03 * year, 0.0, 0.0, 0.0, 0.0) for year in range(2011, 2025)}
        conso[2016] = (None, None, None, None, None, None, None)
        for period in ((2011, 2020), (2021, 2024), (2011, 2024), (2016, 2016), (2015, 2017)):
            self.assertEqual(period_total(conso, period), period_sum(conso, period)["total"], period)
        self.assertIsNone(period_total(conso, (2025, 2030)))
        self.assertIsNone(period_total({}, (2011, 2020)))


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

    def test_evolution_between_reference_periods(self):
        # A : 1 ha par an sur les deux périodes de référence ; B : 2 ha par an, puis 3 ha par an
        self.assertEqual(self.result["lands"]["A"]["conso_evolution_between_periods"], 0.0)
        self.assertEqual(self.result["lands"]["B"]["conso_evolution_between_periods"], 50.0)

    def test_reference_periods_are_requested_like_any_period(self):
        # Les cumuls des périodes de référence n'ont pas de champ à eux : ce sont ``conso_ha``
        # demandé sur chacune des périodes que l'en-tête de la réponse annonce
        lands = {
            name: build_indicators(
                "REGION", tuple(period), (2011, 2024), {"A": 100.0, "B": 1000.0}, {"A": CONSO_A, "B": CONSO_B}, {}, {}
            )["lands"]
            for name, period in self.result["fixed_periods"].items()
        }
        conso_ha = {name: (by_land["A"]["conso_ha"], by_land["B"]["conso_ha"]) for name, by_land in lands.items()}
        self.assertEqual(conso_ha, {"p1": (10.0, 20.0), "p2": (4.0, 12.0), "total": (14.0, 32.0)})
        # L'évolution, elle, ne dépend pas de la période demandée
        self.assertEqual({by_land["B"]["conso_evolution_between_periods"] for by_land in lands.values()}, {50.0})

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


class CrossBivariateRatesTest(TestCase):
    ROWS = [
        ("emploi", "activite", "A", 0.01, 1.5),
        ("menages", "habitat", "A", 0.02, 0.8),
        ("population", "total", "A", 0.05, 0.4),
        ("menages", "habitat", "B", 0.03, None),
    ]

    def test_reprend_les_couples_stockes(self):
        rates = cross_bivariate_rates(self.ROWS)
        self.assertEqual(rates["bivariate_activite_emplois"], {"A": (0.01, 1.5)})
        self.assertEqual(rates["bivariate_habitat_menages"], {"A": (0.02, 0.8), "B": (0.03, None)})

    def test_croise_la_population_avec_la_consommation_pour_l_habitat(self):
        rates = cross_bivariate_rates(self.ROWS)
        # Taux de consommation des lignes « habitat », évolution des lignes « population »
        self.assertEqual(rates["bivariate_habitat_population"], {"A": (0.02, 0.4), "B": (0.03, None)})

    def test_sans_ligne(self):
        self.assertEqual(cross_bivariate_rates([]), {key: {} for key in BIVARIATES})


def _compact_row(land_id, **rates):
    """Ligne de la table compacte des taux : territoire puis un taux par colonne, None par défaut."""
    return (land_id, *(rates.get(column) for column in BIVARIATE_RATE_COLUMNS))


class RatesFromColumnsTest(TestCase):
    # Les mêmes taux que CrossBivariateRatesTest.ROWS, une ligne par territoire
    ROWS = [
        _compact_row(
            "A",
            conso_rate_activite=0.01,
            conso_rate_habitat=0.02,
            indic_rate_emploi=1.5,
            indic_rate_menages=0.8,
            indic_rate_population=0.4,
        ),
        _compact_row("B", conso_rate_habitat=0.03),
    ]

    def test_colonnes_lues_une_seule_fois_chacune(self):
        self.assertEqual(
            BIVARIATE_RATE_COLUMNS,
            (
                "conso_rate_activite",
                "indic_rate_emploi",
                "conso_rate_habitat",
                "indic_rate_menages",
                "indic_rate_population",
            ),
        )
        model_columns = {field.name for field in NationalMapBivariateRate._meta.get_fields()}
        self.assertLessEqual(set(BIVARIATE_RATE_COLUMNS), model_columns)

    def test_meme_resultat_que_les_lignes_d_origine(self):
        self.assertEqual(rates_from_columns(self.ROWS), cross_bivariate_rates(CrossBivariateRatesTest.ROWS))

    def test_sans_taux_de_consommation_le_territoire_n_est_pas_sur_la_carte(self):
        # B n'a pas de ligne « activité » à l'origine : absent de la carte, même avec un taux d'emploi
        rates = rates_from_columns([_compact_row("B", conso_rate_habitat=0.03, indic_rate_emploi=2.0)])
        self.assertEqual(rates["bivariate_activite_emplois"], {})
        self.assertEqual(rates["bivariate_habitat_menages"], {"B": (0.03, None)})

    def test_sans_ligne(self):
        self.assertEqual(rates_from_columns([]), {key: {} for key in BIVARIATES})


class GroupingTest(TestCase):
    def test_group_by_land(self):
        # (territoire, année, puis les consommations dans l'ordre de CONSO_FIELDS), comme les lit la vue
        rows = [
            ("84", 2011, 1.0, None, 0.0, 0.0, 0.0, 0.0, 0.0),
            ("84", 2012, 2.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0),
            ("11", 2011, 3.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0),
        ]
        grouped = group_by_land(rows)
        self.assertEqual(set(grouped), {"84", "11"})
        self.assertEqual(set(grouped["84"]), {2011, 2012})
        self.assertEqual(grouped["84"][2012], (2.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0))
        # Une consommation non renseignée compte pour zéro dans les sommes
        self.assertEqual(period_sum(grouped["84"], (2011, 2012))["habitat"], 1.0)
        self.assertEqual(period_sum(grouped["11"], (2011, 2011))["total"], 3.0)


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


class NationalMapBivariateRateTest(DatabaseTestCase):
    """Table compacte des taux : absente tant que le DAG update_app ne l'a pas copiée."""

    PERIOD = (2013, 2019)
    LOGGER = "public_data.models.bivariate"

    def setUp(self):
        # Les traces du repli sont espacées d'une heure par processus : chaque test repart de zéro
        bivariate_models._fallback_logged_at.clear()
        self.addCleanup(bivariate_models._fallback_logged_at.clear)

    def _create_table(self):
        # Table non gérée par Django : créée pour le test, dans sa transaction
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(NationalMapBivariateRate)

    def _rows(self):
        return NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, BIVARIATE_RATE_COLUMNS)

    def _row(self, land_id, land_type="COMM", period=PERIOD, **rates):
        return NationalMapBivariateRate(
            land_id=land_id, land_type=land_type, start_year=period[0], end_year=period[1], **rates
        )

    def test_table_absente(self):
        self.assertIsNone(NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, BIVARIATE_RATE_COLUMNS))
        # L'échec ne doit pas avoir invalidé la transaction en cours
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            self.assertEqual(cursor.fetchone(), (1,))

    def test_table_absente_tracee_une_fois_par_heure(self):
        with self.assertLogs(self.LOGGER, level="WARNING") as logs:
            self.assertIsNone(self._rows())
        self.assertEqual([record.levelname for record in logs.records], ["WARNING"])
        self.assertIn("public_data_national_map_bivariate_rate indisponible", logs.output[0])
        self.assertIn("update_app", logs.output[0])
        # Chaque réponse de la carte repasse par ici tant que la table manque : pas de nouvelle trace
        with self.assertNoLogs(self.LOGGER, level="WARNING"):
            self.assertIsNone(self._rows())
        # Une heure plus tard, la table manque toujours : nouvelle trace
        later = bivariate_models.time.monotonic() + bivariate_models.FALLBACK_LOG_INTERVAL + 1
        with mock.patch.object(bivariate_models.time, "monotonic", return_value=later):
            with self.assertLogs(self.LOGGER, level="WARNING"):
                self.assertIsNone(self._rows())

    def test_colonne_absente_tracee_comme_une_table_absente(self):
        self._create_table()
        with self.assertLogs(self.LOGGER, level="WARNING") as logs:
            rows = NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, ("conso_rate_habitat",))
            self.assertEqual(rows, [])
            # Colonne déclarée par le modèle mais absente de la table copiée
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE public_data_national_map_bivariate_rate DROP COLUMN conso_rate_habitat")
            self.assertIsNone(NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, ("conso_rate_habitat",)))
        self.assertEqual([record.levelname for record in logs.records], ["WARNING"])

    def test_autre_erreur_tracee_avec_sa_pile_sans_attendre(self):
        # La table absente vient d'être tracée : une vraie erreur l'est quand même, à son niveau
        with self.assertLogs(self.LOGGER, level="WARNING"):
            self.assertIsNone(self._rows())
        with mock.patch.object(NationalMapBivariateRate, "objects") as objects:
            objects.filter.return_value.values_list.side_effect = OperationalError("connexion perdue")
            with self.assertLogs(self.LOGGER, level="WARNING") as logs:
                self.assertIsNone(self._rows())
                # Même motif dans la même heure : pas de seconde trace
                self.assertIsNone(self._rows())
        self.assertEqual([record.levelname for record in logs.records], ["ERROR"])
        self.assertIn("en échec", logs.output[0])
        self.assertIsNotNone(logs.records[0].exc_info)

    def test_lignes_de_la_maille_et_de_la_periode(self):
        self._create_table()
        NationalMapBivariateRate.objects.bulk_create(
            [
                self._row("33063", conso_rate_habitat=0.02, indic_rate_menages=0.8),
                self._row("33281", conso_rate_habitat=0.03),
                self._row("33063", period=(2011, 2020), conso_rate_habitat=0.5),
                self._row("33", land_type="DEPART", conso_rate_habitat=0.7),
            ]
        )
        columns = ("conso_rate_habitat", "indic_rate_menages")
        rows = NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, columns)
        self.assertCountEqual(rows, [("33063", 0.02, 0.8), ("33281", 0.03, None)])

    def test_lignes_restreintes_a_des_territoires(self):
        self._create_table()
        NationalMapBivariateRate.objects.bulk_create(
            [self._row("33063", conso_rate_habitat=0.02), self._row("33281", conso_rate_habitat=0.03)]
        )
        rows = NationalMapBivariateRate.rows_for_period(
            "COMM", self.PERIOD, ("conso_rate_habitat",), ["33281", "75056"]
        )
        self.assertEqual(rows, [("33281", 0.03)])
        self.assertEqual(
            NationalMapBivariateRate.rows_for_period("COMM", self.PERIOD, ("conso_rate_habitat",), []), []
        )


class BivariateRatesTest(SimpleTestCase):
    """Lecture des taux par la vue : table compacte si elle existe, sinon table d'origine."""

    PERIOD = (2013, 2019)

    @mock.patch("public_data.views.NationalMapBivariateRate.rows_for_period")
    def test_lit_toute_la_maille_dans_la_table_compacte(self, rows_for_period):
        rows_for_period.return_value = RatesFromColumnsTest.ROWS
        rates = NationalMapIndicatorsView.bivariate_rates("EPCI", self.PERIOD)
        rows_for_period.assert_called_once_with("EPCI", self.PERIOD, BIVARIATE_RATE_COLUMNS, None)
        self.assertEqual(rates, rates_from_columns(RatesFromColumnsTest.ROWS))

    @mock.patch("public_data.views.NationalMapBivariateRate.rows_for_period", return_value=[])
    def test_restreint_la_table_compacte_aux_territoires_du_parent(self, rows_for_period):
        NationalMapIndicatorsView.bivariate_rates("COMM", self.PERIOD, mock.Mock(key="DEPART_33"), ["33063", "33281"])
        rows_for_period.assert_called_once_with("COMM", self.PERIOD, BIVARIATE_RATE_COLUMNS, ["33063", "33281"])

    @mock.patch("public_data.views.BivariateLandRate.objects")
    @mock.patch("public_data.views.NationalMapBivariateRate.rows_for_period", return_value=None)
    def test_repli_sur_la_table_d_origine(self, _, source):
        source.filter.return_value.values_list.return_value = CrossBivariateRatesTest.ROWS
        rates = NationalMapIndicatorsView.bivariate_rates("EPCI", self.PERIOD)
        source.filter.assert_called_once_with(
            indicator__in=["emploi", "menages", "population"], land_type="EPCI", start_year=2013, end_year=2019
        )
        # Toute la maille : pas de second filtre sur les territoires
        source.filter.return_value.filter.assert_not_called()
        self.assertEqual(rates, cross_bivariate_rates(CrossBivariateRatesTest.ROWS))

    @mock.patch("public_data.views._lands")
    @mock.patch("public_data.views.BivariateLandRate.objects")
    @mock.patch("public_data.views.NationalMapBivariateRate.rows_for_period", return_value=None)
    def test_repli_restreint_au_parent_par_une_sous_requete(self, _, source, lands):
        parent = mock.Mock(key="DEPART_33")
        source.filter.return_value.filter.return_value.values_list.return_value = []
        NationalMapIndicatorsView.bivariate_rates("COMM", self.PERIOD, parent, ["33063"])
        lands.assert_called_once_with("COMM", parent)
        source.filter.return_value.filter.assert_called_once_with(land_id__in=lands.return_value.values.return_value)


@mock.patch("public_data.views.NationalMapIndicatorsView.bivariate_thresholds", return_value={})
@mock.patch("public_data.views.NationalMapIndicatorsView.bivariate_rates", return_value={})
@mock.patch("public_data.views.LandConso.objects")
@mock.patch("public_data.views._lands")
class IndicatorsBuildTest(SimpleTestCase):
    """Lectures faites par la vue pour assembler les indicateurs, tables simulées."""

    PERIOD = (2013, 2019)
    YEARS = (2011, 2024)

    def _build(self, lands, scale, parent):
        lands.return_value.values_list.return_value = [("A", 100.0), ("B", 50.0)]
        return NationalMapIndicatorsView().build(scale, self.PERIOD, self.YEARS, parent)

    def test_france_entiere(self, lands, conso, bivariate_rates, _):
        conso.filter.return_value.values_list.return_value = [("A", 2013, 20_000.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)]
        result = self._build(lands, "EPCI", None)
        self.assertEqual(set(result["lands"]), {"A", "B"})
        self.assertEqual(result["lands"]["A"]["conso_ha"], 2.0)
        conso.filter.assert_called_once_with(land_type="EPCI")
        conso.filter.return_value.filter.assert_not_called()
        conso.filter.return_value.values_list.assert_called_once_with("land_id", "year", *CONSO_FIELDS)
        bivariate_rates.assert_called_once_with("EPCI", self.PERIOD, None, ["A", "B"])

    def test_communes_d_un_parent_taux_restreints_au_parent(self, lands, conso, bivariate_rates, _):
        parent = mock.Mock(key="DEPART_33")
        self._build(lands, "COMM", parent)
        conso.filter.return_value.filter.assert_called_once_with(land_id__in=["A", "B"])
        bivariate_rates.assert_called_once_with("COMM", self.PERIOD, parent, ["A", "B"])

    def test_autres_mailles_d_un_parent_taux_de_toute_la_maille(self, lands, conso, bivariate_rates, _):
        # Restreindre les taux aux EPCI d'une région coûtait jusqu'à 6 s : toute la maille est lue
        self._build(lands, "EPCI", mock.Mock(key="REGION_75"))
        conso.filter.return_value.filter.assert_called_once_with(land_id__in=["A", "B"])
        bivariate_rates.assert_called_once_with("EPCI", self.PERIOD, None, ["A", "B"])
