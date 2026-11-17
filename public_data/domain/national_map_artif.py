"""
Indicateurs d'artificialisation de la carte nationale : stock et flux par territoire.

Logique pure, sans accès à la base : la vue de ``public_data.views`` lit les tables dbt
et passe ici des dictionnaires simples.

Conventions :

* les surfaces sont en hectares, comme dans ``LandModel`` et ``LandArtifFlux`` ;
* l'OCS GE est produite département par département, à des dates différentes : le stock
  d'un territoire est celui de son dernier millésime (``years_artif`` donne l'année, ou
  les années pour un territoire à cheval sur plusieurs départements), et le flux est
  mesuré entre ses deux derniers millésimes ;
* un millésime se désigne par son index (« millésime n°2 »), comparable d'un département
  à l'autre alors que son année ne l'est pas : la réponse donne l'index à côté des années,
  parce que les années seules ne permettent pas de le retrouver (2020 est le n°1 d'un
  département et le n°2 d'un autre) ;
* la durée entre deux millésimes varie selon les départements (de 2 à 5 ans) : le rythme
  annuel divise le flux de chaque département par sa propre durée, puis somme ;
* un territoire dont la couverture OCS GE est incomplète (``has_ocsge`` faux) n'a aucune
  valeur : ses surfaces partielles ne sont pas comparables aux autres.
"""

from __future__ import annotations

from typing import Any, Iterable, Mapping

# Version du format de la réponse : à incrémenter à chaque changement de structure
# pour invalider les caches serveur.
ARTIF_FORMAT_VERSION = 2

FluxRow = Mapping[str, Any]


def round_value(value: float | None, decimals: int = 2) -> float | None:
    return None if value is None else round(value, decimals)


def group_flux_by_land(rows: Iterable[FluxRow]) -> dict[str, list[FluxRow]]:
    """Lignes ``LandArtifFlux`` (une par territoire, département et couple de millésimes) -> territoire -> lignes."""
    by_land: dict[str, list[FluxRow]] = {}
    for row in rows:
        by_land.setdefault(row["land_id"], []).append(row)
    return by_land


def latest_flux_rows(rows: Iterable[FluxRow]) -> list[FluxRow]:
    """Lignes du flux entre les deux derniers millésimes : celles du couple d'indices le plus récent."""
    rows = list(rows)
    if not rows:
        return []
    latest = max((row["millesime_new_index"], row["millesime_old_index"]) for row in rows)
    return [row for row in rows if (row["millesime_new_index"], row["millesime_old_index"]) == latest]


def annual_net_flux(rows: Iterable[FluxRow]) -> float | None:
    """Rythme annuel d'artificialisation nette (ha/an) : flux de chaque département divisé par sa durée.

    None sans ligne, ou si une durée n'est pas strictement positive.
    """
    rows = list(rows)
    if not rows:
        return None
    total = 0.0
    for row in rows:
        duration = row["year_new"] - row["year_old"]
        if duration <= 0:
            return None
        total += (row["flux_artif_net"] or 0) / duration
    return total


def percent_of(value: float | None, surface_ha: float | None) -> float | None:
    """Part de ``value`` dans la surface du territoire, en % ; None si l'une manque ou si la surface est nulle."""
    if value is None or not surface_ha:
        return None
    return value / surface_ha * 100


def empty_land() -> dict[str, Any]:
    """Indicateurs d'un territoire sans donnée ; un nouveau dictionnaire à chaque appel (listes non partagées)."""
    return {
        "artif_ha": None,
        "artif_pct": None,
        "artif_years": [],
        "artif_index": None,
        "artif_net_ha": None,
        "artif_net_pct_surface": None,
        "artif_net_annual_ha": None,
        "artif_net_annual_pct_surface": None,
        "artif_gross_ha": None,
        "desartif_gross_ha": None,
        "artif_net_years_old": [],
        "artif_net_years_new": [],
        "artif_net_index_old": None,
        "artif_net_index_new": None,
    }


def last_millesime_index(millesimes: Iterable[Mapping[str, Any]] | None) -> int | None:
    """Index du dernier millésime d'un territoire : le plus grand de ceux de ses départements.

    C'est à cet index que ``LandModel`` lit le stock du territoire (``surface_artif``,
    ``years_artif``). None sans millésime.
    """
    return max((millesime["index"] for millesime in millesimes or []), default=None)


def land_artif(land: Mapping[str, Any], flux_rows: Iterable[FluxRow]) -> dict[str, Any]:
    """Indicateurs d'artificialisation d'un territoire.

    ``land`` : ligne ``LandModel`` (``surface``, ``has_ocsge``, ``surface_artif``,
    ``percent_artif``, ``years_artif``, ``millesimes``) ; ``flux_rows`` : ses lignes ``LandArtifFlux``.
    """
    surface_ha = land.get("surface")
    result: dict[str, Any] = {"surface_ha": round_value(surface_ha), **empty_land()}
    if not land.get("has_ocsge"):
        return result

    result["artif_ha"] = round_value(land.get("surface_artif"))
    result["artif_pct"] = round_value(land.get("percent_artif"))
    result["artif_years"] = sorted(land.get("years_artif") or [])
    result["artif_index"] = last_millesime_index(land.get("millesimes"))

    rows = latest_flux_rows(flux_rows)
    if not rows:
        return result
    net = sum(row["flux_artif_net"] or 0 for row in rows)
    annual = annual_net_flux(rows)
    result.update(
        {
            "artif_net_ha": round_value(net),
            "artif_net_pct_surface": round_value(percent_of(net, surface_ha), 4),
            "artif_net_annual_ha": round_value(annual),
            "artif_net_annual_pct_surface": round_value(percent_of(annual, surface_ha), 4),
            "artif_gross_ha": round_value(sum(row["flux_artif"] or 0 for row in rows)),
            "desartif_gross_ha": round_value(sum(row["flux_desartif"] or 0 for row in rows)),
            "artif_net_years_old": sorted({row["year_old"] for row in rows}),
            "artif_net_years_new": sorted({row["year_new"] for row in rows}),
            # Les lignes retenues sont celles d'un seul couple d'indices (voir latest_flux_rows)
            "artif_net_index_old": rows[0]["millesime_old_index"],
            "artif_net_index_new": rows[0]["millesime_new_index"],
        }
    )
    return result


def build_artif_indicators(
    scale: str,
    lands: Iterable[Mapping[str, Any]],
    flux: Mapping[str, Iterable[FluxRow]],
) -> dict[str, Any]:
    """Réponse de l'endpoint « indicateurs d'artificialisation » pour tous les territoires d'une maille.

    * ``lands`` : lignes ``LandModel`` de la maille (avec ``land_id``) ;
    * ``flux`` : territoire -> lignes ``LandArtifFlux``.
    """
    return {
        "scale": scale,
        "lands": {land["land_id"]: land_artif(land, flux.get(land["land_id"], [])) for land in lands},
    }
