"""
Variantes « carte nationale » des graphiques du diagnostic : leurs titres et sous-titres sont
figés ici, ainsi que le fait qu'elles ne changent rien d'autre, et que les graphiques du
diagnostic et de l'export gardent leurs titres.
"""

import copy
from contextlib import ExitStack
from unittest import TestCase
from unittest.mock import Mock, PropertyMock, patch

from project.api_urls import get_chart_klass_or_404
from project.charts import (
    AnnualConsoByDeterminantChart,
    ConsoByDeterminantPieChart,
    PopulationConsoProgressionChart,
)
from project.charts.artificialisation import (
    ArtifByCouverturePieChart,
    ArtifFluxByCouverture,
    ArtifNetFluxChart,
    ArtifSyntheseChart,
)
from project.charts.consommation import ConsoAnnualChart
from project.charts.dossier_complet import DcEmploiChomageChart, DcMenagesEvolutionChart
from project.charts.mixins.NationalMapChartMixin import (
    NationalMapChartMixin,
    at_millesimes_text,
    flux_subtitle,
    millesime_number,
    millesime_tick,
    millesime_years,
    period_text,
    years_range,
)

NATIONAL_MAP_SUFFIX = "_national_map"
EXPORT_SUFFIX = "_export"


class Rows(list):
    """Lignes d'une table, avec ce que les graphiques lisent d'un QuerySet."""

    def first(self):
        return self[0] if self else None

    def last(self):
        return self[-1] if self else None

    def exists(self):
        return bool(self)

    def values_list(self, field, flat=True):
        return [getattr(row, field) for row in self]


def yearly_conso(year, total_m2=120000.0, habitat_m2=60000.0):
    """Consommation d'une année : en hectares par destination (services), en m² au total (LandConso)."""
    return Mock(
        year=year, total=total_m2, habitat=habitat_m2, activite=3.0, mixte=1.0, route=0.5, ferre=0.5, non_renseigne=0.0
    )


def stock(years, percent, index):
    return Mock(years=years, percent=percent, surface=percent * 1000, flux_surface=120.0, millesime_index=index)


def cover(years):
    return Mock(
        years=years,
        departements=["69"],
        millesime_index=2,
        couverture="CS1.1.1.1",
        label="Zones bâties",
        label_short="Bâti",
        color="#ff377a",
        surface=1200.0,
        percent_of_artif=40.0,
        percent_of_land=4.0,
    )


def flux(years_old, years_new):
    return Mock(
        years_old=years_old,
        years_new=years_new,
        flux_artif=120.0,
        flux_desartif=20.0,
        flux_artif_net=100.0,
        couverture="CS1.1.1.1",
        label_short="Bâti",
        color="#ff377a",
    )


CONSO_PARAMS = {"start_date": "2011", "end_date": "2024"}
MILLESIME_PARAMS = {"index": "2", "millesime_new_index": "2", "millesime_old_index": "1"}
CONSO_YEARS = Rows(yearly_conso(year) for year in range(2011, 2025))
CENSUS = Mock(
    menages_11=1000,
    menages_16=1100,
    menages_22=1200,
    **{
        f"{name}_15_64_{year}": 100
        for name in ("actifs_occupes", "chomeurs", "inactifs", "pop")
        for year in (11, 16, 22)
    },
)

# Pour chaque graphique complémentaire de la carte nationale : son identifiant au diagnostic, sa
# classe, ses paramètres, les données qu'elle lit (propriétés remplacées), le titre que garde le
# graphique du diagnostic, puis le titre et le sous-titre de la variante de la carte nationale.
CASES = [
    (
        "chart_determinant",
        AnnualConsoByDeterminantChart,
        CONSO_PARAMS,
        {"data": CONSO_YEARS},
        "Évolution annuelle de la consommation d'espaces par destination à Rhône (2011 - 2024)",
        "Consommation d'ENAF par année et par destination",
        "En hectares, de 2011 à 2024",
    ),
    (
        "pie_determinant",
        ConsoByDeterminantPieChart,
        CONSO_PARAMS,
        {"data": yearly_conso(2024)},
        "Consommation d'espaces par destination à Rhône (2011 - 2024)",
        "Répartition de la consommation d'ENAF par destination",
        "En hectares, de 2011 à 2024",
    ),
    (
        "conso_annual",
        ConsoAnnualChart,
        {},
        {"data": CONSO_YEARS},
        "Consommation annuelle d'espaces NAF de Rhône (2011-2024)",
        "Consommation d'ENAF par année",
        "En hectares, de 2011 à 2024",
    ),
    (
        "population_conso_progression_chart",
        PopulationConsoProgressionChart,
        CONSO_PARAMS,
        {
            "data": {
                "population": [Mock(year=2011, population=1000, population_calculated=False)],
                "consommation": CONSO_YEARS,
            }
        },
        "Évolution de la consommation d'espaces NAF et de la population - Rhône (2011 - 2024)",
        "Consommation d'ENAF et population, par année",
        "En hectares par année et en nombre d'habitants aux recensements, de 2011 à 2024",
    ),
    (
        "dc_menages_evolution",
        DcMenagesEvolutionChart,
        CONSO_PARAMS,
        {"menages_data": CENSUS, "conso_data": CONSO_YEARS},
        "Ménages et consommation d'espaces - Rhône (2011 - 2024)",
        "Consommation d'ENAF et nombre de ménages, par année",
        "En hectares par année et en nombre de ménages aux recensements, de 2011 à 2024",
    ),
    (
        "dc_emploi_chomage",
        DcEmploiChomageChart,
        {},
        {"data": CENSUS},
        "Activité et chômage (15-64 ans) - Rhône",
        "Emploi et chômage des 15-64 ans",
        "En nombre de personnes, aux recensements de 2011, 2016 et 2022",
    ),
    (
        "artif_synthese",
        ArtifSyntheseChart,
        {},
        {"data": Rows([stock([2017], 10.0, 1), stock([2020], 10.5, 2)])},
        "Evolution du stock de surfaces artificialisées de Rhône entre 2017 et 2020",
        "Part du territoire artificialisée",
        "En\u00a0% de la surface du territoire, aux millésimes n°1 (2017) et n°2 (2020)",
    ),
    (
        "pie_artif_by_couverture",
        ArtifByCouverturePieChart,
        MILLESIME_PARAMS,
        {"data": [cover([2020])]},
        "Surfaces artificialisées par couverture  en 2020",
        "Surfaces artificialisées par type de couverture du sol",
        "En\u00a0% des surfaces artificialisées, au millésime n°2 (2020)",
    ),
    (
        "artif_net_flux",
        ArtifNetFluxChart,
        MILLESIME_PARAMS,
        {"data": flux([2017], [2020])},
        "Artificialisation nette entre 2017 et 2020",
        "Artificialisation, désartificialisation et artificialisation nette",
        "En hectares, entre le millésime n°1 (2017) et le millésime n°2 (2020)",
    ),
    (
        "artif_flux_by_couverture",
        ArtifFluxByCouverture,
        MILLESIME_PARAMS,
        {"data": Rows([flux([2017], [2020])])},
        "Artificialisation par couverture entre 2017 et 2020",
        "Artificialisation et désartificialisation par type de couverture du sol",
        "En hectares, entre le millésime n°1 (2017) et le millésime n°2 (2020)",
    ),
]

# Titres des graphiques de l'export, tels que les rapports les impriment
EXPORT_TITLES = {
    "chart_determinant": "Consommation annuelle d'espaces NAF par destination de Rhône entre 2011 et 2024 (en ha)",
    "pie_determinant": "Destinations de la consommation d'espaces NAF de Rhône entre 2011 et 2024 (en ha)",
    "artif_synthese": "Evolution du stock de surfaces artificialisées de Rhône entre 2017 et 2020 (en %)",
    "pie_artif_by_couverture": "Surfaces artificialisées par couverture sur le territoire de Rhône  en 2020",
    "artif_net_flux": "Artificialisation nette entre 2017 et 2020 sur le territoire Rhône (en ha)",
    "artif_flux_by_couverture": (
        "Artificialisation par couverture entre 2017 et 2020 sur le territoire de Rhône (en ha)"
    ),
}


def rhone():
    land = Mock(land_type="DEPART", land_id="69", is_interdepartemental=False)
    # `name` est un argument réservé de Mock
    land.name = "Rhône"
    return land


# Seule variante qui change autre chose que ses textes : les étiquettes de ses barres, une par millésime
MILLESIME_TICKS = {"artif_synthese": ["Millésime n°1<br/>(2017)", "Millésime n°2<br/>(2020)"]}


def without_national_map_texts(options, millesime_ticks=False):
    """Options d'un graphique sans ce qu'une variante de la carte nationale a le droit de changer."""
    options = copy.deepcopy(options)
    options.get("title", {}).pop("text", None)
    options.pop("subtitle", None)
    options["exporting"].pop("filename")
    if millesime_ticks:
        options["xAxis"].pop("categories")
    return options


class NationalMapChartsTest(TestCase):
    maxDiff = None

    def build(self, chart_id, klass, params, data):
        """Graphique d'un identifiant, les données de sa classe d'origine étant remplacées."""
        with ExitStack() as stack:
            for name, value in data.items():
                stack.enter_context(patch.object(klass, name, new_callable=PropertyMock, return_value=value))
            chart = get_chart_klass_or_404(chart_id)(land=rhone(), params=dict(params))
            return chart.chart, chart.data_table

    def test_every_national_map_chart_has_its_title_and_subtitle(self):
        for chart_id, klass, params, data, _, title, subtitle in CASES:
            with self.subTest(chart=chart_id):
                options, _ = self.build(chart_id + NATIONAL_MAP_SUFFIX, klass, params, data)
                self.assertEqual(options["title"]["text"], title)
                self.assertEqual(options["subtitle"], {"text": subtitle})
                # L'image téléchargée garde le nom du territoire, que le titre ne donne plus
                self.assertEqual(options["exporting"]["filename"], f"{title} - Rhône")

    def test_titles_do_not_name_the_land_and_stay_short(self):
        for chart_id, klass, params, data, _, _, _ in CASES:
            with self.subTest(chart=chart_id):
                options, _ = self.build(chart_id + NATIONAL_MAP_SUFFIX, klass, params, data)
                self.assertNotIn("Rhône", options["title"]["text"] + options["subtitle"]["text"])
                # Deux à trois lignes au plus dans la colonne de la carte
                self.assertLessEqual(len(options["title"]["text"]), 75)

    def test_national_map_charts_only_change_the_texts(self):
        for chart_id, klass, params, data, _, _, _ in CASES:
            with self.subTest(chart=chart_id):
                diagnostic, diagnostic_table = self.build(chart_id, klass, params, data)
                national, national_table = self.build(chart_id + NATIONAL_MAP_SUFFIX, klass, params, data)
                ticks = MILLESIME_TICKS.get(chart_id)
                self.assertEqual(
                    without_national_map_texts(national, ticks is not None),
                    without_national_map_texts(diagnostic, ticks is not None),
                )
                self.assertEqual(national_table, diagnostic_table)
                if ticks:
                    self.assertEqual(national["xAxis"]["categories"], ticks)
                    self.assertEqual(diagnostic["xAxis"]["categories"], ["2017", "2020"])

    def test_diagnostic_charts_keep_their_class_and_title(self):
        for chart_id, klass, params, data, diagnostic_title, _, _ in CASES:
            with self.subTest(chart=chart_id):
                self.assertIs(get_chart_klass_or_404(chart_id), klass)
                options, _ = self.build(chart_id, klass, params, data)
                self.assertEqual(options["title"]["text"], diagnostic_title)
                self.assertNotIn("subtitle", options)
                self.assertEqual(options["exporting"]["filename"], diagnostic_title)

    def test_export_charts_keep_their_title(self):
        cases = {chart_id: case for chart_id, *case in CASES}
        for chart_id, title in EXPORT_TITLES.items():
            with self.subTest(chart=chart_id):
                klass, params, data, *_ = cases[chart_id]
                export_klass = get_chart_klass_or_404(chart_id + EXPORT_SUFFIX)
                self.assertFalse(issubclass(export_klass, NationalMapChartMixin))
                options, _ = self.build(chart_id + EXPORT_SUFFIX, klass, params, data)
                self.assertEqual(options["title"]["text"], title)
                self.assertNotIn("subtitle", options)

    def test_national_map_charts_inherit_from_the_diagnostic_ones(self):
        for chart_id, klass, *_ in CASES:
            with self.subTest(chart=chart_id):
                national = get_chart_klass_or_404(chart_id + NATIONAL_MAP_SUFFIX)
                self.assertTrue(issubclass(national, klass))
                self.assertTrue(issubclass(national, NationalMapChartMixin))
                self.assertFalse(issubclass(klass, NationalMapChartMixin))

    def test_interdepartmental_land_subtitles_give_the_years_of_each_millesime(self):
        """Une région a des millésimes de plusieurs années : le sous-titre les donne, pas leur numéro."""
        cases = {chart_id: case for chart_id, *case in CASES}
        expected = {
            "artif_synthese": (
                {"data": Rows([stock([2017, 2018, 2020], 10.0, 1), stock([2020, 2021, 2023], 10.5, 2)])},
                "En\u00a0% de la surface du territoire, aux millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023)",
            ),
            "pie_artif_by_couverture": (
                {"data": [cover([2020, 2021, 2023])]},
                "En\u00a0% des surfaces artificialisées, au millésime n°2 (2020 à 2023)",
            ),
            "artif_net_flux": (
                {"data": flux([2017, 2020], [2020, 2023])},
                "En hectares, entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023)",
            ),
            "artif_flux_by_couverture": (
                {"data": Rows([flux([2017, 2020], [2020, 2023])])},
                "En hectares, entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023)",
            ),
        }
        for chart_id, (data, subtitle) in expected.items():
            with self.subTest(chart=chart_id):
                klass, params, *_ = cases[chart_id]
                options, _ = self.build(chart_id + NATIONAL_MAP_SUFFIX, klass, params, data)
                self.assertEqual(options["subtitle"]["text"], subtitle)

    def test_flux_by_cover_without_flux_only_gives_the_unit(self):
        options, _ = self.build(
            "artif_flux_by_couverture" + NATIONAL_MAP_SUFFIX, ArtifFluxByCouverture, MILLESIME_PARAMS, {"data": Rows()}
        )
        self.assertEqual(options["subtitle"]["text"], "En hectares, entre le millésime n°1 et le millésime n°2")

    def test_charts_without_insee_data_are_still_titled(self):
        """Sans dossier complet de l'Insee, le graphique est vide mais garde son titre."""
        options, table = self.build(
            "dc_emploi_chomage" + NATIONAL_MAP_SUFFIX, DcEmploiChomageChart, {}, {"data": None}
        )
        self.assertEqual(options["title"]["text"], "Emploi et chômage des 15-64 ans")
        self.assertEqual(options["series"], [])
        self.assertIsNone(table)


class NationalMapTextsTest(TestCase):
    def test_period_text(self):
        self.assertEqual(period_text("2011", "2024"), "de 2011 à 2024")
        self.assertEqual(period_text(2024, 2024), "en 2024")

    def test_years_range(self):
        self.assertEqual(years_range([2020]), "2020")
        self.assertEqual(years_range([2021, 2019, 2023]), "2019 à 2023")

    def test_millesimes_are_named_by_their_index_then_their_years(self):
        """Comme sur le reste du site, l'index désigne le millésime ; les années du territoire le datent."""
        self.assertEqual(millesime_number(2, [2020]), "n°2 (2020)")
        self.assertEqual(millesime_number(2, [2020, 2021, 2023]), "n°2 (2020 à 2023)")
        self.assertEqual(millesime_number(2), "n°2")
        self.assertEqual(millesime_tick(1, [2017, 2020]), "Millésime n°1<br/>(2017 à 2020)")

    def test_at_millesimes_text(self):
        self.assertEqual(at_millesimes_text([(1, [2020])]), "au millésime n°1 (2020)")
        self.assertEqual(at_millesimes_text([(1, [2017]), (2, [2020])]), "aux millésimes n°1 (2017) et n°2 (2020)")
        self.assertEqual(
            at_millesimes_text([(1, [2014]), (2, [2017]), (3, [2020])]),
            "aux millésimes n°1 (2014), n°2 (2017) et n°3 (2020)",
        )

    def test_millesime_years_reads_index_and_departement_data(self):
        self.assertEqual(millesime_years(Mock(years=[2017, 2018])), [2017, 2018])
        self.assertEqual(millesime_years(Mock(years_old=[2017]), "_old"), [2017])
        # Données d'un seul département : une année par millésime
        self.assertEqual(millesime_years(Mock(spec=["year"], year=2020)), [2020])
        self.assertEqual(millesime_years(Mock(spec=["year_new"], year_new=2020), "_new"), [2020])

    def test_flux_subtitle(self):
        self.assertEqual(
            flux_subtitle(1, 2, flux([2017], [2020])),
            "En hectares, entre le millésime n°1 (2017) et le millésime n°2 (2020)",
        )
        self.assertEqual(flux_subtitle("1", "2"), "En hectares, entre le millésime n°1 et le millésime n°2")
