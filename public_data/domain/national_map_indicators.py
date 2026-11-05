"""
Indicateurs de la carte nationale : consommation d'ENAF par territoire et cartes bivariées.

Logique pure, sans accès à la base : les vues de ``public_data.views`` lisent les tables
dbt et passent ici des dictionnaires simples.

Conventions :

* les consommations sont stockées en m² (``LandConso``) et renvoyées en hectares ;
* une période ``(start_year, end_year)`` couvre les millésimes ``start_year`` à
  ``end_year`` inclus, soit ``end_year - start_year + 1`` années : (2011, 2020)
  correspond à « entre le 1er janvier 2011 et le 1er janvier 2021 » ;
* les consommations par période sont sommées à partir des millésimes annuels :
  ``LandConsoStats`` donne les mêmes totaux mais n'a pas de ligne pour une période
  d'une seule année ;
* les cartes bivariées (consommation × indicateur INSEE) reprennent les taux et seuils
  précalculés par dbt pour le dossier complet ; la règle de classement 3 × 3 et la
  palette bilinéaire sont celles de ``project.charts.dossier_complet``, réimplémentées
  ici pour ne pas importer ``project`` depuis ``public_data``.
"""

from __future__ import annotations

from typing import Any, Iterable, Mapping, NamedTuple

M2_PER_HA = 10_000

# Première année des données de consommation (millésime 2011 des fichiers fonciers)
FIRST_YEAR = 2011
# Périodes de référence de la loi Climat et résilience : 2011-2020 (« entre le
# 1er janvier 2011 et le 1er janvier 2021 ») puis à partir de 2021
PERIOD_1_END = 2020
PERIOD_2_START = 2021

DESTINATIONS = ("habitat", "activite", "mixte", "route", "ferroviaire", "inconnu")
CONSO_FIELDS = ("total",) + DESTINATIONS

# Version du format de la réponse « indicateurs » : à incrémenter à chaque changement
# de structure pour invalider les caches serveur.
INDICATORS_FORMAT_VERSION = 2

Period = tuple[int, int]
# (conso_t1, conso_t2, indic_t1, indic_t2) : bornes hautes des deux premiers tertiles
Thresholds = tuple[float, float, float, float]


class Bivariate(NamedTuple):
    indicator: str  # ``indicator`` des tables dbt de taux et de seuils
    conso_field: str  # ``conso_field`` des tables dbt de taux et de seuils
    corners: tuple[str, str, str, str]  # haut gauche, haut droite, bas gauche, bas droite
    conso_label: str
    indicator_label: str
    indicator_unit: str = "%"


BIVARIATES: dict[str, Bivariate] = {
    "bivariate_activite_emplois": Bivariate(
        "emploi",
        "activite",
        ("#b5b8d9", "#4a1486", "#e34a33", "#fdbe85"),
        "Consommation annuelle pour l'activité",
        "Évolution de l'emploi",
    ),
    "bivariate_habitat_menages": Bivariate(
        "menages",
        "habitat",
        ("#99d8c9", "#00695c", "#e34a33", "#fdcc8a"),
        "Consommation annuelle pour l'habitat",
        "Évolution du nombre de ménages",
    ),
    # dbt croise la population avec la consommation totale, pas avec la seule
    # consommation pour l'habitat : c'est ce couple qui existe dans les tables.
    "bivariate_habitat_population": Bivariate(
        "population",
        "total",
        ("#74c476", "#006d2c", "#e34a33", "#fdcc8a"),
        "Consommation annuelle totale",
        "Évolution de la population",
    ),
}


def round_value(value: float | None, decimals: int = 2) -> float | None:
    return None if value is None else round(value, decimals)


def year_count(period: Period) -> int:
    start_year, end_year = period
    return end_year - start_year + 1


def fixed_periods(max_year: int) -> dict[str, Period]:
    """Périodes de référence : 2011-2020, 2021 à la dernière année, et l'ensemble."""
    return {
        "p1": (FIRST_YEAR, PERIOD_1_END),
        "p2": (PERIOD_2_START, max_year),
        "total": (FIRST_YEAR, max_year),
    }


def period_error(start_year: int, end_year: int, min_year: int, max_year: int) -> str | None:
    """Message d'erreur si la période demandée n'est pas valide, None sinon."""
    if start_year > end_year:
        return "Le paramètre start_year doit être inférieur ou égal à end_year"
    if start_year < min_year or end_year > max_year:
        return f"Les années doivent être comprises entre {min_year} et {max_year}"
    return None


# --- Palette et classement des cartes bivariées -------------------------------------


def _lerp_color(c1: str, c2: str, t: float) -> str:
    """Interpolation linéaire entre deux couleurs hexadécimales."""
    r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
    r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
    return "#{:02x}{:02x}{:02x}".format(
        int(r1 + (r2 - r1) * t),
        int(g1 + (g2 - g1) * t),
        int(b1 + (b2 - b1) * t),
    )


def bilinear_palette(top_left: str, top_right: str, bottom_left: str, bottom_right: str) -> list[str]:
    """Neuf couleurs par interpolation bilinéaire des quatre coins.

    Ligne par ligne (ligne 0 = consommation faible, ligne 2 = forte), et dans chaque
    ligne de l'indicateur faible à l'indicateur fort : la couleur de la classe ``c``
    est à l'index ``c``.
    """
    colors = []
    for row in range(3):
        ty = row / 2.0
        left = _lerp_color(top_left, bottom_left, ty)
        right = _lerp_color(top_right, bottom_right, ty)
        for column in range(3):
            colors.append(_lerp_color(left, right, column / 2.0))
    return colors


def classify_3x3(
    conso: float | None,
    indic: float | None,
    conso_t1: float,
    conso_t2: float,
    indic_t1: float,
    indic_t2: float,
) -> int:
    """Classe 0 à 8 : ligne (consommation) × 3 + colonne (indicateur).

    Les seuils sont les bornes hautes des deux premiers tertiles, incluses. Comme dans
    le dossier complet, une consommation absente est classée faible et un indicateur
    absent est classé intermédiaire.
    """
    if conso is None or conso <= conso_t1:
        row = 0
    elif conso > conso_t2:
        row = 2
    else:
        row = 1

    if indic is None:
        column = 1
    elif indic <= indic_t1:
        column = 0
    elif indic > indic_t2:
        column = 2
    else:
        column = 1

    return row * 3 + column


def bivariate_class(
    rates: tuple[float | None, float | None] | None, thresholds: Thresholds | None
) -> dict[str, Any] | None:
    """Classe et taux d'un territoire sur une carte bivariée ; None sans taux ou sans seuils."""
    if rates is None or thresholds is None:
        return None
    conso_rate, indic_rate = rates
    return {
        "class": classify_3x3(conso_rate, indic_rate, *thresholds),
        "conso_rate": round_value(conso_rate, 4),
        "indic_rate": round_value(indic_rate, 4),
    }


def bivariate_description(bivariate: Bivariate, thresholds: Thresholds | None) -> dict[str, Any]:
    """Palette, seuils et libellés d'une carte bivariée (seuils à None s'ils n'existent pas pour la période)."""
    return {
        "palette": bilinear_palette(*bivariate.corners),
        "conso_thresholds": [round_value(thresholds[0], 4), round_value(thresholds[1], 4)] if thresholds else None,
        "indic_thresholds": [round_value(thresholds[2], 4), round_value(thresholds[3], 4)] if thresholds else None,
        "conso_label": bivariate.conso_label,
        "indicator_label": bivariate.indicator_label,
        "indicator_unit": bivariate.indicator_unit,
    }


# --- Consommation par année et par période ------------------------------------------


def group_by_land(rows: Iterable[Mapping[str, Any]]) -> dict[str, dict[int, dict[str, float]]]:
    """Lignes ``LandConso`` -> territoire -> année -> consommations (m²)."""
    by_land: dict[str, dict[int, dict[str, float]]] = {}
    for row in rows:
        by_land.setdefault(row["land_id"], {})[row["year"]] = {field: row.get(field) or 0 for field in CONSO_FIELDS}
    return by_land


def period_sum(conso_by_year: Mapping[int, Mapping[str, float]], period: Period) -> dict[str, float] | None:
    """Somme des consommations (m²) sur les millésimes de la période ; None si aucun n'est renseigné."""
    start_year, end_year = period
    vintages = [conso_by_year[year] for year in range(start_year, end_year + 1) if year in conso_by_year]
    if not vintages:
        return None
    return {field: sum(vintage.get(field) or 0 for vintage in vintages) for field in CONSO_FIELDS}


def _total_ha(total: Mapping[str, float] | None) -> float | None:
    return None if total is None else total["total"] / M2_PER_HA


def _annual_mean_ha(total: Mapping[str, float] | None, period: Period) -> float | None:
    total_ha = _total_ha(total)
    return None if total_ha is None else total_ha / year_count(period)


def relative_change(before: float | None, after: float | None) -> float | None:
    """Évolution en % de ``before`` à ``after`` ; None si l'une manque ou si ``before`` est nul."""
    if not before or after is None:
        return None
    return (after - before) / before * 100


# --- Assemblage ---------------------------------------------------------------------


def land_indicators(
    surface_ha: float,
    conso_by_year: Mapping[int, Mapping[str, float]],
    period: Period,
    fixed: Mapping[str, Period],
    bivariate_rates: Mapping[str, tuple[float | None, float | None]],
    bivariate_thresholds: Mapping[str, Thresholds | None],
) -> dict[str, Any]:
    """Indicateurs d'un territoire pour la période demandée et les périodes de référence."""
    selection = period_sum(conso_by_year, period)
    p1 = period_sum(conso_by_year, fixed["p1"])
    p2 = period_sum(conso_by_year, fixed["p2"])
    total = period_sum(conso_by_year, fixed["total"])

    conso_ha = _total_ha(selection)
    p1_mean = _annual_mean_ha(p1, fixed["p1"])
    p2_mean = _annual_mean_ha(p2, fixed["p2"])

    return {
        "surface_ha": round_value(surface_ha),
        "conso_ha": round_value(conso_ha),
        "conso_pct_surface": round_value(conso_ha / surface_ha * 100) if conso_ha is not None and surface_ha else None,
        **{
            f"conso_{destination}_ha": round_value(selection[destination] / M2_PER_HA) if selection else None
            for destination in DESTINATIONS
        },
        "annual_conso_2011_2021": round_value(p1_mean),
        "annual_conso_2021_end": round_value(p2_mean),
        "conso_evolution_between_periods": round_value(relative_change(p1_mean, p2_mean)),
        "conso_2011_end": round_value(_total_ha(total)),
        "conso_2011_2021": round_value(_total_ha(p1)),
        "conso_2021_end": round_value(_total_ha(p2)),
        **{key: bivariate_class(bivariate_rates.get(key), bivariate_thresholds.get(key)) for key in BIVARIATES},
    }


def build_indicators(
    scale: str,
    period: Period,
    years: Period,
    surfaces: Mapping[str, float],
    conso: Mapping[str, Mapping[int, Mapping[str, float]]],
    bivariate_rates: Mapping[str, Mapping[str, tuple[float | None, float | None]]],
    bivariate_thresholds: Mapping[str, Thresholds | None],
) -> dict[str, Any]:
    """Réponse de l'endpoint « indicateurs » pour tous les territoires d'une maille.

    * ``years`` : première et dernière années disponibles ;
    * ``surfaces`` : territoire -> surface en hectares (tous les territoires de la maille) ;
    * ``conso`` : territoire -> année -> consommations en m² ;
    * ``bivariate_rates`` : carte bivariée -> territoire -> (taux de consommation, taux de l'indicateur) ;
    * ``bivariate_thresholds`` : carte bivariée -> seuils de la période, ou None s'ils n'existent pas.
    """
    start_year, end_year = period
    fixed = fixed_periods(years[1])
    return {
        "scale": scale,
        "start_year": start_year,
        "end_year": end_year,
        "years": {"min": years[0], "max": years[1]},
        "fixed_periods": {name: list(bounds) for name, bounds in fixed.items()},
        "lands": {
            land_id: land_indicators(
                surface_ha,
                conso.get(land_id, {}),
                period,
                fixed,
                {key: rates.get(land_id) for key, rates in bivariate_rates.items()},
                bivariate_thresholds,
            )
            for land_id, surface_ha in surfaces.items()
        },
        "bivariate": {
            key: bivariate_description(bivariate, bivariate_thresholds.get(key))
            for key, bivariate in BIVARIATES.items()
        },
    }
