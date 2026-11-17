"""
Valeurs d'un indicateur de la carte nationale pour tous les territoires d'une maille, en colonnes.

Logique pure, sans accès à la base : la vue de ``public_data.views`` lit les tables dbt et
passe ici des structures simples.

La France entière compte 34 875 communes : la réponse « indicateurs », qui donne tous les
indicateurs de chaque territoire, y pèserait 21,7 Mo (2,5 Mo compressés). Ici une réponse ne
porte que la colonne dessinée par la carte, et au besoin celle des hectares affichés au survol,
alignées sur la liste triée des identifiants : 100 à 260 Ko compressés (mesuré).

Conventions :

* les valeurs sont exactement celles des réponses « indicateurs » et « indicateurs
  d'artificialisation » (mêmes sommes, mêmes arrondis) : elles sont produites par les mêmes
  fonctions, et un test les compare clé par clé ;
* une valeur en hectares a une version relative, rapportée à la surface du territoire (en %),
  parce qu'un aplat de couleur ne doit pas représenter une quantité absolue. C'est le front qui
  choisit la colonne dessinée : ici on ne sert que des colonnes nommées ;
* un territoire dont la source manque (``has_conso`` ou ``has_ocsge`` faux) n'a aucune valeur et
  figure dans ``no_data`` ; une valeur peut aussi être nulle parce qu'elle n'est pas calculable
  (évolution depuis une consommation nulle, surface inconnue), sans que la source manque.
"""

from __future__ import annotations

import gzip
import json
from typing import Any, Iterable, Mapping, NamedTuple, Sequence

from public_data.domain.national_map_artif import empty_land
from public_data.domain.national_map_indicators import (
    BIVARIATES,
    M2_PER_HA,
    Period,
    Thresholds,
    Vintage,
    bivariate_class,
    bivariate_description,
    fixed_periods,
    period_sum,
    relative_change,
    round_value,
    year_count,
)

# Version du format de la réponse et des colonnes mises en cache : à incrémenter à chaque
# changement de structure ou de règle de calcul, pour invalider les caches serveur.
VALUES_FORMAT_VERSION = 1

# Mailles servies. La forme de la réponse convient à toutes, mais seule la maille commune en a
# besoin : les autres tiennent dans la réponse « indicateurs ».
VALUES_SCALES = ("COMM",)

# Au-delà, les territoires sans donnée sont comptés (``no_data_count``) sans être nommés : la
# liste ne doit pas peser sur la réponse si une source venait à manquer pour toute une région.
NO_DATA_LIMIT = 50

# --- Clés servies -------------------------------------------------------------------

# Familles de clés : les clés d'une même famille se lisent dans les mêmes données.
CONSO = "conso"
BIVARIATE = "bivariate"
ARTIF_STOCK = "artif_stock"
ARTIF_FLUX = "artif_flux"

# Période choisie par l'utilisateur, à côté des périodes de référence de ``fixed_periods``
SELECTION = "selection"

RELATIVE_SUFFIX = "_pct_surface"


class ConsoSum(NamedTuple):
    """Somme d'une consommation sur une période : la seule lecture dont dépend une colonne de consommation."""

    field: str  # champ de ``LandConso``, en m²
    period: str  # SELECTION ou nom d'une période de référence (p1, p2, total)


class ConsoColumn(NamedTuple):
    """Colonne tirée d'une somme de consommation, convertie en hectares."""

    sum: ConsoSum
    per_surface: bool = False  # rapportée à la surface du territoire, en %


# Valeurs en hectares de la réponse « indicateurs », toutes sur la période choisie : les périodes
# de référence se demandent par ``start_year`` et ``end_year``, comme n'importe quelle période
CONSO_AMOUNTS: dict[str, ConsoColumn] = {
    "conso_ha": ConsoColumn(ConsoSum("total", SELECTION)),
    "conso_habitat_ha": ConsoColumn(ConsoSum("habitat", SELECTION)),
    "conso_activite_ha": ConsoColumn(ConsoSum("activite", SELECTION)),
}


def relative_key(amount_key: str) -> str:
    """Clé de la version relative d'une valeur en hectares : ``conso_ha`` -> ``conso_pct_surface``."""
    return amount_key.removesuffix("_ha") + RELATIVE_SUFFIX


# Chaque valeur en hectares et sa version relative : la valeur non arrondie divisée par la
# surface, en %. ``conso_pct_surface``, déjà servie par « indicateurs », est la version relative
# de ``conso_ha``.
CONSO_COLUMNS: dict[str, ConsoColumn] = {
    **CONSO_AMOUNTS,
    **{relative_key(key): column._replace(per_surface=True) for key, column in CONSO_AMOUNTS.items()},
}

# Évolution du rythme annuel entre les deux périodes de référence : seule colonne de
# consommation qui dépend de deux sommes
EVOLUTION_KEY = "conso_evolution_between_periods"
EVOLUTION_SUMS = (ConsoSum("total", "p1"), ConsoSum("total", "p2"))

# Millésimes du survol, sous les noms qu'ils ont dans la réponse « indicateurs d'artificialisation »
ARTIF_KEYS: dict[str, tuple[str, ...]] = {
    ARTIF_STOCK: ("artif_ha", "artif_pct"),
    ARTIF_FLUX: (
        "artif_net_ha",
        "artif_net_pct_surface",
        "artif_net_annual_ha",
        "artif_net_annual_pct_surface",
    ),
}
# Avec les années, l'index des millésimes : c'est par lui que le site les désigne
ARTIF_YEAR_FIELDS: dict[str, tuple[str, ...]] = {
    ARTIF_STOCK: ("artif_years", "artif_index"),
    ARTIF_FLUX: ("artif_net_years_old", "artif_net_years_new", "artif_net_index_old", "artif_net_index_new"),
}

# Liste fermée des clés servies, avec leur famille
FAMILY_BY_KEY: dict[str, str] = {
    **{key: CONSO for key in (*CONSO_COLUMNS, EVOLUTION_KEY)},
    **{key: BIVARIATE for key in BIVARIATES},
    **{key: family for family, keys in ARTIF_KEYS.items() for key in keys},
}

# Colonne des hectares qui peut accompagner une colonne dessinée : la valeur absolue dont elle
# est la version relative, et elle seule. Accepter toute clé de la famille multiplierait par
# près de cinq les corps que le cache peut recevoir (6 013 au lieu de 1 270, pour 105 périodes),
# sans usage pour la carte.
AMOUNT_BY_KEY: dict[str, str] = {
    **{relative_key(key): key for key in CONSO_AMOUNTS},
    "artif_pct": "artif_ha",
    "artif_net_pct_surface": "artif_net_ha",
    "artif_net_annual_pct_surface": "artif_net_annual_ha",
}


def request_error(key: str | None, amount: str | None) -> str | None:
    """Message d'erreur si la clé dessinée ou celle des hectares n'est pas servie, None sinon."""
    family = FAMILY_BY_KEY.get(key)
    if family is None:
        return f"Paramètre key invalide : valeurs acceptées {', '.join(FAMILY_BY_KEY)}"
    if amount is None:
        return None
    if family == BIVARIATE:
        return "Le paramètre amount n'est pas accepté avec une carte bivariée"
    expected = AMOUNT_BY_KEY.get(key)
    if amount != expected:
        accepted = f"valeur acceptée {expected}" if expected else "aucune valeur acceptée"
        return f"Paramètre amount invalide avec key={key} : {accepted}"
    return None


def requested_keys(key: str, amount: str | None) -> tuple[str, ...]:
    """Colonnes à calculer : la clé dessinée et, si elle est demandée, celle des hectares."""
    return (key,) if amount is None else (key, amount)


def needed_sums(keys: Iterable[str]) -> tuple[ConsoSum, ...]:
    """Sommes de consommation à lire pour ces clés, sans doublon."""
    sums: dict[ConsoSum, None] = {}
    for key in keys:
        for conso_sum in EVOLUTION_SUMS if key == EVOLUTION_KEY else (CONSO_COLUMNS[key].sum,):
            sums[conso_sum] = None
    return tuple(sums)


def uses_period(key: str, amount: str | None = None) -> bool:
    """Vrai si la réponse dépend de la période choisie (sinon ``start_year`` et ``end_year`` sont ignorés)."""
    family = FAMILY_BY_KEY[key]
    if family == BIVARIATE:
        return True
    if family != CONSO:
        return False
    return any(conso_sum.period == SELECTION for conso_sum in needed_sums(requested_keys(key, amount)))


def conso_periods(period: Period | None, max_year: int) -> dict[str, Period]:
    """Périodes nommées des sommes de consommation : celles de référence, et la période choisie s'il y en a une."""
    periods = fixed_periods(max_year)
    if period is not None:
        periods[SELECTION] = period
    return periods


# --- Référentiel des territoires ----------------------------------------------------


class Referential(NamedTuple):
    """Territoires d'une maille, en colonnes alignées sur ``ids`` (identifiants triés)."""

    ids: list[str]
    regions: list[str | None]  # code de la région qui contient le territoire
    surfaces: list[float | None]  # en hectares
    has_conso: list[bool]
    has_ocsge: list[bool]
    # (identifiant, nom) des territoires sans donnée, dans l'ordre des identifiants
    without_conso: list[tuple[str, str]]
    without_ocsge: list[tuple[str, str]]


def build_referential(rows: Iterable[tuple[str, str, float | None, bool, bool, str | None]]) -> Referential:
    """Référentiel d'une maille. ``rows`` : (identifiant, nom, surface en ha, has_conso, has_ocsge, code région)."""
    rows = sorted(rows, key=lambda row: row[0])
    return Referential(
        ids=[row[0] for row in rows],
        regions=[row[5] for row in rows],
        surfaces=[row[2] for row in rows],
        has_conso=[bool(row[3]) for row in rows],
        has_ocsge=[bool(row[4]) for row in rows],
        without_conso=[(row[0], row[1]) for row in rows if not row[3]],
        without_ocsge=[(row[0], row[1]) for row in rows if not row[4]],
    )


# --- Consommation -------------------------------------------------------------------


def sums_in_year_order(
    conso_by_year: Mapping[int, Vintage], sums: Sequence[ConsoSum], periods: Mapping[str, Period]
) -> tuple[float | None, ...]:
    """Sommes d'un territoire (m²) faites par ``period_sum``, comme pour la réponse « indicateurs ».

    Une somme de flottants dépend de l'ordre de ses termes dès que l'un d'eux n'est pas entier :
    la vue refait par ici, millésime après millésime, les sommes que la base ne garantit pas au
    bit près. None pour une période sans aucun millésime.
    """
    values = []
    for field, period_name in sums:
        by_field = period_sum(conso_by_year, periods[period_name])
        values.append(by_field[field] if by_field else None)
    return tuple(values)


def conso_value(column: ConsoColumn, sum_m2: float | None, surface_ha: float | None) -> float | None:
    """Valeur d'une colonne de consommation ; None sans millésime ou, pour une version relative, sans surface.

    Mêmes opérations, dans le même ordre, que ``land_indicators`` : le résultat doit lui être
    identique au bit près avant l'arrondi.
    """
    if sum_m2 is None:
        return None
    value = sum_m2 / M2_PER_HA
    if column.per_surface:
        if not surface_ha:
            return None
        value = value / surface_ha * 100
    return round_value(value)


def evolution_value(p1_m2: float | None, p2_m2: float | None, periods: Mapping[str, Period]) -> float | None:
    """Évolution, en %, du rythme annuel de consommation entre les deux périodes de référence."""
    p1_mean, p2_mean = (
        None if sum_m2 is None else sum_m2 / M2_PER_HA / year_count(periods[name])
        for name, sum_m2 in (("p1", p1_m2), ("p2", p2_m2))
    )
    return round_value(relative_change(p1_mean, p2_mean))


def conso_columns(
    keys: Sequence[str],
    referential: Referential,
    sums_by_land: Mapping[str, Sequence[float | None]],
    periods: Mapping[str, Period],
) -> dict[str, list[float | None]]:
    """Colonnes de consommation de ces clés, alignées sur le référentiel.

    * ``sums_by_land`` : territoire -> sommes en m², dans l'ordre de ``needed_sums(keys)`` ;
    * ``periods`` : périodes nommées (``conso_periods``).

    Sans donnée de consommation (``has_conso`` faux) ou sans somme, la valeur est nulle.
    """
    positions = {conso_sum: position for position, conso_sum in enumerate(needed_sums(keys))}
    known = [
        (sums_by_land.get(land_id) if has_conso else None, surface)
        for land_id, surface, has_conso in zip(referential.ids, referential.surfaces, referential.has_conso)
    ]
    columns = {}
    for key in keys:
        if key == EVOLUTION_KEY:
            p1, p2 = (positions[conso_sum] for conso_sum in EVOLUTION_SUMS)
            columns[key] = [
                None if sums is None else evolution_value(sums[p1], sums[p2], periods) for sums, _ in known
            ]
            continue
        column = CONSO_COLUMNS[key]
        position = positions[column.sum]
        columns[key] = [
            None if sums is None else conso_value(column, sums[position], surface) for sums, surface in known
        ]
    return columns


# --- Cartes bivariées ---------------------------------------------------------------


def bivariate_content(
    key: str,
    referential: Referential,
    rates: Mapping[str, tuple[float | None, float | None]],
    thresholds: Thresholds | None,
) -> dict[str, Any]:
    """Contenu de la réponse d'une carte bivariée : classe et taux par territoire, palette et seuils.

    ``rates`` : territoire -> (taux de consommation, taux de l'indicateur) ; ``thresholds`` : seuils
    de la période, ou None s'ils n'existent pas. Classe et taux sont ceux de ``bivariate_class``,
    nuls sans donnée de consommation, sans taux ou sans seuils.
    """
    unclassified = {"class": None, "conso_rate": None, "indic_rate": None}
    results = [
        (bivariate_class(rates.get(land_id), thresholds) if has_conso else None) or unclassified
        for land_id, has_conso in zip(referential.ids, referential.has_conso)
    ]
    return {
        "classes": [result["class"] for result in results],
        "conso_rates": [result["conso_rate"] for result in results],
        "indic_rates": [result["indic_rate"] for result in results],
        "bivariate": bivariate_description(BIVARIATES[key], thresholds),
    }


# --- Artificialisation --------------------------------------------------------------


def indexed_year_sets(
    lands: Iterable[Mapping[str, Any]], fields: Sequence[str]
) -> tuple[list[dict[str, Any]], list[int]]:
    """Jeux de millésimes distincts, et rang du jeu de chaque territoire.

    L'OCS GE est produite par département : des milliers de communes partagent les mêmes
    millésimes. Les répéter pour chacune pèserait plus que la colonne des valeurs ; on ne les
    écrit qu'une fois, dans l'ordre de leur première apparition.
    """
    ranks: dict[tuple[Any, ...], int] = {}
    year_sets = []
    index = []
    for land in lands:
        # Copie de chaque champ : une liste d'années, ou l'index d'un millésime (un entier ou None)
        values = {field: list(land[field]) if isinstance(land[field], list) else land[field] for field in fields}
        signature = tuple(tuple(value) if isinstance(value, list) else value for value in values.values())
        rank = ranks.get(signature)
        if rank is None:
            rank = ranks[signature] = len(year_sets)
            year_sets.append(values)
        index.append(rank)
    return year_sets, index


def artif_columns(referential: Referential, artif_by_land: Mapping[str, Mapping[str, Any]]) -> dict[str, Any]:
    """Colonnes de toutes les clés d'artificialisation, et millésimes de chaque famille.

    ``artif_by_land`` : territoire -> indicateurs de ``land_artif`` (champ ``lands`` de la réponse
    « indicateurs d'artificialisation »), repris tels quels. Calculées ensemble parce qu'elles
    viennent de la même lecture, la plus longue de la carte : la vue les met en cache d'un bloc.
    """
    missing = empty_land()
    lands = [artif_by_land.get(land_id, missing) for land_id in referential.ids]
    return {
        "values": {key: [land[key] for land in lands] for keys in ARTIF_KEYS.values() for key in keys},
        "year_sets": {family: indexed_year_sets(lands, fields) for family, fields in ARTIF_YEAR_FIELDS.items()},
    }


def artif_content(key: str, amount: str | None, columns: Mapping[str, Any]) -> dict[str, Any]:
    """Contenu de la réponse d'une clé d'artificialisation, tiré des colonnes de ``artif_columns``."""
    year_sets, index = columns["year_sets"][FAMILY_BY_KEY[key]]
    return {**scalar_content(key, amount, columns["values"]), "year_sets": year_sets, "year_set_index": index}


# --- Réponse ------------------------------------------------------------------------


def scalar_content(key: str, amount: str | None, columns: Mapping[str, list[float | None]]) -> dict[str, Any]:
    """Colonne dessinée (``values``) et, si elle est demandée, colonne des hectares (``amounts``)."""
    content = {"values": columns[key]}
    if amount is not None:
        content["amounts"] = columns[amount]
    return content


def build_values(
    scale: str,
    key: str,
    amount: str | None,
    period: Period | None,
    referential: Referential,
    content: Mapping[str, Any],
) -> dict[str, Any]:
    """Réponse de l'endpoint « valeurs » : en-tête, identifiants, colonnes de ``content``, territoires sans donnée.

    ``period`` vaut None pour une clé qui n'en dépend pas. ``no_data`` nomme les territoires dont
    la source manque (consommation ou OCS GE selon la famille de la clé), ``NO_DATA_LIMIT`` au
    plus ; ``no_data_count`` les compte tous.
    """
    start_year, end_year = period or (None, None)
    no_data = referential.without_conso if FAMILY_BY_KEY[key] in (CONSO, BIVARIATE) else referential.without_ocsge
    return {
        "scale": scale,
        "key": key,
        "amount": amount,
        "start_year": start_year,
        "end_year": end_year,
        "ids": referential.ids,
        "regions": referential.regions,
        **content,
        "no_data": [list(land) for land in no_data[:NO_DATA_LIMIT]],
        "no_data_count": len(no_data),
    }


def compressed_body(payload: Mapping[str, Any]) -> bytes:
    """Corps de la réponse : JSON compact compressé en gzip, prêt à être mis en cache et renvoyé tel quel.

    Sans date dans l'en-tête gzip : le même contenu donne les mêmes octets.
    """
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return gzip.compress(raw, compresslevel=6, mtime=0)
