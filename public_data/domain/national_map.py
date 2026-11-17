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

Le placement (emprise de référence, facteur et translation de chaque DROM, cartouches,
séparation) est calculé une seule fois, sur le fond national par région, puis appliqué
aux entités de toutes les mailles : un même lieu garde la même position sur la carte
quand on passe des régions aux départements, aux EPCI ou aux communes. Les tuiles de
communes suivent le même placement, écrit une seconde fois en SQL (macro dbt
``national_map_drom_placement``) ; un jeu d'essai commun garde les deux écritures.
"""

from __future__ import annotations

import math
from typing import Any, Mapping, NamedTuple, Sequence

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
# Niveaux des ancêtres affichés dans le fil d'Ariane d'un territoire parent
ANCESTOR_LEVELS = ("REGION", "DEPART")


def is_finer_than_parent(parent_type: str, scale: str) -> bool:
    """Vrai si la maille est strictement plus fine que le niveau du parent."""
    return parent_type in LEVELS and scale in LEVELS and LEVELS.index(scale) > LEVELS.index(parent_type)


def ancestor_ids(parent_keys: list[str | None] | None) -> list[tuple[str, str]]:
    """(type, identifiant) des ancêtres d'un territoire, d'après ses clés de parents (``REGION_75``).

    Seuls les niveaux du fil d'Ariane sont gardés ; les clés nulles sont ignorées.
    """
    ancestors = []
    for key in parent_keys or []:
        land_type, _, land_id = (key or "").partition("_")
        if land_type in ANCESTOR_LEVELS:
            ancestors.append((land_type, land_id))
    return ancestors


# Version du format de la réponse : à incrémenter à chaque changement de structure ou de
# contenu calculé (placement des DROM par exemple), avec la constante homonyme du front,
# pour invalider les caches serveur et navigateur.
FORMAT_VERSION = 8

# Membre de la FeatureCollection précalculée qui porte la limite du territoire parent
PARENT_BOUNDARY_MEMBER = "parent_boundary"

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
    code = land_id or ""
    if code[:3] in PREFIX_TO_REGION:
        return PREFIX_TO_REGION[code[:3]]
    if code[:2].upper() in ("2A", "2B"):
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
    """Homothétie de rapport ``factor`` : le centre de ``source`` arrive au centre de ``target``.

    Renvoie une nouvelle géométrie : celle reçue n'est pas modifiée.
    """
    sx = (source[0] + source[2]) / 2
    sy = (source[1] + source[3]) / 2
    tx = (target[0] + target[2]) / 2
    ty = (target[1] + target[3]) / 2

    def point(p):
        return [(p[0] - sx) * factor + tx, (p[1] - sy) * factor + ty]

    def ring(r):
        return [point(p) for p in r]

    if geometry["type"] == "Polygon":
        coordinates = [ring(r) for r in geometry["coordinates"]]
    else:
        coordinates = [[ring(r) for r in polygon] for polygon in geometry["coordinates"]]
    return {**geometry, "coordinates": coordinates}


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


class DromPlacement(NamedTuple):
    """Déplacement d'une région d'outre-mer : homothétie amenant le centre de ``source`` au centre de ``slot``."""

    zone: str  # code de la région
    name: str
    factor: float  # rapport de l'homothétie, qui rend ses dimensions réelles à la région
    source: BBox  # emprise de la région à sa position réelle
    slot: BBox  # cellule d'accueil

    @property
    def inset(self) -> BBox:
        """Cartouche : emprise de la région une fois déplacée."""
        return _moved_bbox(self.source, self.factor, self.slot)

    @property
    def offset(self) -> tuple[float, float]:
        """Translation de l'écriture affine du même déplacement : (x, y) va en (factor·x + dx, factor·y + dy).

        C'est sous cette forme que le placement dbt des tuiles est appliqué (``ST_Affine``).
        """
        return (
            (self.slot[0] + self.slot[2]) / 2 - (self.source[0] + self.source[2]) / 2 * self.factor,
            (self.slot[1] + self.slot[3]) / 2 - (self.source[1] + self.source[3]) / 2 * self.factor,
        )

    def move(self, geometry: dict[str, Any]) -> dict[str, Any]:
        """Nouvelle géométrie, déplacée ; celle reçue n'est pas modifiée."""
        return _transform(geometry, self.factor, self.source, self.slot)


class Placement(NamedTuple):
    """Placement des DROM autour de l'Hexagone, commun à toutes les mailles d'un même fond."""

    reference: BBox  # emprise de l'Hexagone et de la Corse, dont tout le reste découle
    droms: tuple[DromPlacement, ...]  # dans l'ordre des emplacements : îles en grille, puis Guyane
    separation: list[list[float]]


def compute_placement(by_zone: Mapping[str, Sequence[dict[str, Any]]]) -> Placement | None:
    """Placement des DROM d'après les entités d'une maille, regroupées par zone d'affichage.

    None sans entité dans l'Hexagone ni en Corse : il n'y a alors pas d'emprise de référence,
    et rien n'est déplacé (fond d'une région d'outre-mer affichée seule).
    """
    hexagone = [*by_zone.get(ZONE_HEXAGONE, ()), *by_zone.get(ZONE_CORSE, ())]
    if not hexagone:
        return None
    reference = features_bbox(hexagone)
    droms = []
    for code, slot in _slots(reference).items():
        members = by_zone.get(code)
        if not members:
            continue
        source = features_bbox(members)
        droms.append(DromPlacement(code, DROM[code][1], true_scale_factor(source, reference), source, slot))
    return Placement(reference, tuple(droms), separation_line(reference))


def reference_placement(regions_geojson: dict[str, Any]) -> Placement | None:
    """Placement de référence, calculé sur le fond national par région.

    Les fonds nationaux des autres mailles l'appliquent au lieu de le recalculer sur leurs
    propres entités, dont l'emprise diffère de quelques mètres (géométries généralisées
    séparément) à plusieurs dizaines de kilomètres : Ouessant et Sein, sans EPCI, manquent à
    la maille EPCI, ce qui y décalait l'Hexagone de 38 km et les cartouches de 34 à 42 km.
    """
    by_zone: dict[str, list[dict[str, Any]]] = {}
    for feature in regions_geojson.get("features", []):
        by_zone.setdefault(land_zone("REGION", feature["properties"]["land_id"]), []).append(feature)
    return compute_placement(by_zone)


def parent_boundary(geojson: dict[str, Any]) -> list[list[list[float]]] | None:
    """Limite du territoire parent précalculée avec le fond : une liste de lignes, ou None.

    dbt ne la calcule que pour les fonds dont les entités peuvent déborder du parent : un
    département à la maille EPCI, dont les EPCI à cheval sur plusieurs départements sont
    dessinés en entier (modèle ``land_national_map_parent_boundary_geom``). Elle est tracée
    sur les limites d'EPCI du fond lui-même : elle se confond avec elles partout où elle les
    longe, ce qu'aucun contour du département simplifié à part ne garantit.

    None pour tous les autres fonds, pour un fond construit avant ce calcul et pour le fond
    de repli (``LandGeoJSON``) : la carte s'affiche alors sans cette limite.
    """
    lines = [line for line in geojson.get(PARENT_BOUNDARY_MEMBER) or [] if len(line) >= 2]
    return lines or None


def build_base_map(
    geojson: dict[str, Any],
    scale: str,
    has_conso_by_land: dict[str, bool],
    region_by_land: dict[str, str] | None = None,
    placement: Placement | None = None,
) -> dict[str, Any]:
    """Construit le fond de carte : features déplacées, emprises des DROM et territoires sans données.

    Chaque feature reçoit ``zone`` (zone d'affichage servant au placement) et ``region``
    (code de la région qui contient le territoire, utilisé pour cibler une région).

    ``placement`` est le placement de référence des fonds nationaux (``reference_placement``) :
    cartouches et séparation sont alors identiques d'une maille à l'autre. Sans lui, il est
    calculé sur les entités reçues : c'est le cas du fond national par région, qui est la
    référence, et des fonds d'un territoire parent, cadrés sur leurs seules entités.

    ``parent_boundary`` : limite du territoire parent quand le fond en porte une (voir
    ``parent_boundary``), dans les coordonnées des entités. Elle n'est jamais déplacée : seul le
    fond d'un parent en porte une, et il ne contient pas à la fois l'Hexagone et un DROM.

    Le GeoJSON reçu n'est pas modifié, mais les entités renvoyées partagent avec lui leurs
    géométries tant qu'elles ne sont pas déplacées : l'appelant ne doit pas les modifier sur place.
    """
    region_by_land = region_by_land or {}
    # Copie superficielle : seules les propriétés sont complétées, et un DROM déplacé reçoit une
    # nouvelle géométrie. Une copie profonde de milliers de communes coûtait plusieurs dixièmes
    # de seconde, à chaque fond de carte.
    features = [{**f, "properties": dict(f["properties"])} for f in geojson.get("features", [])]
    by_zone: dict[str, list[dict[str, Any]]] = {}
    for feature in features:
        properties = feature["properties"]
        land_id = properties["land_id"]
        properties["land_type"] = scale
        properties["has_conso"] = bool(has_conso_by_land.get(land_id, False))
        properties["region"] = land_id if scale == "REGION" else region_by_land.get(land_id)
        properties["zone"] = land_zone(scale, land_id, properties["region"])
        by_zone.setdefault(properties["zone"], []).append(feature)

    if placement is None:
        placement = compute_placement(by_zone)
    insets: list[dict[str, Any]] = []
    separation: list[list[float]] = []

    if placement is not None:
        separation = placement.separation
        for drom in placement.droms:
            members = by_zone.get(drom.zone)
            if not members:
                continue
            for feature in members:
                feature["geometry"] = drom.move(feature["geometry"])
            # `source_bbox` : emprise du territoire à sa position réelle. Une image de cette emprise
            # (flux WMS de l'IGN) se pose telle quelle sur `bbox`, celle du territoire déplacé :
            # le déplacement est une homothétie.
            insets.append(
                {"zone": drom.zone, "name": drom.name, "bbox": list(drom.inset), "source_bbox": list(drom.source)},
            )

    no_conso_data = sorted(
        {f["properties"]["name"] for f in features if not f["properties"]["has_conso"]},
    )

    return {
        "scale": scale,
        "geojson": {"type": "FeatureCollection", "features": features},
        # Sans objet si des entités ont été déplacées : la limite ne les suivrait pas
        "parent_boundary": None if insets else parent_boundary(geojson),
        "insets": insets,
        "separation": separation,
        "no_conso_data": no_conso_data,
    }
