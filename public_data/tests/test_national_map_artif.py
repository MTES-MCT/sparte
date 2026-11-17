from unittest import TestCase, mock

from django.test import SimpleTestCase

from public_data.domain.national_map_artif import (
    annual_net_flux,
    build_artif_indicators,
    group_flux_by_land,
    land_artif,
    last_millesime_index,
    latest_flux_rows,
    percent_of,
)

LAND_KEYS = {
    "surface_ha",
    "artif_ha",
    "artif_pct",
    "artif_years",
    "artif_index",
    "artif_net_ha",
    "artif_net_pct_surface",
    "artif_net_annual_ha",
    "artif_net_annual_pct_surface",
    "artif_gross_ha",
    "desartif_gross_ha",
    "artif_net_years_old",
    "artif_net_years_new",
    "artif_net_index_old",
    "artif_net_index_new",
}


def flux_row(land_id="01", departement="01", year_old=2018, year_new=2021, artif=40.0, desartif=10.0, old=1, new=2):
    return {
        "land_id": land_id,
        "departement": departement,
        "year_old": year_old,
        "year_new": year_new,
        "millesime_old_index": old,
        "millesime_new_index": new,
        "flux_artif": artif,
        "flux_desartif": desartif,
        "flux_artif_net": artif - desartif,
    }


def land_row(
    land_id="01", surface=10_000.0, has_ocsge=True, surface_artif=1_000.0, percent_artif=10.0, years=(2021,), index=2
):
    # Millésimes d'un territoire d'un seul département : l'index demandé et les précédents, tous les trois ans
    millesimes = [
        {"departement": "01", "index": rank, "year": max(years) - 3 * (index - rank)} for rank in range(1, index + 1)
    ]
    return {
        "land_id": land_id,
        "surface": surface,
        "has_ocsge": has_ocsge,
        "surface_artif": surface_artif,
        "percent_artif": percent_artif,
        "years_artif": list(years),
        "millesimes": millesimes,
    }


class FluxHelpersTest(TestCase):
    def test_group_flux_by_land(self):
        rows = [flux_row("A"), flux_row("B"), flux_row("A", departement="02")]
        grouped = group_flux_by_land(rows)
        self.assertEqual(set(grouped), {"A", "B"})
        self.assertEqual(len(grouped["A"]), 2)

    def test_latest_flux_rows_keeps_the_most_recent_pair(self):
        rows = [flux_row(old=1, new=2), flux_row(old=2, new=3, year_old=2021, year_new=2024), flux_row(old=1, new=3)]
        latest = latest_flux_rows(rows)
        self.assertEqual([(r["millesime_old_index"], r["millesime_new_index"]) for r in latest], [(2, 3)])

    def test_latest_flux_rows_without_rows(self):
        self.assertEqual(latest_flux_rows([]), [])

    def test_annual_net_flux_uses_each_departement_duration(self):
        rows = [
            flux_row(year_old=2018, year_new=2021, artif=40, desartif=10),  # 30 ha en 3 ans
            flux_row(departement="02", year_old=2017, year_new=2022, artif=50, desartif=0),  # 50 ha en 5 ans
        ]
        self.assertAlmostEqual(annual_net_flux(rows), 10 + 10)

    def test_annual_net_flux_without_duration(self):
        self.assertIsNone(annual_net_flux([]))
        self.assertIsNone(annual_net_flux([flux_row(year_old=2021, year_new=2021)]))

    def test_percent_of(self):
        self.assertAlmostEqual(percent_of(50, 10_000), 0.5)
        self.assertIsNone(percent_of(None, 10_000))
        self.assertIsNone(percent_of(50, 0))
        self.assertIsNone(percent_of(50, None))


class LandArtifTest(TestCase):
    def test_stock_and_flux(self):
        result = land_artif(land_row(), [flux_row()])
        self.assertEqual(set(result), LAND_KEYS)
        self.assertEqual(result["surface_ha"], 10_000)
        self.assertEqual(result["artif_ha"], 1_000)
        self.assertEqual(result["artif_pct"], 10)
        self.assertEqual(result["artif_years"], [2021])
        self.assertEqual(result["artif_index"], 2)
        self.assertEqual(result["artif_net_ha"], 30)
        self.assertEqual(result["artif_net_pct_surface"], 0.3)
        self.assertEqual(result["artif_net_annual_ha"], 10)
        self.assertEqual(result["artif_net_annual_pct_surface"], 0.1)
        self.assertEqual(result["artif_gross_ha"], 40)
        self.assertEqual(result["desartif_gross_ha"], 10)
        self.assertEqual(result["artif_net_years_old"], [2018])
        self.assertEqual(result["artif_net_years_new"], [2021])
        self.assertEqual((result["artif_net_index_old"], result["artif_net_index_new"]), (1, 2))

    def test_net_desartificialisation_is_negative(self):
        result = land_artif(land_row(), [flux_row(artif=1, desartif=5, year_old=2019, year_new=2021)])
        self.assertEqual(result["artif_net_ha"], -4)
        self.assertEqual(result["artif_net_annual_ha"], -2)
        self.assertEqual(result["artif_net_pct_surface"], -0.04)

    def test_interdepartemental_land_sums_its_departements(self):
        rows = [
            flux_row(departement="75", year_old=2017, year_new=2021, artif=8, desartif=0),
            flux_row(departement="77", year_old=2018, year_new=2021, artif=9, desartif=3),
        ]
        result = land_artif(land_row(years=(2021,)), rows)
        self.assertEqual(result["artif_net_ha"], 14)
        self.assertEqual(result["artif_net_annual_ha"], 4)  # 8 / 4 + 6 / 3
        self.assertEqual(result["artif_net_years_old"], [2017, 2018])
        self.assertEqual(result["artif_net_years_new"], [2021])

    def test_land_without_complete_ocsge_has_no_value(self):
        result = land_artif(land_row(has_ocsge=False), [flux_row()])
        self.assertEqual(set(result), LAND_KEYS)
        self.assertEqual(result["surface_ha"], 10_000)
        for key in LAND_KEYS - {"surface_ha", "artif_years", "artif_net_years_old", "artif_net_years_new"}:
            self.assertIsNone(result[key], key)
        self.assertEqual(result["artif_years"], [])
        self.assertEqual(result["artif_net_years_old"], [])

    def test_land_without_flux_keeps_its_stock(self):
        result = land_artif(land_row(), [])
        self.assertEqual(result["artif_ha"], 1_000)
        self.assertIsNone(result["artif_net_ha"])
        self.assertIsNone(result["artif_net_annual_ha"])
        self.assertEqual(result["artif_net_years_new"], [])
        # Un seul millésime : un stock et son index, aucun flux
        self.assertEqual(land_artif(land_row(index=1), [])["artif_index"], 1)
        self.assertIsNone(result["artif_net_index_old"])
        self.assertIsNone(result["artif_net_index_new"])

    def test_only_the_two_latest_millesimes_count(self):
        rows = [
            flux_row(old=1, new=2, artif=100, desartif=0),
            flux_row(old=2, new=3, year_old=2021, year_new=2023, artif=6, desartif=2),
        ]
        result = land_artif(land_row(years=(2023,), index=3), rows)
        self.assertEqual(result["artif_net_ha"], 4)
        self.assertEqual(result["artif_net_annual_ha"], 2)
        self.assertEqual(result["artif_index"], 3)
        self.assertEqual((result["artif_net_index_old"], result["artif_net_index_new"]), (2, 3))

    def test_last_millesime_index(self):
        millesimes = [
            {"departement": "75", "index": 1, "year": 2017},
            {"departement": "75", "index": 2, "year": 2021},
            {"departement": "77", "index": 3, "year": 2024},
        ]
        self.assertEqual(last_millesime_index(millesimes), 3)
        self.assertIsNone(last_millesime_index([]))
        self.assertIsNone(last_millesime_index(None))
        # Une ligne lue sans ses millésimes garde ses valeurs, sans index
        land = {key: value for key, value in land_row().items() if key != "millesimes"}
        self.assertIsNone(land_artif(land, [])["artif_index"])

    def test_results_are_not_shared_between_lands(self):
        first = land_artif(land_row(has_ocsge=False), [])
        first["artif_years"].append(1999)
        self.assertEqual(land_artif(land_row(has_ocsge=False), [])["artif_years"], [])


class BuildArtifIndicatorsTest(TestCase):
    def test_one_entry_per_land(self):
        lands = [land_row("A"), land_row("B", has_ocsge=False)]
        result = build_artif_indicators("DEPART", lands, {"A": [flux_row("A")]})
        self.assertEqual(result["scale"], "DEPART")
        self.assertEqual(set(result["lands"]), {"A", "B"})
        self.assertEqual(result["lands"]["A"]["artif_net_ha"], 30)
        self.assertIsNone(result["lands"]["B"]["artif_ha"])


class NationalMapArtifIndicatorsViewTest(SimpleTestCase):
    URL = "/public/national-map/artif-indicators"

    def test_invalid_scale(self):
        response = self.client.get(self.URL, {"scale": "PLANETE"})
        self.assertEqual(response.status_code, 400)

    def test_commune_scale_requires_a_parent(self):
        response = self.client.get(self.URL, {"scale": "COMM"})
        self.assertEqual(response.status_code, 400)

    @mock.patch(
        "public_data.views.NationalMapArtifIndicatorsView.build", return_value={"scale": "REGION", "lands": {}}
    )
    def test_returns_indicators_with_http_cache(self, build):
        response = self.client.get(self.URL, {"scale": "REGION"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"scale": "REGION", "lands": {}})
        self.assertIn("max-age", response["Cache-Control"])
        build.assert_called_once_with("REGION", None)
