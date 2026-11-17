"""
Teste les tuiles des sols artificialisés de la carte nationale
(dag `create_sols_artificialises_national_vector_tiles`).

Le fichier de tuiles est multi-résolution : le modèle dbt empile des mailles de 250 m à 5 km,
et un filtre tippecanoe répartit ces résolutions entre les zooms. Trois erreurs seraient
silencieuses à la génération et ne se verraient que sur la carte : un zoom qu'aucune
résolution ne sert (carte vide), un zoom servi par plusieurs (mailles superposées), et des
mailles écartées d'une tuile trop lourde (trous dans la carte).
"""

import json
import shutil
import subprocess

import dbt_macros
import pytest
import yaml
from dags.create_sols_artificialises_national_vector_tiles import (
    DBT_MODELS,
    EXCLUDED_ATTRIBUTE,
    FIRST_ZOOM,
    LAST_ZOOM,
    LAYER_NAME,
    RESOLUTION_ATTRIBUTE,
    TILE_ATTRIBUTES,
    TIPPECANOE_OPTIONS,
    ZOOMS_BY_RESOLUTION_M,
    create_sols_artificialises_national_vector_tiles,
    get_export_sql,
)
from include.dbt import DBT_PROJECT_DIR

MACROS_DIR = DBT_PROJECT_DIR / "macros" / "carroyage_artif"
MODEL_PROPERTIES_PATH = (
    DBT_PROJECT_DIR / "models" / "for_vector_tiles" / "for_vector_tiles_sols_artificialises_national.yml"
)

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


def get_model_columns() -> list[str]:
    (model,) = yaml.safe_load(MODEL_PROPERTIES_PATH.read_text())["models"]
    return [column["name"] for column in model["columns"]]


def test_tiles_span_zooms_3_to_10():
    assert (FIRST_ZOOM, LAST_ZOOM) == (3, 10)
    assert f"-Z{FIRST_ZOOM}" in TIPPECANOE_OPTIONS
    assert f"-z{LAST_ZOOM}" in TIPPECANOE_OPTIONS


def test_dag_serves_exactly_the_resolutions_of_the_dbt_model():
    """
    Une résolution du modèle sans plage de zooms serait calculée et exportée pour rien ; une
    plage de zooms sans résolution dans le modèle laisserait ces zooms vides.
    """
    resolutions_of_dbt_model = dbt_macros.evaluate_dbt_list_macro(MACROS_DIR, "carroyage_artif_resolutions_m")
    assert sorted(ZOOMS_BY_RESOLUTION_M) == sorted(resolutions_of_dbt_model)


def test_finer_cells_are_served_at_higher_zooms():
    """Une maille plus fine servie à un zoom plus petit chargerait des centaines de milliers d'entités par vue."""
    first_zooms = [ZOOMS_BY_RESOLUTION_M[resolution][0] for resolution in sorted(ZOOMS_BY_RESOLUTION_M, reverse=True)]
    assert first_zooms == sorted(first_zooms)


def test_cells_are_at_least_2_pixels_wide_from_zoom_6():
    """
    Garde du tableau des zooms : aux zooms de carte z à z + 1, un pixel couvre au plus
    53 880 / 2^z mètres à la latitude de la France. Une maille plus petite que 2 px ne se
    distingue pas et alourdit les tuiles. Les zooms 3 à 5 font exception : ils montrent le
    pays entier, dont toutes les mailles de 5 km tiennent en 0,2 Mo.
    """
    for resolution_m, (first_zoom, _) in ZOOMS_BY_RESOLUTION_M.items():
        if first_zoom >= 6:
            assert resolution_m / (53_880 / 2**first_zoom) >= 2, f"{resolution_m} m au zoom {first_zoom}"


@pytest.mark.parametrize("option", TIPPECANOE_OPTIONS)
def test_no_option_merges_or_drops_cells(option):
    assert not option.startswith(FORBIDDEN_OPTION_PREFIXES)


@pytest.mark.parametrize("option", ["--no-feature-limit", "--no-tile-size-limit", "--no-tiny-polygon-reduction"])
def test_options_keeping_every_cell_are_set(option):
    """Sans elles, tippecanoe écarte des entités des tuiles denses : cela ne se voit que sur le pays entier."""
    assert option in TIPPECANOE_OPTIONS


def test_dag_builds_existing_dbt_models():
    """Un modèle renommé côté dbt ferait échouer le dag au premier lancement seulement."""
    model_names = {path.stem for path in (DBT_PROJECT_DIR / "models").rglob("*.sql")}
    assert set(DBT_MODELS) <= model_names


def test_tile_attributes_are_the_columns_of_the_dbt_model_without_its_identifier():
    """
    Chaque colonne écrite dans les tuiles est chargée avec chaque maille : la liste du dag
    doit suivre celle du modèle, l'identifiant en moins, écarté par tippecanoe.
    """
    assert sorted([*TILE_ATTRIBUTES, "geom"]) == sorted(
        column for column in get_model_columns() if column != EXCLUDED_ATTRIBUTE
    )
    assert EXCLUDED_ATTRIBUTE in get_model_columns()
    assert RESOLUTION_ATTRIBUTE in TILE_ATTRIBUTES
    assert f"--exclude={EXCLUDED_ATTRIBUTE}" in TIPPECANOE_OPTIONS


def test_export_sql_survives_the_shell_of_the_export_handler():
    """
    Le gestionnaire d'export place la requête entre guillemets doubles dans une commande
    shell : un nom de colonne entre guillemets y perdrait les siens, et PostgreSQL chercherait
    `region` au lieu de `REGION` (échec du premier passage du dag, le 13 novembre 2026).
    """
    sql = get_export_sql()
    assert sql == "SELECT * FROM public_for_vector_tiles.for_vector_tiles_sols_artificialises_national"
    for character in ('"', "'", "$", "`", "\\"):
        assert character not in sql


def test_dag_only_runs_when_triggered():
    """
    Le dag écrit dans l'entrepôt et sur S3, pendant plusieurs heures : il ne doit tourner que
    sur demande, pas à sa création ni à sa sortie de pause.
    """
    dag = create_sols_artificialises_national_vector_tiles()
    assert dag.timetable.can_be_scheduled is False
    assert [task.task_id for task in dag.topological_sort()] == [
        "dbt_build",
        "postgis_to_geojson",
        "geojson_to_pmtiles",
        "make_pmtiles_public",
    ]
    assert dag.get_task("dbt_build").select == DBT_MODELS


def make_cells(resolution_m: int, columns: int, rows: int) -> list[dict]:
    """Grille de mailles carrées et jointives vers 46° N, avec les attributs du modèle dbt."""
    width, height = resolution_m / 77_000, resolution_m / 111_000
    return [
        {
            "type": "Feature",
            "properties": {
                # Exporté avec les autres colonnes, écarté des tuiles par tippecanoe
                EXCLUDED_ATTRIBUTE: f"{resolution_m}m2154E{column}N{row}",
                RESOLUTION_ATTRIBUTE: resolution_m,
                "part_artif": (row * columns + column) % 101,
                "annee_min": 2021,
                "annee_max": 2022,
                # Comme l'export du dag : une valeur absente dans l'Hexagone
                "placement": None,
                "REGION": ["84"],
                "DEPART": ["63", "03"],
                "EPCI": ["246300701"] if resolution_m <= 1000 else None,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [3 + column * width, 46 + row * height],
                        [3 + (column + 1) * width, 46 + row * height],
                        [3 + (column + 1) * width, 46 + (row + 1) * height],
                        [3 + column * width, 46 + (row + 1) * height],
                        [3 + column * width, 46 + row * height],
                    ]
                ],
            },
        }
        for row in range(rows)
        for column in range(columns)
    ]


@requires_tippecanoe
def test_tippecanoe_writes_every_cell_of_a_single_resolution_per_zoom(tmp_path):
    """Passe les options du dag à tippecanoe et relit les tuiles produites, zoom par zoom."""
    # Nom de fichier quelconque : la couche doit tenir son nom des options, pas du fichier
    geojson_path = tmp_path / "export.geojson"
    pmtiles_path = tmp_path / "export.pmtiles"
    # Toutes les résolutions au même endroit : seul le filtre les départage
    cells = [cell for resolution_m in ZOOMS_BY_RESOLUTION_M for cell in make_cells(resolution_m, columns=6, rows=6)]
    # Même format que l'export du dag : une entité par ligne, précédée du séparateur RS
    geojson_path.write_text("".join(f"\x1e{json.dumps(cell)}\n" for cell in cells))

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

    expected_resolution_by_zoom = {
        zoom: resolution_m
        for resolution_m, (first_zoom, last_zoom) in ZOOMS_BY_RESOLUTION_M.items()
        for zoom in range(first_zoom, last_zoom + 1)
    }
    assert sorted(properties_by_zoom) == sorted(expected_resolution_by_zoom)
    for zoom, tile_properties in properties_by_zoom.items():
        assert {properties[RESOLUTION_ATTRIBUTE] for properties in tile_properties} == {
            expected_resolution_by_zoom[zoom]
        }, f"zoom {zoom}"
        # Aucune maille écartée : les 36 parts artificialisées de la grille sont toutes là. Une
        # maille proche d'un bord de tuile est écrite dans les deux tuiles voisines.
        assert {properties["part_artif"] for properties in tile_properties} == set(range(36)), f"zoom {zoom}"
        first = tile_properties[0]
        # Les listes de territoires sortent sérialisées, comme dans les tuiles du carroyage :
        # la carte y cherche un code entre guillemets
        assert first["REGION"] == '["84"]'
        assert first["DEPART"] == '["63","03"]'
        assert (first["annee_min"], first["annee_max"]) == (2021, 2022)
        assert "placement" not in first
        assert ("EPCI" in first) == (expected_resolution_by_zoom[zoom] <= 1000)
        # L'identifiant est exporté mais n'alourdit pas les tuiles
        assert all(EXCLUDED_ATTRIBUTE not in properties for properties in tile_properties), f"zoom {zoom}"
