from unittest import TestCase, mock

from django.test import SimpleTestCase

from public_data.domain.national_map import (
    build_base_map,
    features_bbox,
    land_zone,
    latitude,
    true_scale_factor,
)


def _square(land_id, name, x, y, side):
    return {
        "type": "Feature",
        "properties": {"land_id": land_id, "name": name},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[x, y], [x + side, y], [x + side, y + side], [x, y + side], [x, y]]],
        },
    }


# Emprises inspirées des vraies valeurs EPSG:3857 : Hexagone, Corse, Guadeloupe (Antilles), Guyane
HEXAGONE = _square("11", "Île-de-France", -500_000, 5_100_000, 1_400_000)
CORSE = _square("94", "Corse", 950_000, 5_060_000, 110_000)
GUADELOUPE = _square("01", "Guadeloupe", -6_880_000, 1_785_000, 90_000)
GUYANE = _square("03", "Guyane", -6_078_000, 235_000, 330_000)


class LandZoneTest(TestCase):
    def test_regions(self):
        self.assertEqual(land_zone("REGION", "01"), "01")
        self.assertEqual(land_zone("REGION", "94"), "CORSE")
        self.assertEqual(land_zone("REGION", "11"), "HEXAGONE")

    def test_departements(self):
        self.assertEqual(land_zone("DEPART", "974"), "04")
        self.assertEqual(land_zone("DEPART", "2A"), "CORSE")
        self.assertEqual(land_zone("DEPART", "2B"), "CORSE")
        self.assertEqual(land_zone("DEPART", "69"), "HEXAGONE")
        # « 97 » seul n'est pas un département d'outre-mer ; « 976 » si
        self.assertEqual(land_zone("DEPART", "976"), "06")


class BuildBaseMapTest(TestCase):
    def setUp(self):
        self.geojson = {"type": "FeatureCollection", "features": [HEXAGONE, CORSE, GUADELOUPE, GUYANE]}
        self.result = build_base_map(self.geojson, "REGION", {"11": True, "94": True, "01": True})

    def _feature(self, land_id):
        return next(f for f in self.result["geojson"]["features"] if f["properties"]["land_id"] == land_id)

    def test_drom_are_offshore_west_of_hexagone(self):
        hexagone_xmin, hexagone_ymin, hexagone_xmax, hexagone_ymax = features_bbox([HEXAGONE, CORSE])
        width = hexagone_xmax - hexagone_xmin
        for land_id in ("01", "03"):
            xmin, ymin, xmax, ymax = features_bbox([self._feature(land_id)])
            # Dans une bande étroite autour du bord ouest, sans dépasser la hauteur de l'Hexagone
            self.assertGreater(xmin, hexagone_xmin - 0.25 * width, land_id)
            self.assertLess(xmax, hexagone_xmin + 0.25 * width, land_id)
            self.assertGreaterEqual(ymin, hexagone_ymin, land_id)
            self.assertLessEqual(ymax, hexagone_ymax, land_id)

    def test_guadeloupe_is_above_and_guyane_below(self):
        _, guadeloupe_ymin, _, _ = features_bbox([self._feature("01")])
        _, _, _, guyane_ymax = features_bbox([self._feature("03")])
        self.assertGreater(guadeloupe_ymin, guyane_ymax)

    def test_true_dimensions_are_preserved(self):
        # Un carré de 90 km à 16° N doit mesurer, à l'écran, 90 km × cos(16°) / cos(46°) unités Mercator
        hexagone_bbox = features_bbox([HEXAGONE, CORSE])
        factor = true_scale_factor(features_bbox([GUADELOUPE]), hexagone_bbox)
        self.assertAlmostEqual(factor, 1.39, delta=0.03)

        xmin, ymin, xmax, ymax = features_bbox([self._feature("01")])
        self.assertAlmostEqual(xmax - xmin, 90_000 * factor, delta=1)
        self.assertAlmostEqual(ymax - ymin, 90_000 * factor, delta=1)

    def test_latitude(self):
        self.assertAlmostEqual(latitude(0), 0)
        self.assertAlmostEqual(latitude(5_780_000), 46.0, delta=0.3)
        self.assertAlmostEqual(latitude(-2_400_000), -21.0, delta=0.3)

    def test_hexagone_and_corse_do_not_move(self):
        self.assertEqual(self._feature("11")["geometry"], HEXAGONE["geometry"])
        self.assertEqual(self._feature("94")["geometry"], CORSE["geometry"])

    def test_source_geojson_is_not_modified(self):
        self.assertEqual(GUADELOUPE["geometry"]["coordinates"][0][0], [-6_880_000, 1_785_000])
        self.assertNotIn("zone", GUADELOUPE["properties"])

    def test_properties_and_insets(self):
        self.assertEqual(self._feature("01")["properties"]["zone"], "01")
        self.assertEqual(self._feature("94")["properties"]["zone"], "CORSE")
        self.assertEqual(self._feature("11")["properties"]["land_type"], "REGION")
        # À l'échelle région, la région d'un territoire est lui-même
        self.assertEqual(self._feature("94")["properties"]["region"], "94")
        self.assertTrue(self._feature("01")["properties"]["has_conso"])
        self.assertFalse(self._feature("03")["properties"]["has_conso"])
        # Une entrée par région d'outre-mer présente, avec son nom et l'emprise du territoire déplacé
        self.assertEqual([i["name"] for i in self.result["insets"]], ["Guadeloupe", "Guyane"])
        for inset in self.result["insets"]:
            feature = next(f for f in self.result["geojson"]["features"] if f["properties"]["zone"] == inset["zone"])
            for expected, actual in zip(features_bbox([feature]), inset["bbox"]):
                self.assertAlmostEqual(expected, actual, delta=1)

    def test_separation_line(self):
        hexagone_xmin, hexagone_ymin, hexagone_xmax, hexagone_ymax = features_bbox([HEXAGONE, CORSE])
        separation = self.result["separation"]
        self.assertEqual(len(separation), 6)
        # Du haut vers le bas, sans jamais remonter
        self.assertGreater(separation[0][1], hexagone_ymax)
        self.assertLess(separation[-1][1], hexagone_ymin)
        for previous, following in zip(separation, separation[1:]):
            self.assertLessEqual(following[1], previous[1])
        # Les DROM sont à gauche de la ligne, l'Hexagone commence à droite de son point le plus à l'ouest
        separation_xmin = min(x for x, _ in separation)
        for land_id in ("01", "03"):
            _, _, xmax, _ = features_bbox([self._feature(land_id)])
            self.assertLess(xmax, max(x for x, _ in separation), land_id)
        self.assertLess(separation_xmin, hexagone_xmin)

    def test_lands_without_conso_data(self):
        self.assertEqual(self.result["no_conso_data"], ["Guyane"])

    def test_region_of_departements(self):
        rhone = _square("69", "Rhône", 500_000, 5_700_000, 50_000)
        corse_du_sud = _square("2A", "Corse-du-Sud", 950_000, 5_060_000, 50_000)
        result = build_base_map({"features": [rhone, corse_du_sud]}, "DEPART", {"69": True}, {"69": "84", "2A": "94"})
        regions = {f["properties"]["land_id"]: f["properties"]["region"] for f in result["geojson"]["features"]}
        self.assertEqual(regions, {"69": "84", "2A": "94"})
        zones = {f["properties"]["land_id"]: f["properties"]["zone"] for f in result["geojson"]["features"]}
        self.assertEqual(zones, {"69": "HEXAGONE", "2A": "CORSE"})

    def test_nothing_moves_without_hexagone(self):
        result = build_base_map({"features": [GUADELOUPE]}, "REGION", {})
        self.assertEqual(result["insets"], [])
        self.assertEqual(result["separation"], [])
        self.assertEqual(result["geojson"]["features"][0]["geometry"], GUADELOUPE["geometry"])


class NationalMapBaseMapViewTest(SimpleTestCase):
    url = "/public/national-map/base-map"

    def test_parent_region(self):
        from public_data.views import NationalMapBaseMapView

        self.assertEqual(NationalMapBaseMapView.parent_region(["REGION_84", "NATION_NATION"]), "84")
        self.assertEqual(NationalMapBaseMapView.parent_region(["NATION_NATION"]), None)
        self.assertEqual(NationalMapBaseMapView.parent_region(None), None)

    def test_invalid_scale(self):
        response = self.client.get(self.url, {"scale": "COMM"})
        self.assertEqual(response.status_code, 400)

    @mock.patch("public_data.views.NationalMapBaseMapView.build")
    def test_returns_base_map_with_http_cache(self, build):
        build.return_value = {"scale": "DEPART", "geojson": {}, "insets": [], "no_conso_data": ["Mayotte"]}
        response = self.client.get(self.url, {"scale": "DEPART"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["no_conso_data"], ["Mayotte"])
        self.assertEqual(response["Cache-Control"], "public, max-age=3600")
        build.assert_called_once_with("DEPART", None)

    @mock.patch("public_data.views.NationalMapBaseMapView.build")
    def test_default_scale_is_region(self, build):
        build.return_value = {"scale": "REGION", "geojson": {}, "insets": [], "no_conso_data": []}
        self.client.get(self.url)
        build.assert_called_once_with("REGION", None)
