"""
Teste les tuiles de communes de la carte nationale (dag `create_communes_national_vector_tiles`).

La carte colore chaque commune par son identifiant : une commune que tippecanoe aurait
fusionnée avec ses voisines ou écartée d'une tuile trop lourde resterait sans couleur, sans
aucune erreur à la génération. Ces tests vérifient donc que les options passées à tippecanoe
gardent toutes les communes, avec les attributs que la carte lit.
"""

import json
import shutil
import subprocess

import pytest
import yaml
from dags.create_communes_national_vector_tiles import (
    DBT_MODELS,
    FIRST_ZOOM,
    LAST_ZOOM,
    LAYER_NAME,
    TIPPECANOE_OPTIONS,
    create_communes_national_vector_tiles,
)
from include.dbt import DBT_PROJECT_DIR

MODEL_PROPERTIES_PATH = DBT_PROJECT_DIR / "models" / "for_vector_tiles" / "for_vector_tiles_communes_national.yml"

# Attributs que la carte lit dans les tuiles : identifiant de jointure, nom au survol, codes
# de la région et du département
TILE_ATTRIBUTES = ["land_id", "name", "REGION", "DEPART"]

# Options de tippecanoe qui fusionnent des entités voisines, en écartent quand une tuile
# dépasse une limite, ou choisissent elles-mêmes le dernier zoom
FORBIDDEN_OPTION_PREFIXES = (
    "--coalesce",
    "--cluster",
    "--drop-",
    "--maximum-tile-",
    "--limit-tile-feature-count",
    "--smallest-maximum-zoom-guess",
    "--maximum-zoom=g",
    "-zg",
)

requires_tippecanoe = pytest.mark.skipif(
    shutil.which("tippecanoe") is None or shutil.which("tippecanoe-decode") is None,
    reason="tippecanoe n'est pas installé",
)


def test_tiles_span_zooms_3_to_10():
    assert (FIRST_ZOOM, LAST_ZOOM) == (3, 10)
    assert f"-Z{FIRST_ZOOM}" in TIPPECANOE_OPTIONS
    assert f"-z{LAST_ZOOM}" in TIPPECANOE_OPTIONS


@pytest.mark.parametrize("option", TIPPECANOE_OPTIONS)
def test_no_option_merges_or_drops_communes(option):
    assert not option.startswith(FORBIDDEN_OPTION_PREFIXES)


@pytest.mark.parametrize(
    "option",
    [
        # Les deux options par défaut du gestionnaire que ces tuiles ne doivent pas reprendre
        "--coalesce-densest-as-needed",
        "-zg",
        # Deux autres façons d'écarter des entités
        "--drop-densest-as-needed",
        "--maximum-tile-bytes=500000",
    ],
)
def test_merging_or_dropping_options_would_be_rejected(option):
    """Garde du test précédent : il refuserait bien ces options si elles entraient dans le dag."""
    assert option.startswith(FORBIDDEN_OPTION_PREFIXES)


@pytest.mark.parametrize(
    "option",
    [
        # Sans ces deux options, tippecanoe écarte des entités des tuiles qui dépassent ses
        # limites par défaut : cela ne se voit que sur le pays entier, pas sur un petit jeu d'essai
        "--no-feature-limit",
        "--no-tile-size-limit",
        # L'effet de la première est aussi vérifié sur des tuiles, plus bas
        "--no-tiny-polygon-reduction",
        "--no-simplification-of-shared-nodes",
    ],
)
def test_options_keeping_every_commune_are_set(option):
    assert option in TIPPECANOE_OPTIONS


def test_dag_builds_existing_dbt_models():
    """Un modèle renommé côté dbt ferait échouer le dag au premier lancement seulement."""
    model_names = {path.stem for path in (DBT_PROJECT_DIR / "models").rglob("*.sql")}
    assert set(DBT_MODELS) <= model_names


def test_tile_attributes_are_the_columns_of_the_dbt_model():
    """
    Le dag exporte toutes les colonnes du modèle : chacune devient un attribut des tuiles,
    chargé avec chaque commune. Une colonne en plus alourdirait toutes les tuiles, une
    colonne en moins priverait la carte d'un attribut qu'elle lit.
    """
    (model,) = yaml.safe_load(MODEL_PROPERTIES_PATH.read_text())["models"]
    assert [column["name"] for column in model["columns"]] == [*TILE_ATTRIBUTES, "geom"]


def test_dag_only_runs_when_triggered():
    """
    Le dag écrit dans l'entrepôt et sur S3 : il ne doit tourner que sur demande, pas à sa
    création ni à sa sortie de pause.
    """
    dag = create_communes_national_vector_tiles()
    assert dag.timetable.can_be_scheduled is False
    assert [task.task_id for task in dag.topological_sort()] == [
        "dbt_build",
        "postgis_to_geojson",
        "geojson_to_pmtiles",
        "make_pmtiles_public",
    ]
    assert dag.get_task("dbt_build").select == DBT_MODELS


def make_communes(columns: int, rows: int) -> list[dict]:
    """
    Grille de communes carrées et jointives de 1,5 km de côté, vers 46° N : la taille des
    plus petites communes courantes, celles qui disparaissent en premier des petits zooms.
    Les identifiants mêlent les formes de codes INSEE qu'un traitement numérique abîmerait
    (zéro en tête, Corse).
    """
    width, height = 0.0195, 0.0135
    prefixes = ["01", "2A", "63", "97"]
    communes = []
    for row in range(rows):
        for column in range(columns):
            west, south = 2 + column * width, 46 + row * height
            index = row * columns + column
            communes.append(
                {
                    "type": "Feature",
                    "properties": {
                        "land_id": f"{prefixes[index % len(prefixes)]}{index:03d}",
                        "name": f"Saint-Rémy-l'Écluse {index}",
                        "REGION": "84",
                        "DEPART": "63",
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [west, south],
                                [west + width, south],
                                [west + width, south + height],
                                [west, south + height],
                                [west, south],
                            ]
                        ],
                    },
                }
            )
    return communes


@requires_tippecanoe
def test_tippecanoe_keeps_every_commune_with_its_attributes(tmp_path):
    """Passe les options du dag à tippecanoe et relit les tuiles produites, zoom par zoom."""
    # Nom de fichier quelconque : la couche doit tenir son nom des options, pas du fichier
    geojson_path = tmp_path / "export.geojson"
    pmtiles_path = tmp_path / "export.pmtiles"
    communes = make_communes(columns=12, rows=12)
    # Même format que l'export du dag : une entité par ligne, précédée du séparateur RS
    geojson_path.write_text("".join(f"\x1e{json.dumps(commune)}\n" for commune in communes))

    subprocess.run(["tippecanoe", "-o", str(pmtiles_path), str(geojson_path), *TIPPECANOE_OPTIONS], check=True)
    decoded = json.loads(
        subprocess.run(["tippecanoe-decode", str(pmtiles_path)], check=True, capture_output=True).stdout
    )

    properties_by_zoom: dict[int, list[dict]] = {}
    for tile in decoded["features"]:
        for layer in tile["features"]:
            assert layer["properties"]["layer"] == LAYER_NAME
            properties_by_zoom.setdefault(tile["properties"]["zoom"], []).extend(
                feature["properties"] for feature in layer["features"]
            )

    assert sorted(properties_by_zoom) == list(range(FIRST_ZOOM, LAST_ZOOM + 1))

    expected_properties = {commune["properties"]["land_id"]: commune["properties"] for commune in communes}
    for zoom, tile_properties in properties_by_zoom.items():
        # Les attributs sortent tels qu'ils sont entrés : des chaînes, zéros en tête compris.
        # Une commune proche d'un bord de tuile est écrite dans les deux tuiles voisines.
        found_properties = {properties["land_id"]: properties for properties in tile_properties}
        for land_id, properties in found_properties.items():
            assert properties == expected_properties[land_id], f"zoom {zoom}"
        # Au zoom 3, une commune de cette taille peut être plus petite qu'une maille de la
        # grille de la tuile et ne pas y figurer : toutes sont exigées à partir du zoom 4
        if zoom > FIRST_ZOOM:
            assert len(found_properties) == len(communes), f"zoom {zoom}"
