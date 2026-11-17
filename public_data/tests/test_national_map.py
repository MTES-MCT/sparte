from unittest import TestCase, mock

from django.test import SimpleTestCase

from public_data.domain.national_map import (
    ancestor_ids,
    build_base_map,
    compute_placement,
    features_bbox,
    land_zone,
    latitude,
    parent_boundary,
    reference_placement,
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


class AncestorIdsTest(TestCase):
    def test_regions_et_departements_des_cles_de_parents(self):
        parent_keys = ["DEPART_64", "DEPART_65", "REGION_75", "REGION_76", "NATION_NATION", "SCOT_123"]
        self.assertEqual(
            ancestor_ids(parent_keys), [("DEPART", "64"), ("DEPART", "65"), ("REGION", "75"), ("REGION", "76")]
        )

    def test_cles_nulles_ou_absentes(self):
        self.assertEqual(ancestor_ids([None, "REGION_53"]), [("REGION", "53")])
        self.assertEqual(ancestor_ids(["NATION_NATION"]), [])
        self.assertEqual(ancestor_ids(None), [])


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
        self.assertEqual(set(HEXAGONE["properties"]), {"land_id", "name"})

    def test_only_moved_geometries_are_copied(self):
        # Pas de copie profonde : une géométrie non déplacée est celle du GeoJSON reçu,
        # un DROM déplacé en reçoit une nouvelle
        self.assertIs(self._feature("11")["geometry"], HEXAGONE["geometry"])
        self.assertIs(self._feature("94")["geometry"], CORSE["geometry"])
        self.assertIsNot(self._feature("01")["geometry"], GUADELOUPE["geometry"])
        self.assertIsNot(self._feature("11")["properties"], HEXAGONE["properties"])

    def test_moved_multipolygon_keeps_its_structure(self):
        islands = {
            "type": "Feature",
            "properties": {"land_id": "01", "name": "Guadeloupe"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    GUADELOUPE["geometry"]["coordinates"],
                    [
                        [
                            [-6_800_000, 1_800_000],
                            [-6_790_000, 1_800_000],
                            [-6_790_000, 1_810_000],
                            [-6_800_000, 1_800_000],
                        ]
                    ],
                ],
            },
        }
        result = build_base_map({"features": [HEXAGONE, islands]}, "REGION", {})
        moved = result["geojson"]["features"][1]["geometry"]
        self.assertEqual(list(moved), ["type", "coordinates"])
        self.assertEqual(moved["type"], "MultiPolygon")
        self.assertEqual([[len(ring) for ring in polygon] for polygon in moved["coordinates"]], [[5], [4]])
        self.assertNotEqual(moved["coordinates"], islands["geometry"]["coordinates"])
        # La géométrie d'origine garde ses coordonnées
        self.assertEqual(islands["geometry"]["coordinates"][1][0][0], [-6_800_000, 1_800_000])

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
            # L'emprise réelle a les proportions du cartouche : une image de l'une se pose sur l'autre
            xmin, ymin, xmax, ymax = inset["bbox"]
            source_xmin, source_ymin, source_xmax, source_ymax = inset["source_bbox"]
            self.assertAlmostEqual(
                (xmax - xmin) / (source_xmax - source_xmin),
                (ymax - ymin) / (source_ymax - source_ymin),
                places=6,
            )
        # La Guadeloupe du jeu d'essai est à sa position réelle, à l'ouest de l'Atlantique
        self.assertLess(self.result["insets"][0]["source_bbox"][2], -6_000_000)

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


class ParentBoundaryTest(TestCase):
    """Limite du parent portée par le fond précalculé (département à la maille EPCI)."""

    EPCI = _square("200046977", "Métropole de Lyon", 500_000, 5_700_000, 50_000)
    BOUNDARY = [
        [[500_000, 5_700_000], [525_000, 5_700_000], [525_000, 5_750_000], [500_000, 5_750_000], [500_000, 5_700_000]],
    ]

    def test_limite_du_fond_precalcule(self):
        geojson = {"type": "FeatureCollection", "features": [self.EPCI], "parent_boundary": self.BOUNDARY}
        result = build_base_map(geojson, "EPCI", {})
        self.assertEqual(result["parent_boundary"], self.BOUNDARY)
        # Le membre du GeoJSON précalculé n'est pas recopié dans celui de la réponse
        self.assertEqual(list(result["geojson"]), ["type", "features"])

    def test_fond_sans_limite(self):
        # Autres vues, fond construit avant le calcul, fond de repli des diagnostics
        self.assertIsNone(build_base_map({"features": [self.EPCI]}, "EPCI", {})["parent_boundary"])
        self.assertIsNone(parent_boundary({"features": [], "parent_boundary": None}))
        self.assertIsNone(parent_boundary({"features": [], "parent_boundary": []}))

    def test_lignes_reduites_a_un_point_ignorees(self):
        geojson = {"features": [], "parent_boundary": [[[0, 0]], *self.BOUNDARY, []]}
        self.assertEqual(parent_boundary(geojson), self.BOUNDARY)

    def test_pas_de_limite_quand_des_entites_sont_deplacees(self):
        # La limite est dans les coordonnées d'origine : elle ne suivrait pas un DROM déplacé
        geojson = {"features": [HEXAGONE, GUADELOUPE], "parent_boundary": self.BOUNDARY}
        result = build_base_map(geojson, "REGION", {})
        self.assertTrue(result["insets"])
        self.assertIsNone(result["parent_boundary"])


def _rectangle(land_id, xmin, ymin, xmax, ymax):
    return {
        "type": "Feature",
        "properties": {"land_id": land_id, "name": land_id},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]],
        },
    }


class SyntheticPlacementTest(TestCase):
    """Jeu d'essai commun aux deux écritures du placement des DROM.

    Le placement est aussi écrit en SQL pour les tuiles de communes (macro dbt
    ``national_map_drom_placement``). Le test singulier dbt
    ``national_map_placement_matches_python_on_synthetic_regions`` passe à la macro les mêmes
    rectangles et attend les mêmes valeurs, aux mêmes tolérances : toute modification du
    placement doit être reportée des deux côtés, valeurs attendues comprises.
    """

    # Référence. Chaque bord de l'emprise commune vient d'un seul des deux rectangles :
    # elle va de (-570 000 ; 5 060 000) à (1 060 000 ; 6 640 000)
    REFERENCE = [
        _rectangle("11", -570_000, 5_070_000, 830_000, 6_640_000),
        _rectangle("94", 950_000, 5_060_000, 1_060_000, 5_310_000),
    ]
    # Outre-mer, à des positions et avec des dimensions proches des vraies
    DROMS = [
        _rectangle("01", -6_880_000, 1_790_000, -6_790_000, 1_865_000),
        _rectangle("02", -6_815_000, 1_620_000, -6_770_000, 1_675_000),
        _rectangle("03", -6_080_000, 235_000, -5_745_000, 640_000),
        _rectangle("04", 6_145_000, -2_440_000, 6_215_000, -2_375_000),
        _rectangle("06", 5_015_000, -1_460_000, 5_045_000, -1_420_000),
    ]
    # Région -> (nom, facteur, décalage x, décalage y, cartouche, emplacement)
    EXPECTED = {
        "01": (
            "Guadeloupe",
            1.393363032659,
            8_794_711.328,
            4_002_779.058,
            (-791_626.336, 6_496_898.886, -666_223.664, 6_601_401.114),
            (-896_000, 6_458_300, -561_850, 6_640_000),
        ),
        "02": (
            "Martinique",
            1.403856441564,
            9_140_919.879,
            4_236_296.513,
            (-426_361.770, 6_510_543.948, -363_188.230, 6_587_756.052),
            (-561_850, 6_458_300, -227_700, 6_640_000),
        ),
        "03": (
            "Guyane",
            1.447544086458,
            7_960_079.411,
            4_821_699.462,
            (-840_988.634, 5_161_872.322, -356_061.366, 5_748_127.678),
            (-896_000, 5_060_000, -301_050, 5_850_000),
        ),
        "04": (
            "La Réunion",
            1.353387347995,
            -9_092_858.811,
            9_625_730.040,
            (-776_293.557, 6_323_464.911, -681_556.443, 6_411_435.089),
            (-896_000, 6_276_600, -561_850, 6_458_300),
        ),
        "06": (
            "Mayotte",
            1.414740867143,
            -7_510_921.562,
            8_404_676.849,
            (-415_996.113, 6_339_155.183, -373_553.887, 6_395_744.817),
            (-561_850, 6_276_600, -227_700, 6_458_300),
        ),
    }
    EXPECTED_REFERENCE = (-570_000, 5_060_000, 1_060_000, 6_640_000)
    EXPECTED_SEPARATION = [
        (-244_000, 6_687_400),
        (-244_000, 6_324_000),
        (-635_200, 6_260_800),
        (-635_200, 6_023_800),
        (-309_200, 5_865_800),
        (-309_200, 5_044_200),
    ]
    COORDINATE_TOLERANCE = 0.001  # en mètres
    FACTOR_TOLERANCE = 0.000000001

    def setUp(self):
        self.regions = {"type": "FeatureCollection", "features": [*self.REFERENCE, *self.DROMS]}
        self.placement = reference_placement(self.regions)

    def assertBBoxAlmostEqual(self, actual, expected, message=None):
        self.assertEqual(len(actual), len(expected), message)
        for actual_value, expected_value in zip(actual, expected):
            self.assertAlmostEqual(actual_value, expected_value, delta=self.COORDINATE_TOLERANCE, msg=message)

    def test_valeurs_attendues_du_jeu_d_essai_commun(self):
        self.assertBBoxAlmostEqual(self.placement.reference, self.EXPECTED_REFERENCE)
        self.assertEqual(len(self.placement.separation), len(self.EXPECTED_SEPARATION))
        for point, expected in zip(self.placement.separation, self.EXPECTED_SEPARATION):
            self.assertBBoxAlmostEqual(point, expected)
        # Dans l'ordre des emplacements : îles en grille, puis Guyane
        self.assertEqual([drom.zone for drom in self.placement.droms], ["01", "02", "04", "06", "03"])
        for drom in self.placement.droms:
            name, factor, x_offset, y_offset, inset, slot = self.EXPECTED[drom.zone]
            self.assertEqual(drom.name, name)
            self.assertAlmostEqual(drom.factor, factor, delta=self.FACTOR_TOLERANCE, msg=name)
            self.assertBBoxAlmostEqual(drom.offset, (x_offset, y_offset), name)
            self.assertBBoxAlmostEqual(drom.inset, inset, name)
            self.assertBBoxAlmostEqual(drom.slot, slot, name)

    def test_le_deplacement_est_l_affinite_appliquee_par_dbt(self):
        # dbt applique ST_Affine(geom, facteur, 0, 0, facteur, décalage x, décalage y) : même résultat
        for drom, feature in zip(self.placement.droms, [self.DROMS[i] for i in (0, 1, 3, 4, 2)]):
            self.assertEqual(drom.zone, feature["properties"]["land_id"])
            x_offset, y_offset = drom.offset
            moved = drom.move(feature["geometry"])["coordinates"][0]
            for (x, y), (moved_x, moved_y) in zip(feature["geometry"]["coordinates"][0], moved):
                self.assertAlmostEqual(moved_x, drom.factor * x + x_offset, delta=self.COORDINATE_TOLERANCE)
                self.assertAlmostEqual(moved_y, drom.factor * y + y_offset, delta=self.COORDINATE_TOLERANCE)
            # Le cartouche est l'emprise de la région déplacée
            self.assertBBoxAlmostEqual(features_bbox([{"geometry": drom.move(feature["geometry"])}]), drom.inset)

    def test_le_fond_par_region_est_sa_propre_reference(self):
        # Calculé sur ses entités ou reçu, le placement est le même : la réponse ne change pas
        has_conso = {"11": True}
        self.assertEqual(
            build_base_map(self.regions, "REGION", has_conso),
            build_base_map(self.regions, "REGION", has_conso, placement=self.placement),
        )

    def test_sans_hexagone_pas_de_placement(self):
        self.assertIsNone(reference_placement({"type": "FeatureCollection", "features": self.DROMS}))
        self.assertIsNone(reference_placement({}))
        self.assertIsNone(compute_placement({}))


class ReferencePlacementAcrossScalesTest(TestCase):
    """Les fonds nationaux de toutes les mailles appliquent le placement du fond par région."""

    # Départements : la Guadeloupe y garde un îlot, au sud, que la généralisation de la région a retiré
    GUADELOUPE_DEPARTEMENT = {
        "type": "Feature",
        "properties": {"land_id": "971", "name": "Guadeloupe"},
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                GUADELOUPE["geometry"]["coordinates"],
                [
                    [
                        [-6_850_000, 1_770_000],
                        [-6_845_000, 1_770_000],
                        [-6_845_000, 1_775_000],
                        [-6_850_000, 1_770_000],
                    ]
                ],
            ],
        },
    }
    DEPARTEMENTS = {
        "features": [
            _square("75", "Paris", -500_000, 5_100_000, 1_400_000),
            _square("2A", "Corse-du-Sud", 950_000, 5_060_000, 110_000),
            GUADELOUPE_DEPARTEMENT,
        ]
    }
    # EPCI : il manque à l'Hexagone sa pointe ouest, large de 40 km (Ouessant et Sein n'ont pas d'EPCI)
    EPCI = {
        "features": [
            _square("200000001", "CC de l'Hexagone", -460_000, 5_100_000, 1_360_000),
            _square("200000002", "CA de Corse", 950_000, 5_060_000, 110_000),
            _square("200000003", "CA de Guadeloupe", -6_880_000, 1_785_000, 90_000),
        ]
    }
    EPCI_REGIONS = {"200000001": "11", "200000002": "94", "200000003": "01"}

    def setUp(self):
        self.regions = {"type": "FeatureCollection", "features": [HEXAGONE, CORSE, GUADELOUPE, GUYANE]}
        self.placement = reference_placement(self.regions)
        self.by_region = build_base_map(self.regions, "REGION", {})
        self.by_departement = build_base_map(self.DEPARTEMENTS, "DEPART", {}, {"971": "01"}, self.placement)
        self.by_epci = build_base_map(self.EPCI, "EPCI", {}, self.EPCI_REGIONS, self.placement)

    @staticmethod
    def _geometry(base_map, land_id):
        return next(f["geometry"] for f in base_map["geojson"]["features"] if f["properties"]["land_id"] == land_id)

    def test_cartouches_et_separation_identiques_a_toutes_les_mailles(self):
        guadeloupe = [inset for inset in self.by_region["insets"] if inset["zone"] == "01"]
        self.assertEqual(self.by_departement["insets"], guadeloupe)
        self.assertEqual(self.by_epci["insets"], guadeloupe)
        self.assertEqual(self.by_departement["separation"], self.by_region["separation"])
        self.assertEqual(self.by_epci["separation"], self.by_region["separation"])

    def test_un_meme_lieu_garde_la_meme_position(self):
        # Le contour principal de la Guadeloupe est le même aux trois mailles : il arrive au même endroit
        region = self._geometry(self.by_region, "01")["coordinates"][0]
        self.assertNotEqual(region, GUADELOUPE["geometry"]["coordinates"][0])
        self.assertEqual(self._geometry(self.by_departement, "971")["coordinates"][0][0], region)
        self.assertEqual(self._geometry(self.by_epci, "200000003")["coordinates"][0], region)
        # L'Hexagone et la Corse ne bougent à aucune maille
        self.assertIs(self._geometry(self.by_epci, "200000001"), self.EPCI["features"][0]["geometry"])
        self.assertIs(self._geometry(self.by_departement, "2A"), self.DEPARTEMENTS["features"][1]["geometry"])

    def test_sans_placement_de_reference_chaque_maille_se_decalait(self):
        # Ce que corrige le placement de référence : calculé sur les EPCI, tout glisse vers l'est
        shifted = build_base_map(self.EPCI, "EPCI", {}, self.EPCI_REGIONS)
        self.assertGreater(shifted["insets"][0]["bbox"][0], self.by_region["insets"][0]["bbox"][0] + 30_000)
        self.assertGreater(shifted["separation"][0][0], self.by_region["separation"][0][0] + 30_000)

    def test_une_entite_plus_etendue_que_sa_region_deborde_du_cartouche(self):
        # L'îlot absent de la région généralisée est déplacé comme le reste, sans agrandir le cartouche
        _, ymin, _, _ = features_bbox([{"geometry": self._geometry(self.by_departement, "971")}])
        self.assertLess(ymin, self.by_departement["insets"][0]["bbox"][1])

    def test_region_d_outre_mer_absente_de_la_maille(self):
        # Pas de cartouche pour une région sans entité à cette maille, même si le placement la connaît
        self.assertEqual([inset["zone"] for inset in self.by_epci["insets"]], ["01"])
        self.assertEqual([drom.zone for drom in self.placement.droms], ["01", "03"])


class NationalMapBaseMapViewTest(SimpleTestCase):
    url = "/public/national-map/base-map"

    def test_parent_region(self):
        from public_data.views import NationalMapBaseMapView

        self.assertEqual(NationalMapBaseMapView.parent_region(["REGION_84", "NATION_NATION"]), "84")
        self.assertEqual(NationalMapBaseMapView.parent_region(["NATION_NATION"]), None)
        self.assertEqual(NationalMapBaseMapView.parent_region(None), None)
        # Commune sans EPCI ni SCoT : les clés absentes sont nulles, y compris en tête de liste
        self.assertEqual(NationalMapBaseMapView.parent_region([None, "DEPART_29", "REGION_53", None]), "53")

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

    @mock.patch("public_data.views.NationalMapBaseMapView.geojson")
    def test_placement_de_reference_des_fonds_nationaux(self, geojson):
        from public_data.views import NationalMapBaseMapView

        geojson.return_value = {"features": [HEXAGONE, CORSE, GUADELOUPE, GUYANE]}
        view = NationalMapBaseMapView()
        for scale in ("DEPART", "EPCI"):
            geojson.reset_mock()
            self.assertEqual(view.placement(scale), reference_placement(geojson.return_value), scale)
            # Calculé sur le fond national par région, quelle que soit la maille demandée
            geojson.assert_called_once_with("REGION")

    @mock.patch("public_data.views._lands")
    @mock.patch("public_data.views.NationalMapBaseMapView.geojson")
    def test_le_fond_national_par_epci_applique_le_placement_du_fond_par_region(self, geojson, lands):
        from public_data.views import NationalMapBaseMapView

        regions = {"features": [HEXAGONE, CORSE, GUADELOUPE, GUYANE]}
        epci = ReferencePlacementAcrossScalesTest.EPCI
        geojson.side_effect = lambda scale, parent=None: regions if scale == "REGION" else epci
        lands.return_value.values_list.return_value = [
            (land_id, True, [f"REGION_{region}"])
            for land_id, region in ReferencePlacementAcrossScalesTest.EPCI_REGIONS.items()
        ]
        base_map = NationalMapBaseMapView().build("EPCI")
        by_region = build_base_map(regions, "REGION", {})
        # Sans le placement de référence, cartouche et séparation glisseraient de 40 km vers l'est
        self.assertEqual(base_map["insets"], [inset for inset in by_region["insets"] if inset["zone"] == "01"])
        self.assertEqual(base_map["separation"], by_region["separation"])

    @mock.patch("public_data.views.NationalMapBaseMapView.geojson")
    def test_placement_calcule_sur_les_entites_du_fond(self, geojson):
        from public_data.views import NationalMapBaseMapView

        view = NationalMapBaseMapView()
        # Le fond par région est la référence ; le fond d'un parent n'est cadré que sur ses entités
        self.assertIsNone(view.placement("REGION"))
        self.assertIsNone(view.placement("EPCI", mock.Mock(land_type="REGION", land_id="75")))
        geojson.assert_not_called()

    @mock.patch("public_data.views.NationalMapBaseMapView.geojson", return_value={"features": []})
    def test_sans_fond_par_region_le_placement_est_calcule_sur_les_entites(self, _):
        from public_data.views import NationalMapBaseMapView

        self.assertIsNone(NationalMapBaseMapView().placement("DEPART"))


@mock.patch("public_data.views.LandModel.objects")
class ParentTest(SimpleTestCase):
    """Lecture du territoire parent et de ses ancêtres, table des territoires simulée."""

    url = "/public/national-map/base-map"

    @mock.patch("public_data.views.NationalMapBaseMapView.build", return_value={"scale": "DEPART"})
    def test_parent_charge_sans_ses_geometries(self, build, lands):
        from public_data.views import PARENT_FIELDS

        parent = lands.filter.return_value.only.return_value.first.return_value
        parent.land_type, parent.key = "REGION", "REGION_75"
        response = self.client.get(self.url, {"scale": "DEPART", "parent_type": "REGION", "parent_id": "75"})
        self.assertEqual(response.status_code, 200)
        lands.filter.assert_called_once_with(land_type="REGION", land_id="75")
        lands.filter.return_value.only.assert_called_once_with(*PARENT_FIELDS)
        self.assertNotIn("geom", PARENT_FIELDS)
        build.assert_called_once_with("DEPART", parent)

    def test_parent_inconnu(self, lands):
        lands.filter.return_value.only.return_value.first.return_value = None
        response = self.client.get(self.url, {"scale": "DEPART", "parent_type": "REGION", "parent_id": "99"})
        self.assertEqual(response.status_code, 404)

    def test_ancetres_cherches_par_type_et_identifiant(self, lands):
        from django.db.models import Q

        from public_data.views import _parent_description

        # Lignes dans un ordre quelconque, celui de la table : la région doit sortir en premier,
        # puis les départements par code croissant
        lands.filter.return_value.values.return_value = [
            {"land_type": "DEPART", "land_id": "65", "name": "Hautes-Pyrénées"},
            {"land_type": "REGION", "land_id": "75", "name": "Nouvelle-Aquitaine"},
            {"land_type": "DEPART", "land_id": "64", "name": "Pyrénées-Atlantiques"},
        ]
        parent = mock.Mock(land_type="EPCI", land_id="200072106", parent_keys=["DEPART_64", "DEPART_65", "REGION_75"])
        parent.name = "CC Adour Madiran"
        description = _parent_description(parent)
        lands.filter.assert_called_once_with(
            Q(land_type="DEPART", land_id="64")
            | Q(land_type="DEPART", land_id="65")
            | Q(land_type="REGION", land_id="75")
        )
        self.assertEqual(description["name"], "CC Adour Madiran")
        self.assertEqual([a["land_id"] for a in description["ancestors"]], ["75", "64", "65"])

    def test_ancetres_dans_le_meme_ordre_quel_que_soit_celui_des_lignes(self, lands):
        from itertools import permutations

        from public_data.views import _parent_description

        rows = [
            {"land_type": "DEPART", "land_id": "2B", "name": "Haute-Corse"},
            {"land_type": "DEPART", "land_id": "2A", "name": "Corse-du-Sud"},
            {"land_type": "REGION", "land_id": "94", "name": "Corse"},
            {"land_type": "DEPART", "land_id": "13", "name": "Bouches-du-Rhône"},
        ]
        parent = mock.Mock(land_type="EPCI", land_id="1", parent_keys=["DEPART_2A", "DEPART_2B", "REGION_94"])
        for permutation in permutations(rows):
            lands.filter.return_value.values.return_value = list(permutation)
            ancestors = _parent_description(parent)["ancestors"]
            self.assertEqual([a["land_id"] for a in ancestors], ["94", "13", "2A", "2B"])

    def test_region_sans_ancetre_aucune_requete(self, lands):
        from public_data.views import _parent_description

        parent = mock.Mock(land_type="REGION", land_id="75", parent_keys=["NATION_NATION"])
        self.assertEqual(_parent_description(parent)["ancestors"], [])
        lands.filter.assert_not_called()
