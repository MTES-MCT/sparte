"""
Fond de carte « France entière » de la carte nationale.

Les géométries précalculées par dbt (``LandGeoJSON``) sont en EPSG:3857 : les
régions d'outre-mer y sont à des milliers de kilomètres de l'Hexagone. Pour les
afficher sur une seule vue, on les déplace dans les espaces maritimes vides qui
bordent l'Hexagone à l'ouest, afin que l'ensemble occupe au mieux la zone de carte :

* les quatre îles en grille au large de la Bretagne et de la Manche
  (Guadeloupe et Martinique en haut, La Réunion et Mayotte en dessous) ;
* la Guyane dans le golfe de Gascogne.

Une polyligne de séparation, qui contourne la Bretagne, distingue ces territoires
déplacés du reste de la carte.

Les dimensions réelles sont respectées : Web Mercator étire les distances d'un
facteur 1/cos(latitude), l'Hexagone (vers 46° N) est donc dessiné environ 1,45 fois
plus grand qu'un territoire équatorial de même taille. Chaque DROM est remis à
l'échelle de l'Hexagone par le rapport des cosinus de latitude, sans autre
déformation. La Corse reste à sa position réelle.
"""

from __future__ import annotations

import copy
import math
from typing import Any

# Code région -> (préfixe des codes département et commune, nom affiché)
DROM: dict[str, tuple[str, str]] = {
    "01": ("971", "Guadeloupe"),
    "02": ("972", "Martinique"),
    "03": ("973", "Guyane"),
    "04": ("974", "La Réunion"),
    "06": ("976", "Mayotte"),
}
PREFIX_TO_REGION = {prefix: code for code, (prefix, _) in DROM.items()}

ZONE_HEXAGONE = "HEXAGONE"
ZONE_CORSE = "CORSE"
REGION_CORSE = "94"

# Mailles affichables. Les communes (35 000, plus de 80 Mo en GeoJSON) ne le sont
# que région par région ; les EPCI le sont aussi pour la France entière en réunissant
# les GeoJSON régionaux (6,5 Mo avant compression).
SCALES = ("REGION", "DEPART", "EPCI", "COMM")
SCALES_REQUIRING_PARENT = ("COMM",)
# Niveaux emboîtés, du plus large au plus fin : un parent n'affiche que des mailles plus fines
LEVELS = ("NATION", "REGION", "DEPART", "EPCI", "COMM")


def is_finer_than_parent(parent_type: str, scale: str) -> bool:
    """Vrai si la maille est strictement plus fine que le niveau du parent."""
    return parent_type in LEVELS and scale in LEVELS and LEVELS.index(scale) > LEVELS.index(parent_type)


# Version du format de la réponse : à incrémenter à chaque changement de structure,
# avec la constante homonyme du front, pour invalider les caches serveur et navigateur.
FORMAT_VERSION = 5

# Grille des îles, de gauche à droite puis de haut en bas
ISLANDS_GRID = (("01", "02"), ("04", "06"))
GUYANE_SLOT = "03"

# Emplacements, en proportions de l'emprise de l'Hexagone (largeur W, hauteur H,
# origine en bas à gauche). La bande ajoutée à gauche reste étroite pour que
# l'emprise totale garde des proportions proches de la zone d'affichage.
LEFT_BAND = 0.2  # largeur ajoutée à gauche de l'Hexagone, en W
# Îles : au-dessus de la Bretagne, sous le niveau du Cotentin
ISLANDS_X_MAX = 0.21  # en W depuis le bord gauche de l'Hexagone
ISLANDS_HEIGHT = 0.23  # en H depuis le haut
# Guyane : golfe de Gascogne, à l'ouest des côtes atlantiques
GUYANE_X_MAX = 0.165  # en W depuis le bord gauche de l'Hexagone
GUYANE_HEIGHT = 0.5  # en H depuis le bas

# Ligne de séparation entre les territoires déplacés et l'Hexagone : une seule
# polyligne, du haut vers le bas, qui contourne la pointe bretonne par l'ouest.
# Points en (x en W depuis le bord gauche, y en H depuis le bas) de l'emprise de l'Hexagone.
SEPARATION = (
    (0.20, 1.03),  # au-dessus de la carte, à droite des îles et à l'ouest du Cotentin
    (0.20, 0.80),  # descente jusqu'au niveau de la rangée basse des îles
    (-0.04, 0.76),  # oblique vers le large, au nord de la côte du Finistère
    (-0.04, 0.61),  # descente au large de la pointe bretonne
    (0.16, 0.51),  # oblique vers la côte, au sud de Belle-Île, au-dessus de la Guyane
    (0.16, -0.01),  # descente jusqu'au bas de la carte, à l'ouest de l'île d'Yeu
)

EARTH_RADIUS = 6378137.0  # sphère de Web Mercator, en mètres

BBox = tuple[float, float, float, float]


def land_zone(land_type: str, land_id: str, region: str | None = None) -> str:
    """Zone d'affichage d'un territoire : code de la région d'outre-mer, CORSE ou HEXAGONE.

    La région contenant le territoire suffit quand elle est connue ; sinon on la déduit
    du code (régions et départements, dont les codes sont parlants).
    """
    if region is None and land_type == "REGION":
        region = land_id
    if region is not None:
        if region in DROM:
            return region
        return ZONE_CORSE if region == REGION_CORSE else ZONE_HEXAGONE
    if land_id[:3] in PREFIX_TO_REGION:
        return PREFIX_TO_REGION[land_id[:3]]
    if land_id[:2].upper() in ("2A", "2B"):
        return ZONE_CORSE
    return ZONE_HEXAGONE


def latitude(y_3857: float) -> float:
    """Latitude en degrés d'une ordonnée Web Mercator."""
    return math.degrees(math.atan(math.sinh(y_3857 / EARTH_RADIUS)))


def true_scale_factor(source_bbox: BBox, reference_bbox: BBox) -> float:
    """Facteur ramenant un territoire à l'échelle Mercator de la référence (dimensions réelles).

    Sur le plan Web Mercator, une distance au sol est multipliée par 1/cos(latitude).
    Pour que 1 km mesure la même longueur à l'écran dans la source et dans la référence,
    on multiplie la source par cos(lat_source) / cos(lat_reference).
    """
    source_lat = latitude((source_bbox[1] + source_bbox[3]) / 2)
    reference_lat = latitude((reference_bbox[1] + reference_bbox[3]) / 2)
    return math.cos(math.radians(source_lat)) / math.cos(math.radians(reference_lat))


def _points(geometry: dict[str, Any]):
    if geometry["type"] == "Polygon":
        rings = geometry["coordinates"]
    elif geometry["type"] == "MultiPolygon":
        rings = [ring for polygon in geometry["coordinates"] for ring in polygon]
    else:
        raise ValueError(f"Géométrie non gérée : {geometry['type']}")
    for ring in rings:
        yield from ring


def features_bbox(features: list[dict[str, Any]]) -> BBox:
    xs: list[float] = []
    ys: list[float] = []
    for feature in features:
        for x, y in _points(feature["geometry"]):
            xs.append(x)
            ys.append(y)
    return (min(xs), min(ys), max(xs), max(ys))


def _transform(geometry: dict[str, Any], factor: float, source: BBox, target: BBox) -> dict[str, Any]:
    """Homothétie de rapport ``factor`` : le centre de ``source`` arrive au centre de ``target``."""
    sx = (source[0] + source[2]) / 2
    sy = (source[1] + source[3]) / 2
    tx = (target[0] + target[2]) / 2
    ty = (target[1] + target[3]) / 2

    def point(p):
        return [(p[0] - sx) * factor + tx, (p[1] - sy) * factor + ty]

    def ring(r):
        return [point(p) for p in r]

    result = copy.deepcopy(geometry)
    if geometry["type"] == "Polygon":
        result["coordinates"] = [ring(r) for r in geometry["coordinates"]]
    else:
        result["coordinates"] = [[ring(r) for r in polygon] for polygon in geometry["coordinates"]]
    return result


def _slots(hexagone_bbox: BBox) -> dict[str, BBox]:
    """Cellules d'accueil des DROM, en coordonnées projetées, relatives à l'emprise de l'Hexagone."""
    xmin, ymin, xmax, ymax = hexagone_bbox
    width = xmax - xmin
    height = ymax - ymin
    left_x = xmin - LEFT_BAND * width

    slots: dict[str, BBox] = {}

    cell_width = (xmin + ISLANDS_X_MAX * width - left_x) / len(ISLANDS_GRID[0])
    cell_height = ISLANDS_HEIGHT * height / len(ISLANDS_GRID)
    for row_index, row in enumerate(ISLANDS_GRID):
        top = ymax - row_index * cell_height
        for column_index, code in enumerate(row):
            x0 = left_x + column_index * cell_width
            slots[code] = (x0, top - cell_height, x0 + cell_width, top)

    slots[GUYANE_SLOT] = (left_x, ymin, xmin + GUYANE_X_MAX * width, ymin + GUYANE_HEIGHT * height)
    return slots


def separation_line(hexagone_bbox: BBox) -> list[list[float]]:
    """Polyligne de séparation, en coordonnées projetées."""
    xmin, ymin, xmax, ymax = hexagone_bbox
    width = xmax - xmin
    height = ymax - ymin
    return [[xmin + x * width, ymin + y * height] for x, y in SEPARATION]


def _moved_bbox(source: BBox, factor: float, target: BBox) -> BBox:
    """Emprise de ``source`` après l'homothétie de ``_transform``."""
    half_width = (source[2] - source[0]) * factor / 2
    half_height = (source[3] - source[1]) * factor / 2
    tx = (target[0] + target[2]) / 2
    ty = (target[1] + target[3]) / 2
    return (tx - half_width, ty - half_height, tx + half_width, ty + half_height)


def build_base_map(
    geojson: dict[str, Any],
    scale: str,
    has_conso_by_land: dict[str, bool],
    region_by_land: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Construit le fond de carte : features déplacées, emprises des DROM et territoires sans données.

    Chaque feature reçoit ``zone`` (zone d'affichage servant au placement) et ``region``
    (code de la région qui contient le territoire, utilisé pour cibler une région).
    """
    region_by_land = region_by_land or {}
    features = [copy.deepcopy(f) for f in geojson.get("features", [])]
    for feature in features:
        properties = feature["properties"]
        land_id = properties["land_id"]
        properties["land_type"] = scale
        properties["has_conso"] = bool(has_conso_by_land.get(land_id, False))
        properties["region"] = land_id if scale == "REGION" else region_by_land.get(land_id)
        properties["zone"] = land_zone(scale, land_id, properties["region"])

    hexagone = [f for f in features if f["properties"]["zone"] in (ZONE_HEXAGONE, ZONE_CORSE)]
    insets: list[dict[str, Any]] = []
    separation: list[list[float]] = []

    if hexagone:
        hexagone_bbox = features_bbox(hexagone)
        separation = separation_line(hexagone_bbox)
        for code, target in _slots(hexagone_bbox).items():
            members = [f for f in features if f["properties"]["zone"] == code]
            if not members:
                continue
            source = features_bbox(members)
            factor = true_scale_factor(source, hexagone_bbox)
            for feature in members:
                feature["geometry"] = _transform(feature["geometry"], factor, source, target)
            insets.append({"zone": code, "name": DROM[code][1], "bbox": list(_moved_bbox(source, factor, target))})

    no_conso_data = sorted(
        {f["properties"]["name"] for f in features if not f["properties"]["has_conso"]},
    )

    return {
        "scale": scale,
        "geojson": {"type": "FeatureCollection", "features": features},
        "insets": insets,
        "separation": separation,
        "no_conso_data": no_conso_data,
    }
