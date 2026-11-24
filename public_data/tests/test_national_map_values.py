import gzip
import json
import random
from unittest import TestCase, mock

from django.core.cache import cache
from django.db import connection
from django.test import SimpleTestCase
from django.test import TestCase as DatabaseTestCase
from django.test import override_settings

from public_data.domain.national_map_artif import (
    ARTIF_FORMAT_VERSION,
    build_artif_indicators,
)
from public_data.domain.national_map_indicators import (
    BIVARIATES,
    CONSO_FIELDS,
    INDICATORS_FORMAT_VERSION,
    build_indicators,
    group_by_land,
)
from public_data.domain.national_map_values import (
    AMOUNT_BY_KEY,
    ARTIF_FLUX,
    ARTIF_KEYS,
    ARTIF_STOCK,
    ARTIF_YEAR_FIELDS,
    BIVARIATE,
    CONSO,
    CONSO_AMOUNTS,
    CONSO_COLUMNS,
    EVOLUTION_KEY,
    FAMILY_BY_KEY,
    NO_DATA_LIMIT,
    SELECTION,
    VALUES_FORMAT_VERSION,
    ConsoSum,
    artif_columns,
    artif_content,
    bivariate_content,
    build_referential,
    build_values,
    compressed_body,
    conso_columns,
    conso_periods,
    indexed_year_sets,
    needed_sums,
    relative_key,
    request_error,
    requested_keys,
    scalar_content,
    sums_in_year_order,
    uses_period,
)
from public_data.models.consommation.LandConso import LandConso
from public_data.tests.test_national_map_artif import flux_row, land_row
from public_data.views import NationalMapValuesView

YEARS = (2011, 2024)
# Version des clés de cache : celle du format, puis celles des règles de calcul reprises
VALUES_CACHE_VERSION = f"{VALUES_FORMAT_VERSION}.{INDICATORS_FORMAT_VERSION}.{ARTIF_FORMAT_VERSION}"
# Champs numériques par territoire de la réponse « indicateurs » que sert aussi l'appel « valeurs »
EXISTING_CONSO_KEYS = (
    "conso_ha",
    "conso_pct_surface",
    "conso_habitat_ha",
    "conso_activite_ha",
    "conso_evolution_between_periods",
)
NEW_RELATIVE_KEYS = (
    "conso_habitat_pct_surface",
    "conso_activite_pct_surface",
)
ARTIF_VALUE_KEYS = (
    "artif_ha",
    "artif_pct",
    "artif_net_ha",
    "artif_net_pct_surface",
    "artif_net_annual_ha",
    "artif_net_annual_pct_surface",
)


def _referential(*lands):
    """Référentiel à partir de (identifiant, surface, has_conso, has_ocsge) ; nom et région tirés de l'identifiant."""
    return build_referential(
        (land_id, f"Commune {land_id}", surface, has_conso, has_ocsge, land_id[:2])
        for land_id, surface, has_conso, has_ocsge in lands
    )


def _vintage(total, habitat=0.0, activite=0.0):
    """Consommations d'une année en m², dans l'ordre de CONSO_FIELDS."""
    conso = {"total": total, "habitat": habitat, "activite": activite}
    return tuple(conso.get(field, 0.0) for field in CONSO_FIELDS)


def _sums_by_land(conso, keys, periods):
    """Sommes de chaque territoire, faites en Python dans l'ordre des années."""
    return {land_id: sums_in_year_order(by_year, needed_sums(keys), periods) for land_id, by_year in conso.items()}


class KeysTest(TestCase):
    def test_liste_fermee_des_cles(self):
        self.assertEqual(
            set(FAMILY_BY_KEY), {*EXISTING_CONSO_KEYS, *NEW_RELATIVE_KEYS, *BIVARIATES, *ARTIF_VALUE_KEYS}
        )
        self.assertEqual(len(FAMILY_BY_KEY), 16)

    def test_familles(self):
        for key in (*EXISTING_CONSO_KEYS, *NEW_RELATIVE_KEYS):
            self.assertEqual(FAMILY_BY_KEY[key], CONSO, key)
        for key in BIVARIATES:
            self.assertEqual(FAMILY_BY_KEY[key], BIVARIATE, key)
        self.assertEqual({k for k, f in FAMILY_BY_KEY.items() if f == ARTIF_STOCK}, {"artif_ha", "artif_pct"})
        self.assertEqual(len([k for k, f in FAMILY_BY_KEY.items() if f == ARTIF_FLUX]), 4)

    def test_chaque_valeur_en_hectares_a_sa_version_relative(self):
        self.assertEqual(relative_key("conso_ha"), "conso_pct_surface")
        self.assertEqual(relative_key("conso_habitat_ha"), "conso_habitat_pct_surface")
        for key, column in CONSO_AMOUNTS.items():
            relative = CONSO_COLUMNS[relative_key(key)]
            self.assertFalse(column.per_surface, key)
            self.assertTrue(relative.per_surface, key)
            self.assertEqual(relative.sum, column.sum, key)
        self.assertEqual(
            {relative_key(key) for key in CONSO_AMOUNTS} - set(EXISTING_CONSO_KEYS), set(NEW_RELATIVE_KEYS)
        )

    def test_request_error(self):
        self.assertIsNone(request_error("conso_pct_surface", None))
        self.assertIsNone(request_error("conso_habitat_pct_surface", "conso_habitat_ha"))
        self.assertIsNone(request_error("conso_activite_pct_surface", "conso_activite_ha"))
        self.assertIsNone(request_error("artif_pct", "artif_ha"))
        self.assertIsNone(request_error("artif_net_pct_surface", "artif_net_ha"))
        self.assertIsNone(request_error("artif_net_annual_pct_surface", "artif_net_annual_ha"))
        self.assertIsNone(request_error("bivariate_habitat_menages", None))
        self.assertIn("key invalide", request_error("conso_mixte_ha", None))
        self.assertIn("key invalide", request_error(None, None))
        self.assertIn("key invalide", request_error("surface_ha", None))
        # La colonne des hectares est la valeur absolue dont la colonne dessinée est la version relative
        self.assertIn("valeur acceptée conso_ha", request_error("conso_pct_surface", "artif_ha"))
        self.assertIn("amount invalide", request_error("conso_pct_surface", "conso_habitat_ha"))
        self.assertIn("amount invalide", request_error("conso_habitat_pct_surface", "conso_ha"))
        self.assertIn("amount invalide", request_error("artif_pct", "artif_net_ha"))
        self.assertIn("amount invalide", request_error("conso_pct_surface", "inconnue"))
        # Une valeur en hectares ou une évolution n'a pas de colonne des hectares
        self.assertIn("aucune valeur acceptée", request_error("conso_ha", "conso_ha"))
        self.assertIn("aucune valeur acceptée", request_error(EVOLUTION_KEY, "conso_ha"))

    def test_chaque_colonne_des_hectares_est_de_la_famille_de_sa_cle(self):
        self.assertEqual(len(AMOUNT_BY_KEY), len(CONSO_AMOUNTS) + 3)
        for key, amount in AMOUNT_BY_KEY.items():
            self.assertEqual(FAMILY_BY_KEY[key], FAMILY_BY_KEY[amount], key)
            self.assertNotIn(amount, AMOUNT_BY_KEY, key)
        self.assertIn("bivariée", request_error("bivariate_habitat_menages", "conso_habitat_ha"))

    def test_uses_period(self):
        self.assertTrue(uses_period("bivariate_activite_emplois"))
        self.assertFalse(uses_period(EVOLUTION_KEY))
        self.assertFalse(uses_period("artif_pct", "artif_ha"))
        self.assertTrue(uses_period("conso_habitat_pct_surface", "conso_habitat_ha"))
        # Toutes les colonnes de consommation portent sur la période choisie : les périodes de
        # référence n'ont pas de clé à elles, elles se demandent comme les autres
        for key, column in CONSO_COLUMNS.items():
            self.assertEqual(column.sum.period, SELECTION, key)
            self.assertTrue(uses_period(key), key)

    def test_needed_sums_sans_doublon(self):
        self.assertEqual(needed_sums(["conso_pct_surface", "conso_ha"]), (ConsoSum("total", SELECTION),))
        self.assertEqual(
            needed_sums([EVOLUTION_KEY, "conso_habitat_pct_surface", "conso_habitat_ha"]),
            (ConsoSum("total", "p1"), ConsoSum("total", "p2"), ConsoSum("habitat", SELECTION)),
        )

    def test_conso_periods(self):
        self.assertEqual(conso_periods(None, 2024), {"p1": (2011, 2020), "p2": (2021, 2024), "total": (2011, 2024)})
        self.assertEqual(conso_periods((2013, 2019), 2024)[SELECTION], (2013, 2019))

    def test_requested_keys(self):
        self.assertEqual(requested_keys("conso_pct_surface", None), ("conso_pct_surface",))
        self.assertEqual(requested_keys("conso_pct_surface", "conso_ha"), ("conso_pct_surface", "conso_ha"))


class ReferentialTest(TestCase):
    def test_colonnes_alignees_sur_les_identifiants_tries(self):
        referential = build_referential(
            [
                ("2A004", "Ajaccio", 8203.0, True, True, "94"),
                ("97601", "Acoua", 1262.0, False, True, "06"),
                ("01001", "L'Abergement-Clémenciat", 1565.0, True, False, "84"),
            ]
        )
        self.assertEqual(referential.ids, ["01001", "2A004", "97601"])
        self.assertEqual(referential.regions, ["84", "94", "06"])
        self.assertEqual(referential.surfaces, [1565.0, 8203.0, 1262.0])
        self.assertEqual(referential.has_conso, [True, True, False])
        self.assertEqual(referential.has_ocsge, [False, True, True])
        self.assertEqual(referential.without_conso, [("97601", "Acoua")])
        self.assertEqual(referential.without_ocsge, [("01001", "L'Abergement-Clémenciat")])


class ConsoColumnsTest(TestCase):
    PERIODS = conso_periods((2011, 2012), 2024)

    def setUp(self):
        self.referential = _referential(
            ("A", 200.0, True, True), ("B", 50.0, False, True), ("C", 0.0, True, True), ("D", 10.0, True, True)
        )
        # 1 ha en 2011, 2 ha en 2012 (dont 1,5 pour l'habitat), 0,5 ha par an ensuite
        self.conso = {
            land_id: {
                2011: _vintage(10_000.0),
                2012: _vintage(20_000.0, habitat=15_000.0),
                **{year: _vintage(5_000.0) for year in range(2013, 2025)},
            }
            for land_id in ("A", "B", "C")
        }

    def _columns(self, *keys):
        return conso_columns(keys, self.referential, _sums_by_land(self.conso, keys, self.PERIODS), self.PERIODS)

    def test_colonnes_alignees_et_arrondies(self):
        columns = self._columns("conso_ha", "conso_habitat_ha", "conso_activite_ha")
        self.assertEqual(list(columns), ["conso_ha", "conso_habitat_ha", "conso_activite_ha"])
        self.assertEqual(columns["conso_ha"], [3.0, None, 3.0, None])
        self.assertEqual(columns["conso_habitat_ha"], [1.5, None, 1.5, None])
        self.assertEqual(columns["conso_activite_ha"], [0.0, None, 0.0, None])

    def test_sans_donnee_de_consommation_la_valeur_est_nulle(self):
        # B a des millésimes mais has_conso est faux ; D n'a aucun millésime
        for key in FAMILY_BY_KEY:
            if FAMILY_BY_KEY[key] == CONSO:
                column = self._columns(key)[key]
                self.assertIsNone(column[1], key)
                self.assertIsNone(column[3], key)

    def test_versions_relatives(self):
        columns = self._columns(*CONSO_COLUMNS)
        # Hectares divisés par la surface, fois 100 : 3 ha sur 200 ha
        self.assertEqual(columns["conso_pct_surface"][0], 1.5)
        self.assertEqual(columns["conso_habitat_pct_surface"][0], 0.75)
        self.assertEqual(columns["conso_activite_pct_surface"][0], 0.0)
        # Sans surface, pas de version relative, mais la valeur en hectares reste
        for key in CONSO_AMOUNTS:
            self.assertIsNotNone(columns[key][2], key)
            self.assertIsNone(columns[relative_key(key)][2], key)

    def test_arrondis_des_versions_relatives(self):
        referential = _referential(("A", 300.0, True, True))
        conso = {"A": {year: _vintage(10_000.0, habitat=5_000.0) for year in range(2011, 2025)}}
        keys = ("conso_pct_surface", "conso_habitat_pct_surface")
        periods = conso_periods((2011, 2012), 2024)
        columns = conso_columns(keys, referential, _sums_by_land(conso, keys, periods), periods)
        # 2 ha sur 300 ha : 0,6666… % ; 1 ha sur 300 ha : 0,3333… %
        self.assertEqual(columns["conso_pct_surface"], [0.67])
        self.assertEqual(columns["conso_habitat_pct_surface"], [0.33])

    def test_evolution_entre_les_periodes_de_reference(self):
        # 0,7 ha par an puis 0,5 ha par an
        self.assertEqual(self._columns(EVOLUTION_KEY)[EVOLUTION_KEY], [-28.57, None, -28.57, None])

    def test_somme_absente_pour_une_periode(self):
        # Un seul millésime, en 2011 : une valeur sur la première période de référence, aucune
        # sur la seconde, et pas d'évolution de l'une à l'autre
        conso = {"A": {2011: _vintage(10_000.0)}}
        referential = _referential(("A", 100.0, True, True))
        keys = ("conso_ha", EVOLUTION_KEY)
        columns = {}
        for name in ("p1", "p2"):
            periods = conso_periods(self.PERIODS[name], 2024)
            columns[name] = conso_columns(keys, referential, _sums_by_land(conso, keys, periods), periods)
        self.assertEqual(columns["p1"], {"conso_ha": [1.0], EVOLUTION_KEY: [None]})
        self.assertEqual(columns["p2"], {"conso_ha": [None], EVOLUTION_KEY: [None]})

    def test_sums_in_year_order(self):
        sums = (ConsoSum("total", SELECTION), ConsoSum("habitat", SELECTION), ConsoSum("total", "p2"))
        self.assertEqual(sums_in_year_order(self.conso["A"], sums, self.PERIODS), (30_000.0, 15_000.0, 20_000.0))
        self.assertEqual(sums_in_year_order({2011: _vintage(1.0)}, sums, self.PERIODS), (1.0, 0.0, None))
        self.assertEqual(sums_in_year_order({}, sums, self.PERIODS), (None, None, None))


class SameValuesAsIndicatorsTest(TestCase):
    """Chaque clé déjà servie par « indicateurs » a exactement la même valeur dans « valeurs »."""

    # Les trois périodes de référence, puis des périodes quelconques
    PERIODS = ((2011, 2024), (2011, 2020), (2021, 2024), (2013, 2019), (2015, 2015), (2011, 2011), (2024, 2024))

    def setUp(self):
        # Valeurs non entières, années et consommations manquantes, surfaces nulles ou inconnues :
        # tout ce qui peut faire diverger une somme ou un arrondi
        rng = random.Random(1687)
        self.surfaces = {}
        self.conso = {}
        for index in range(400):
            land_id = f"{index:05d}"
            self.surfaces[land_id] = rng.choice([0.0, rng.uniform(1, 30_000), rng.uniform(1, 30_000)])
            if index % 50 == 7:
                continue  # territoire sans aucun millésime
            by_year = {}
            for year in range(YEARS[0], YEARS[1] + 1):
                if rng.random() < 0.05:
                    continue
                total = rng.choice([0.0, float(rng.randrange(0, 500_000)), rng.uniform(0, 500_000)])
                habitat = total * rng.random()
                by_year[year] = (
                    total,
                    rng.choice([habitat, habitat, None]),
                    rng.choice([total - habitat, None]),
                    0.0,
                    0.0,
                    0.0,
                    0.0,
                )
            self.conso[land_id] = by_year
        self.referential = build_referential(
            (land_id, land_id, surface, True, True, "84") for land_id, surface in self.surfaces.items()
        )

    def test_cles_de_consommation(self):
        compared = 0
        for period in self.PERIODS:
            expected = build_indicators("COMM", period, YEARS, self.surfaces, self.conso, {}, {})["lands"]
            periods = conso_periods(period, YEARS[1])
            columns = conso_columns(
                EXISTING_CONSO_KEYS,
                self.referential,
                _sums_by_land(self.conso, EXISTING_CONSO_KEYS, periods),
                periods,
            )
            for key in EXISTING_CONSO_KEYS:
                for land_id, value in zip(self.referential.ids, columns[key]):
                    self.assertEqual(value, expected[land_id][key], (period, key, land_id))
                    compared += value is not None
        # Le jeu d'essai produit bien des valeurs, et pas seulement des nulles des deux côtés
        self.assertGreater(compared, 10_000)

    def test_cartes_bivariees(self):
        rng = random.Random(2026)
        rates = {
            key: {
                land_id: (rng.uniform(0, 1), rng.choice([None, rng.uniform(-3, 3)]))
                for land_id in self.surfaces
                if rng.random() < 0.9
            }
            for key in BIVARIATES
        }
        thresholds = {
            "bivariate_activite_emplois": (0.21234567, 0.61234567, -0.31234567, 1.21234567),
            "bivariate_habitat_menages": (0.3, 0.6, 0.0, 2.0),
            "bivariate_habitat_population": None,
        }
        indicators = build_indicators("COMM", (2013, 2019), YEARS, self.surfaces, self.conso, rates, thresholds)
        for key in BIVARIATES:
            content = bivariate_content(key, self.referential, rates[key], thresholds[key])
            self.assertEqual(content["bivariate"], indicators["bivariate"][key])
            for index, land_id in enumerate(self.referential.ids):
                expected = indicators["lands"][land_id][key] or {"class": None, "conso_rate": None, "indic_rate": None}
                actual = {
                    "class": content["classes"][index],
                    "conso_rate": content["conso_rates"][index],
                    "indic_rate": content["indic_rates"][index],
                }
                self.assertEqual(actual, expected, (key, land_id))
        # Sans seuils pour la période, aucune classe
        key = "bivariate_habitat_population"
        self.assertEqual(set(bivariate_content(key, self.referential, rates[key], thresholds[key])["classes"]), {None})


class BivariateContentTest(TestCase):
    def test_classes_et_taux_par_territoire(self):
        referential = _referential(("A", 1.0, True, True), ("B", 1.0, False, True), ("C", 1.0, True, True))
        rates = {"A": (0.123456, 1.987654), "B": (0.9, 3.0)}
        content = bivariate_content("bivariate_habitat_menages", referential, rates, (0.1, 0.2, 0.3, 0.4))
        # B n'a pas de donnée de consommation, C n'a pas de taux
        self.assertEqual(content["classes"], [5, None, None])
        self.assertEqual(content["conso_rates"], [0.1235, None, None])
        self.assertEqual(content["indic_rates"], [1.9877, None, None])
        self.assertEqual(content["bivariate"]["conso_thresholds"], [0.1, 0.2])
        self.assertEqual(len(content["bivariate"]["palette"]), 9)
        self.assertEqual(content["bivariate"]["indicator_label"], "Évolution du nombre de ménages")


class ArtifContentTest(TestCase):
    def setUp(self):
        self.referential = _referential(
            ("A", 10_000.0, True, True),
            ("B", 10_000.0, True, True),
            ("C", 10_000.0, True, False),
            ("D", 10_000.0, True, True),
            ("E", 10_000.0, True, True),
        )
        lands = [
            land_row("A"),
            land_row("B", years=(2022,)),
            land_row("C", has_ocsge=False),
            land_row("D"),
        ]
        flux = {
            "A": [flux_row("A")],
            "B": [flux_row("B", year_old=2019, year_new=2022)],
            "D": [flux_row("D", artif=1.0, desartif=5.0)],
        }
        self.expected = build_artif_indicators("COMM", lands, flux)["lands"]
        self.columns = artif_columns(self.referential, self.expected)

    def test_memes_valeurs_que_les_indicateurs_d_artificialisation(self):
        self.assertEqual(set(self.columns["values"]), set(ARTIF_VALUE_KEYS))
        for key in ARTIF_VALUE_KEYS:
            for land_id, value in zip("ABCD", self.columns["values"][key]):
                self.assertEqual(value, self.expected[land_id][key], (key, land_id))
        self.assertEqual(self.columns["values"]["artif_net_ha"], [30.0, 30.0, None, -4.0, None])

    def test_millesimes_ecrits_une_fois_par_jeu(self):
        for family, fields in ARTIF_YEAR_FIELDS.items():
            content = artif_content(ARTIF_KEYS[family][0], None, self.columns)
            self.assertEqual(len(content["year_set_index"]), 5)
            for land_id, rank in zip("ABCD", content["year_set_index"]):
                self.assertEqual(
                    content["year_sets"][rank], {field: self.expected[land_id][field] for field in fields}, land_id
                )
        stock = artif_content("artif_pct", None, self.columns)
        self.assertEqual(
            stock["year_sets"],
            [
                {"artif_years": [2021], "artif_index": 2},
                {"artif_years": [2022], "artif_index": 2},
                {"artif_years": [], "artif_index": None},
            ],
        )
        self.assertEqual(stock["year_set_index"], [0, 1, 2, 0, 2])
        flux = artif_content("artif_net_ha", None, self.columns)
        self.assertEqual(
            flux["year_sets"][0],
            {
                "artif_net_years_old": [2018],
                "artif_net_years_new": [2021],
                "artif_net_index_old": 1,
                "artif_net_index_new": 2,
            },
        )
        self.assertEqual(flux["year_set_index"], [0, 1, 2, 0, 2])

    def test_territoire_inconnu_des_indicateurs(self):
        # E n'est pas dans la réponse d'artificialisation : aucune valeur, aucun millésime
        for key in ARTIF_VALUE_KEYS:
            self.assertIsNone(self.columns["values"][key][4], key)

    def test_colonne_des_hectares(self):
        content = artif_content("artif_pct", "artif_ha", self.columns)
        self.assertEqual(content["values"], [10.0, 10.0, None, 10.0, None])
        self.assertEqual(content["amounts"], [1000.0, 1000.0, None, 1000.0, None])
        self.assertNotIn("amounts", artif_content("artif_pct", None, self.columns))

    def test_indexed_year_sets_ne_partage_pas_les_listes(self):
        land = {"artif_years": [2021]}
        year_sets, index = indexed_year_sets([land, land], ("artif_years",))
        self.assertEqual((year_sets, index), ([{"artif_years": [2021]}], [0, 0]))
        self.assertIsNot(year_sets[0]["artif_years"], land["artif_years"])


class BuildValuesTest(TestCase):
    def setUp(self):
        self.referential = _referential(
            ("01001", 100.0, True, True), ("97601", 50.0, False, True), ("97301", 80.0, True, False)
        )

    def test_reponse_d_une_cle_de_consommation(self):
        columns = {"conso_pct_surface": [1.5, None, 2.0], "conso_ha": [1.5, None, 1.6]}
        content = scalar_content("conso_pct_surface", "conso_ha", columns)
        response = build_values("COMM", "conso_pct_surface", "conso_ha", (2013, 2019), self.referential, content)
        self.assertEqual(
            response,
            {
                "scale": "COMM",
                "key": "conso_pct_surface",
                "amount": "conso_ha",
                "start_year": 2013,
                "end_year": 2019,
                "ids": ["01001", "97301", "97601"],
                "regions": ["01", "97", "97"],
                "values": [1.5, None, 2.0],
                "amounts": [1.5, None, 1.6],
                "no_data": [["97601", "Commune 97601"]],
                "no_data_count": 1,
            },
        )

    def test_sans_periode_ni_colonne_des_hectares(self):
        content = scalar_content("artif_pct", None, {"artif_pct": [10.0, None, 12.0]})
        response = build_values("COMM", "artif_pct", None, None, self.referential, content)
        self.assertEqual((response["amount"], response["start_year"], response["end_year"]), (None, None, None))
        self.assertNotIn("amounts", response)
        # Pour l'artificialisation, les territoires sans donnée sont ceux sans OCS GE
        self.assertEqual(response["no_data"], [["97301", "Commune 97301"]])

    def test_carte_bivariee_les_territoires_sans_donnee_sont_ceux_sans_consommation(self):
        response = build_values("COMM", "bivariate_habitat_menages", None, (2013, 2019), self.referential, {})
        self.assertEqual(response["no_data"], [["97601", "Commune 97601"]])

    def test_no_data_plafonne(self):
        referential = _referential(*((f"{index:05d}", 1.0, False, True) for index in range(NO_DATA_LIMIT + 7)))
        response = build_values("COMM", "conso_ha", None, (2011, 2024), referential, {})
        self.assertEqual(len(response["no_data"]), NO_DATA_LIMIT)
        self.assertEqual(response["no_data"][0], ["00000", "Commune 00000"])
        self.assertEqual(response["no_data_count"], NO_DATA_LIMIT + 7)


class CompressedBodyTest(TestCase):
    PAYLOAD = {"ids": ["01001", "2A004"], "values": [0.12, None], "no_data": [["97601", "Bandraboua-É"]]}

    def test_json_compact_lisible_apres_decompression(self):
        raw = gzip.decompress(compressed_body(self.PAYLOAD))
        self.assertEqual(json.loads(raw), self.PAYLOAD)
        self.assertEqual(
            raw.decode("utf-8"), '{"ids":["01001","2A004"],"values":[0.12,null],"no_data":[["97601","Bandraboua-É"]]}'
        )

    def test_memes_octets_pour_le_meme_contenu(self):
        # L'en-tête gzip ne porte pas l'heure de compression
        with mock.patch("time.time", return_value=1_700_000_000):
            first = compressed_body(self.PAYLOAD)
        with mock.patch("time.time", return_value=1_800_000_000):
            second = compressed_body(dict(self.PAYLOAD))
        self.assertEqual(first, second)


# Cache en mémoire propre à ces tests : celui des tests locaux ne retient rien
LOCAL_MEMORY_CACHE = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "test-national-map-values"}
}


@mock.patch("public_data.views.NationalMapIndicatorsView.available_years", return_value=YEARS)
class NationalMapValuesViewTest(SimpleTestCase):
    url = "/public/national-map/values"
    payload = {"scale": "COMM", "key": "conso_pct_surface", "ids": ["01001", "2A004"], "values": [0.12, None]}

    def test_parametres_invalides(self, _):
        for params in (
            {},
            {"key": "inconnue"},
            {"key": "surface_ha"},
            {"key": "conso_pct_surface", "scale": "EPCI"},
            {"key": "conso_pct_surface", "scale": "REGION"},
            {"key": "conso_pct_surface", "parent_type": "REGION", "parent_id": "75"},
            {"key": "conso_pct_surface", "parent_id": "75"},
            {"key": "conso_pct_surface", "amount": "artif_ha"},
            {"key": "conso_pct_surface", "amount": "conso_habitat_ha"},
            {"key": "conso_ha", "amount": "conso_ha"},
            {"key": "bivariate_habitat_menages", "amount": "conso_habitat_ha"},
            {"key": "conso_pct_surface", "start_year": "2010"},
            {"key": "conso_pct_surface", "end_year": "2025"},
            {"key": "conso_pct_surface", "start_year": "2021", "end_year": "2020"},
            {"key": "bivariate_habitat_menages", "start_year": "abc"},
        ):
            with mock.patch("public_data.views.NationalMapValuesView.build") as build:
                response = self.client.get(self.url, params)
            self.assertEqual(response.status_code, 400, params)
            self.assertIn("detail", response.json(), params)
            build.assert_not_called()

    def test_sans_donnee_de_consommation(self, available_years):
        available_years.return_value = None
        self.assertEqual(self.client.get(self.url, {"key": "conso_pct_surface"}).status_code, 404)
        self.assertEqual(self.client.get(self.url, {"key": EVOLUTION_KEY}).status_code, 404)

    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_periode_par_defaut_et_maille_par_defaut(self, build, _):
        build.return_value = self.payload
        response = self.client.get(self.url, {"key": "conso_pct_surface", "amount": "conso_ha"})
        self.assertEqual(response.status_code, 200)
        build.assert_called_once_with("COMM", "conso_pct_surface", "conso_ha", (2011, 2024), YEARS)

    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_periode_demandee(self, build, _):
        build.return_value = self.payload
        params = {"scale": "COMM", "key": "bivariate_habitat_menages", "start_year": "2015", "end_year": "2015"}
        self.client.get(self.url, params)
        build.assert_called_once_with("COMM", "bivariate_habitat_menages", None, (2015, 2015), YEARS)

    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_cle_sans_periode_les_annees_sont_ignorees(self, build, available_years):
        build.return_value = self.payload
        # Évolution entre les périodes de référence : la période demandée ne compte pas, même invalide
        response = self.client.get(self.url, {"key": EVOLUTION_KEY, "start_year": "1999"})
        self.assertEqual(response.status_code, 200)
        build.assert_called_once_with("COMM", EVOLUTION_KEY, None, None, YEARS)
        # Artificialisation : les années de consommation ne sont même pas lues
        build.reset_mock()
        available_years.reset_mock()
        self.client.get(self.url, {"key": "artif_pct", "amount": "artif_ha", "end_year": "2030"})
        build.assert_called_once_with("COMM", "artif_pct", "artif_ha", None, None)
        available_years.assert_not_called()

    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_corps_compresse_renvoye_tel_quel(self, build, _):
        build.return_value = self.payload
        response = self.client.get(self.url, {"key": "conso_pct_surface"}, headers={"accept-encoding": "gzip, br"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Encoding"], "gzip")
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response["Cache-Control"], "public, max-age=600")
        self.assertIn("Accept-Encoding", response["Vary"])
        # Mêmes octets qu'un calcul direct : GZipMiddleware ne recompresse pas
        self.assertEqual(response.content, compressed_body(self.payload))
        self.assertEqual(json.loads(gzip.decompress(response.content)), self.payload)

    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_client_sans_gzip(self, build, _):
        build.return_value = self.payload
        response = self.client.get(self.url, {"key": "conso_pct_surface"}, headers={"accept-encoding": "identity"})
        self.assertFalse(response.has_header("Content-Encoding"))
        self.assertEqual(response.json(), self.payload)
        self.assertIn("Accept-Encoding", response["Vary"])
        self.assertEqual(response["Cache-Control"], "public, max-age=600")

    @override_settings(CACHES=LOCAL_MEMORY_CACHE)
    @mock.patch("public_data.views.NationalMapValuesView.build")
    def test_corps_en_cache(self, build, _):
        cache.clear()
        self.addCleanup(cache.clear)
        build.return_value = self.payload
        params = {"key": "conso_pct_surface", "amount": "conso_ha", "start_year": "2013", "end_year": "2019"}
        first = self.client.get(self.url, params, headers={"accept-encoding": "gzip"})
        second = self.client.get(self.url, params, headers={"accept-encoding": "gzip"})
        plain = self.client.get(self.url, params)
        build.assert_called_once()
        # Le corps servi depuis le cache est celui du calcul direct, à l'octet près
        self.assertEqual(first.content, compressed_body(self.payload))
        self.assertEqual(second.content, first.content)
        self.assertEqual(plain.json(), self.payload)
        # Une autre clé, une autre colonne des hectares ou une autre période : un autre corps
        for other in (
            {"key": "conso_habitat_pct_surface", "amount": "conso_habitat_ha"},
            {"key": "conso_ha", "amount": ""},
            {"amount": ""},
            {"end_year": "2020"},
        ):
            build.reset_mock()
            self.client.get(self.url, {**params, **other})
            build.assert_called_once()

    @mock.patch("public_data.views.NationalMapValuesView.build")
    @mock.patch("public_data.views.cache")
    def test_cles_de_cache_versionnees_et_durees(self, cache, build, _):
        cache.get.return_value = None
        cache.get_or_set.return_value = YEARS
        build.return_value = self.payload
        expected = (
            # Clé sans période : un jour ; période de référence, dont celle par défaut : une heure ;
            # autre période : dix minutes
            ({"key": EVOLUTION_KEY}, f"COMM:{EVOLUTION_KEY}:-:sans-periode", 60 * 60 * 24),
            ({"key": "artif_pct", "amount": "artif_ha"}, "COMM:artif_pct:artif_ha:sans-periode", 60 * 60 * 24),
            ({"key": "conso_pct_surface", "amount": "conso_ha"}, "COMM:conso_pct_surface:conso_ha:2011-2024", 60 * 60),
            ({"key": "conso_ha", "end_year": "2020"}, "COMM:conso_ha:-:2011-2020", 60 * 60),
            ({"key": "conso_ha", "start_year": "2021"}, "COMM:conso_ha:-:2021-2024", 60 * 60),
            ({"key": "conso_ha", "start_year": "2013"}, "COMM:conso_ha:-:2013-2024", 60 * 10),
            ({"key": "conso_ha", "start_year": "2021", "end_year": "2023"}, "COMM:conso_ha:-:2021-2023", 60 * 10),
        )
        for params, suffix, duration in expected:
            cache.set.reset_mock()
            self.client.get(self.url, params)
            cache_key = f"national-map:values:v{VALUES_CACHE_VERSION}:{suffix}"
            cache.get.assert_called_with(cache_key)
            cache.set.assert_called_once_with(cache_key, compressed_body(self.payload), duration)


class ValuesBuildTest(SimpleTestCase):
    """Lectures faites par la vue selon la famille de la clé, tables simulées."""

    REFERENTIAL = _referential(("01001", 200.0, True, True), ("97601", 50.0, False, True))

    def setUp(self):
        patcher = mock.patch("public_data.views.NationalMapValuesView.referential", return_value=self.REFERENTIAL)
        patcher.start()
        self.addCleanup(patcher.stop)

    @mock.patch("public_data.views.NationalMapValuesView.conso_sums")
    def test_consommation(self, conso_sums):
        conso_sums.return_value = {"01001": [30_000.0], "97601": [10_000.0]}
        response = NationalMapValuesView().build("COMM", "conso_pct_surface", "conso_ha", (2013, 2019), YEARS)
        conso_sums.assert_called_once_with("COMM", (ConsoSum("total", SELECTION),), conso_periods((2013, 2019), 2024))
        self.assertEqual(response["values"], [1.5, None])
        self.assertEqual(response["amounts"], [3.0, None])
        self.assertEqual((response["start_year"], response["end_year"]), (2013, 2019))
        self.assertEqual(response["no_data"], [["97601", "Commune 97601"]])

    @mock.patch("public_data.views.NationalMapValuesView.conso_sums")
    def test_periodes_de_reference(self, conso_sums):
        conso_sums.return_value = {"01001": [70_000.0, 20_000.0]}
        response = NationalMapValuesView().build("COMM", EVOLUTION_KEY, None, None, YEARS)
        conso_sums.assert_called_once_with(
            "COMM", (ConsoSum("total", "p1"), ConsoSum("total", "p2")), conso_periods(None, 2024)
        )
        # 0,7 ha par an puis 0,5 ha par an
        self.assertEqual(response["values"], [-28.57, None])
        self.assertEqual((response["start_year"], response["end_year"]), (None, None))

    @mock.patch("public_data.views.NationalMapIndicatorsView.bivariate_thresholds")
    @mock.patch("public_data.views.NationalMapIndicatorsView.bivariate_rates")
    def test_carte_bivariee(self, bivariate_rates, bivariate_thresholds):
        key = "bivariate_habitat_menages"
        bivariate_rates.return_value = {**{k: {} for k in BIVARIATES}, key: {"01001": (0.5, 1.0), "97601": (0.5, 1.0)}}
        bivariate_thresholds.return_value = {**{k: None for k in BIVARIATES}, key: (0.3, 0.6, 0.0, 2.0)}
        response = NationalMapValuesView().build("COMM", key, None, (2013, 2019), YEARS)
        # Mêmes lectures que la vue « indicateurs » : table compacte des taux, ou son repli
        bivariate_rates.assert_called_once_with("COMM", (2013, 2019))
        bivariate_thresholds.assert_called_once_with("COMM", (2013, 2019))
        self.assertEqual(response["classes"], [4, None])
        self.assertEqual(response["conso_rates"], [0.5, None])
        self.assertEqual(response["bivariate"]["conso_thresholds"], [0.3, 0.6])
        self.assertNotIn("values", response)

    @mock.patch("public_data.views.NationalMapArtifIndicatorsView.build")
    def test_artificialisation(self, artif_build):
        artif_build.return_value = build_artif_indicators(
            "COMM", [land_row("01001"), land_row("97601")], {"01001": [flux_row("01001")]}
        )
        response = NationalMapValuesView().build("COMM", "artif_net_pct_surface", "artif_net_ha", None, None)
        artif_build.assert_called_once_with("COMM")
        self.assertEqual(response["values"], [0.3, None])
        self.assertEqual(response["amounts"], [30.0, None])
        self.assertEqual(response["year_set_index"], [0, 1])
        self.assertEqual(
            response["year_sets"][0],
            {
                "artif_net_years_old": [2018],
                "artif_net_years_new": [2021],
                "artif_net_index_old": 1,
                "artif_net_index_new": 2,
            },
        )
        self.assertEqual(response["no_data"], [])

    @override_settings(CACHES=LOCAL_MEMORY_CACHE)
    @mock.patch("public_data.views.NationalMapArtifIndicatorsView.build")
    def test_artificialisation_lue_une_fois_pour_toutes_les_cles(self, artif_build):
        cache.clear()
        self.addCleanup(cache.clear)
        artif_build.return_value = build_artif_indicators("COMM", [land_row("01001")], {})
        view = NationalMapValuesView()
        for key in ARTIF_VALUE_KEYS:
            view.build("COMM", key, None, None, None)
        artif_build.assert_called_once_with("COMM")


class ReferentialReadTest(SimpleTestCase):
    LANDS = [("01001", "L'Abergement-Clémenciat", 1565.0, True, True, ["EPCI_200069193", "DEPART_01", "REGION_84"])]

    @override_settings(CACHES=LOCAL_MEMORY_CACHE)
    @mock.patch("public_data.views._lands")
    def test_referentiel_lu_une_seule_fois(self, lands):
        cache.clear()
        self.addCleanup(cache.clear)
        lands.return_value.values_list.return_value = self.LANDS
        view = NationalMapValuesView()
        self.assertEqual(view.referential("COMM"), view.referential("COMM"))
        lands.assert_called_once_with("COMM")

    @mock.patch("public_data.views.cache")
    def test_cles_de_cache_du_referentiel_et_de_l_artificialisation(self, cache):
        view = NationalMapValuesView()
        view.referential("COMM")
        view.artif_columns("COMM", mock.sentinel.referential)
        self.assertEqual(
            [(call.args[0], call.args[2]) for call in cache.get_or_set.call_args_list],
            [
                (f"national-map:values:referential:v{VALUES_CACHE_VERSION}:COMM", 60 * 60 * 24),
                (f"national-map:values:artif:v{VALUES_CACHE_VERSION}:COMM", 60 * 60 * 24),
            ],
        )

    def test_version_des_cles_de_cache(self):
        # Un changement de règle de calcul des indicateurs ou de l'artificialisation invalide aussi ces caches
        self.assertEqual(NationalMapValuesView.CACHE_VERSION, VALUES_CACHE_VERSION)

    @mock.patch("public_data.views._lands")
    def test_referential(self, lands):
        lands.return_value.values_list.return_value = [
            ("29083", "Île-de-Sein", 60.0, False, True, [None, "DEPART_29", "REGION_53", None]),
            ("01001", "L'Abergement-Clémenciat", 1565.0, True, True, ["EPCI_200069193", "DEPART_01", "REGION_84"]),
        ]
        referential = NationalMapValuesView().referential("COMM")
        lands.assert_called_once_with("COMM")
        lands.return_value.values_list.assert_called_once_with(
            "land_id", "name", "surface", "has_conso", "has_ocsge", "parent_keys"
        )
        self.assertEqual(referential.ids, ["01001", "29083"])
        self.assertEqual(referential.regions, ["84", "53"])
        self.assertEqual(referential.without_conso, [("29083", "Île-de-Sein")])


class ConsoSumsTest(DatabaseTestCase):
    """Sommes faites par la base : identiques à celles que la réponse « indicateurs » fait en Python."""

    def setUp(self):
        # Table non gérée par Django : créée pour le test, dans sa transaction. La colonne habitat
        # accepte les valeurs nulles, comme dans la table copiée par le DAG update_app.
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(LandConso)
        with connection.cursor() as cursor:
            cursor.execute("ALTER TABLE public_data_landconso ALTER COLUMN habitat DROP NOT NULL")
        rng = random.Random(1687)
        rows = []
        for index in range(60):
            for year in range(YEARS[0], YEARS[1] + 1):
                if index == 3 and year >= 2021:
                    continue  # aucun millésime après 2020
                if index % 3 == 0:
                    # Valeurs non entières : leur somme dépend de l'ordre des termes
                    total = rng.uniform(0, 500_000)
                else:
                    total = float(rng.randrange(0, 500_000))
                habitat = None if index == 5 and year % 2 else round(total * 0.37)
                rows.append(self._row(f"{index:05d}", year, total, habitat, total / 4))
        rows.append(self._row("33", 2015, 1.0, 1.0, 0.0, land_type="DEPART"))
        # Insertion dans le désordre : la somme ne doit pas dépendre de l'ordre des lignes
        rng.shuffle(rows)
        LandConso.objects.bulk_create(rows)

    @staticmethod
    def _row(land_id, year, total, habitat, activite, land_type="COMM"):
        return LandConso(
            land_id=land_id,
            land_type=land_type,
            surface=1.0,
            year=year,
            total=total,
            habitat=habitat,
            activite=activite,
            mixte=0.0,
            route=0.0,
            ferroviaire=0.0,
            inconnu=0.0,
        )

    def _expected(self, sums, periods):
        vintages = group_by_land(
            LandConso.objects.filter(land_type="COMM").values_list("land_id", "year", *CONSO_FIELDS)
        )
        return {land_id: sums_in_year_order(by_year, sums, periods) for land_id, by_year in vintages.items()}

    def test_memes_sommes_qu_en_python_au_bit_pres(self):
        # Totaux et habitat : entiers pour 40 territoires, dont les sommes viennent de la base.
        # Avec les activités, aucun territoire n'est entier : tous sont additionnés en Python.
        # Avec l'évolution, les sommes portent sur trois périodes à la fois : la période choisie et
        # les deux périodes de référence.
        all_sums = needed_sums((*CONSO_COLUMNS, EVOLUTION_KEY))
        totals_and_habitat = tuple(s for s in all_sums if s.field != "activite")
        for sums in (totals_and_habitat, all_sums):
            for period in ((2011, 2024), (2013, 2019), (2015, 2015)):
                periods = conso_periods(period, YEARS[1])
                actual = NationalMapValuesView.conso_sums("COMM", sums, periods)
                expected = self._expected(sums, periods)
                self.assertEqual(set(actual), set(expected))
                for land_id in expected:
                    self.assertEqual(tuple(actual[land_id]), expected[land_id], (period, land_id))

    def test_somme_absente_sans_millesime_dans_la_periode(self):
        periods = conso_periods(None, YEARS[1])
        sums = (ConsoSum("total", "p1"), ConsoSum("total", "p2"))
        actual = NationalMapValuesView.conso_sums("COMM", sums, periods)
        self.assertIsNotNone(actual["00003"][0])
        self.assertIsNone(actual["00003"][1])
        self.assertIsNotNone(actual["00004"][1])

    def test_territoire_absent_sans_millesime_dans_les_periodes_lues(self):
        periods = conso_periods((2022, 2023), YEARS[1])
        actual = NationalMapValuesView.conso_sums("COMM", (ConsoSum("habitat", SELECTION),), periods)
        self.assertNotIn("00003", actual)
        self.assertEqual(len(actual), 59)
        # Une consommation non renseignée compte pour zéro
        self.assertEqual(tuple(actual["00005"]), self._expected((ConsoSum("habitat", SELECTION),), periods)["00005"])

    def test_seuls_les_territoires_a_valeur_non_entiere_sont_relus(self):
        periods = conso_periods((2011, 2024), YEARS[1])
        with mock.patch("public_data.views.sums_in_year_order", wraps=sums_in_year_order) as resummed:
            NationalMapValuesView.conso_sums("COMM", (ConsoSum("total", SELECTION),), periods)
        self.assertEqual(resummed.call_count, 20)
        # Les activités (total / 4) ne sont entières pour presque aucun territoire : tous sont relus
        with mock.patch("public_data.views.sums_in_year_order", wraps=sums_in_year_order) as resummed:
            NationalMapValuesView.conso_sums("COMM", (ConsoSum("activite", SELECTION),), periods)
        self.assertEqual(resummed.call_count, 60)
