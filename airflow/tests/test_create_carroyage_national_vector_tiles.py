"""
Teste le découpage par zoom des tuiles du carroyage de la carte nationale
(dag `create_carroyage_national_vector_tiles`).

Le fichier de tuiles est multi-résolution : le modèle dbt empile des carreaux de 1 km et des
blocs plus grands, et un filtre tippecanoe répartit ces résolutions entre les zooms. Deux
erreurs seraient silencieuses à la génération et ne se verraient que sur la carte : un zoom
qu'aucune résolution ne sert (carte vide) et un zoom servi par plusieurs (blocs superposés,
consommation comptée plusieurs fois à l'œil).

Le dag produit un fichier pour la consommation totale et un par destination. La carte lit
chacun sous un nom de fichier et de couche déduit de la destination : ces noms, et l'accord
entre les destinations du dag et celles des modèles dbt, sont testés ici.
"""

import json
import shutil
import subprocess

import dbt_macros
import pytest
import yaml
from dags.create_carroyage_national_vector_tiles import (
    DESTINATIONS,
    RESOLUTION_ATTRIBUTE,
    TIPPECANOE_OPTIONS,
    TOTAL_TILESET_NAME,
    ZOOMS_BY_RESOLUTION_KM,
    create_carroyage_national_vector_tiles,
    get_dbt_model_name,
    get_destination_tileset_name,
    get_geojson_key,
    get_pmtiles_key,
    get_resolution_by_zoom_filter,
    get_tileset_names,
    get_zoom_bounds,
)
from include.dbt import DBT_PROJECT_DIR

CARROYAGE_MACROS_DIR = DBT_PROJECT_DIR / "macros" / "carroyage"
MODELS_DIR = DBT_PROJECT_DIR / "models" / "for_vector_tiles"
# Propriétés du modèle de la consommation totale, et des six modèles par destination
MODEL_PROPERTIES_PATHS = [
    MODELS_DIR / "for_vector_tiles_carroyage_national.yml",
    MODELS_DIR / "for_vector_tiles_carroyage_national_destinations.yml",
]

requires_tippecanoe = pytest.mark.skipif(
    shutil.which("tippecanoe") is None or shutil.which("tippecanoe-decode") is None,
    reason="tippecanoe n'est pas installé",
)


def evaluate_dbt_list_macro(macro_name: str) -> list:
    """Évalue une macro dbt sans argument du dossier `macros/carroyage`, qui retourne une liste."""
    return dbt_macros.evaluate_dbt_list_macro(CARROYAGE_MACROS_DIR, macro_name)


def get_resolutions_of_dbt_model() -> list[int]:
    """
    Évalue la macro dbt `carroyage_national_resolutions_km`, seule définition des résolutions
    côté dbt : les modèles et leurs tests de données la lisent tous.
    """
    return evaluate_dbt_list_macro("carroyage_national_resolutions_km")


def get_destinations_of_dbt_models() -> list[str]:
    """
    Évalue la macro dbt `carroyage_national_destinations`, seule définition des destinations
    côté dbt : la macro qui lit la source et les tests de données la lisent tous.
    """
    return evaluate_dbt_list_macro("carroyage_national_destinations")


def get_properties_of_dbt_models() -> dict[str, dict]:
    return {
        model["name"]: model
        for properties_path in MODEL_PROPERTIES_PATHS
        for model in yaml.safe_load(properties_path.read_text())["models"]
    }


def test_tiles_span_zooms_3_to_8():
    assert get_zoom_bounds(ZOOMS_BY_RESOLUTION_KM) == (3, 8)


def test_zoom_without_resolution_is_rejected():
    with pytest.raises(ValueError, match="une seule résolution"):
        get_zoom_bounds({5: (3, 4), 1: (6, 8)})


def test_zoom_served_by_two_resolutions_is_rejected():
    with pytest.raises(ValueError, match="une seule résolution"):
        get_zoom_bounds({5: (3, 6), 2: (6, 6), 1: (7, 8)})


def test_empty_configuration_is_rejected():
    with pytest.raises(ValueError, match="Aucune plage"):
        get_zoom_bounds({})


def test_filter_maps_each_resolution_to_its_zoom_range():
    assert json.loads(get_resolution_by_zoom_filter({5: (3, 5), 1: (6, 8)})) == {
        "*": [
            "any",
            ["all", ["==", "resolution_km", 5], [">=", "$zoom", 3], ["<=", "$zoom", 5]],
            ["all", ["==", "resolution_km", 1], [">=", "$zoom", 6], ["<=", "$zoom", 8]],
        ]
    }


def test_dag_serves_exactly_the_resolutions_of_the_dbt_model():
    """
    Le modèle dbt et le dag listent chacun les résolutions. Une résolution du modèle absente
    du dag serait calculée pour rien ; une résolution du dag absente du modèle laisserait
    ses zooms vides, sans erreur à la génération.

    Côté dbt, deux tests de données vérifient que la table contient exactement les résolutions
    de la macro : `accepted_values` (aucune autre) et
    `carroyage_national_blocks_match_1km_cells` (aucune ne manque).
    """
    assert sorted(ZOOMS_BY_RESOLUTION_KM) == sorted(get_resolutions_of_dbt_model())


def test_filtered_attribute_is_a_column_of_each_dbt_model():
    """Le filtre du dag porte sur un attribut : s'il n'existait pas, aucune entité ne passerait."""
    properties_by_model = get_properties_of_dbt_models()
    for tileset_name in get_tileset_names():
        model = properties_by_model[get_dbt_model_name(tileset_name)]
        assert RESOLUTION_ATTRIBUTE in [column["name"] for column in model["columns"]]


def test_tilesets_are_the_total_then_one_per_destination():
    """Noms des fichiers lus par la carte : ils font partie du contrat avec le front."""
    assert get_tileset_names() == [
        "carroyage_national",
        "carroyage_national_habitat",
        "carroyage_national_activite",
        "carroyage_national_mixte",
        "carroyage_national_route",
        "carroyage_national_ferroviaire",
        "carroyage_national_inconnu",
    ]
    assert get_geojson_key("carroyage_national_habitat") == "vector_tiles/carroyage_national_habitat.geojson"
    assert get_pmtiles_key("carroyage_national_habitat") == "vector_tiles/carroyage_national_habitat.pmtiles"
    assert get_pmtiles_key(TOTAL_TILESET_NAME) == "vector_tiles/carroyage_national.pmtiles"


def test_dag_serves_exactly_the_destinations_of_the_dbt_models():
    """
    Le dag et dbt listent chacun les destinations. Une destination du dag absente de dbt
    n'aurait pas de modèle ; une destination de dbt absente du dag n'aurait pas de fichier,
    et la carte ne pourrait pas l'afficher.
    """
    assert DESTINATIONS == get_destinations_of_dbt_models()


def test_each_destination_has_a_dbt_model_reading_its_own_column():
    """
    Chaque modèle par destination appelle la macro commune avec sa destination : un modèle
    copié sans changer l'argument produirait le fichier d'une autre destination sous son nom.
    """
    properties_by_model = get_properties_of_dbt_models()
    for destination in DESTINATIONS:
        model_name = get_dbt_model_name(get_destination_tileset_name(destination))
        model_sql = (MODELS_DIR / f"{model_name}.sql").read_text()
        assert f"carroyage_national_blocs(destination='{destination}')" in model_sql
        assert model_name in properties_by_model
    total_sql = (MODELS_DIR / f"{get_dbt_model_name(TOTAL_TILESET_NAME)}.sql").read_text()
    assert "carroyage_national_blocs()" in total_sql


def test_dag_builds_the_seven_models_without_their_parents():
    dag = create_carroyage_national_vector_tiles()
    select = dag.get_task("dbt_build").select
    assert select == [get_dbt_model_name(tileset_name) for tileset_name in get_tileset_names()]
    # Un « + » ferait reconstruire les parents, dont le carroyage complet des diagnostics
    assert not any("+" in selector for selector in select)


def test_dag_publishes_each_tileset_after_dbt():
    """Les tâches du total gardent leur nom, celles d'une destination sont dans son groupe."""
    dag = create_carroyage_national_vector_tiles()
    chain = ["postgis_to_geojson", "geojson_to_pmtiles", "make_pmtiles_public"]
    expected_task_ids = {
        "dbt_build",
        *chain,
        *(f"{destination}.{step}" for destination in DESTINATIONS for step in chain),
    }
    assert set(dag.task_ids) == expected_task_ids
    for prefix in ["", *(f"{destination}." for destination in DESTINATIONS)]:
        upstream_task_id = "dbt_build"
        for step in chain:
            assert dag.get_task(f"{prefix}{step}").upstream_task_ids == {upstream_task_id}
            upstream_task_id = f"{prefix}{step}"


@requires_tippecanoe
@pytest.mark.parametrize("tileset_name", get_tileset_names())
def test_tippecanoe_writes_a_single_resolution_per_zoom(tmp_path, tileset_name):
    """
    Passe les options du dag à tippecanoe et relit les tuiles produites, zoom par zoom, pour
    le fichier de la consommation totale et pour celui de chaque destination.
    """
    # Mêmes noms de fichiers que le dag : tippecanoe en tire le nom de la couche
    geojson_path = tmp_path / get_geojson_key(tileset_name).split("/")[-1]
    pmtiles_path = tmp_path / get_pmtiles_key(tileset_name).split("/")[-1]
    # Une entité par résolution, toutes au même endroit : seul le filtre les départage
    square = [[[2.35, 48.85], [2.36, 48.85], [2.36, 48.86], [2.35, 48.86], [2.35, 48.85]]]
    features = [
        {
            "type": "Feature",
            "properties": {
                "idcarreau": f"{resolution_km}kmN2889E3760",
                RESOLUTION_ATTRIBUTE: resolution_km,
                "conso_2020": 1200,
                "REGION": ["11"],
            },
            "geometry": {"type": "Polygon", "coordinates": square},
        }
        for resolution_km in ZOOMS_BY_RESOLUTION_KM
    ]
    geojson_path.write_text(json.dumps({"type": "FeatureCollection", "features": features}))

    subprocess.run(["tippecanoe", "-o", str(pmtiles_path), str(geojson_path), *TIPPECANOE_OPTIONS], check=True)
    decoded = json.loads(
        subprocess.run(["tippecanoe-decode", str(pmtiles_path)], check=True, capture_output=True).stdout
    )

    properties_by_zoom: dict[int, list[dict]] = {}
    for tile in decoded["features"]:
        for layer in tile["features"]:
            # La couche porte le nom du fichier sans son extension : la carte la lit sous ce nom
            assert layer["properties"]["layer"] == tileset_name
            properties_by_zoom.setdefault(tile["properties"]["zoom"], []).extend(
                feature["properties"] for feature in layer["features"]
            )

    expected_resolution_by_zoom = {
        zoom: resolution_km
        for resolution_km, (first_zoom, last_zoom) in ZOOMS_BY_RESOLUTION_KM.items()
        for zoom in range(first_zoom, last_zoom + 1)
    }
    # Des ensembles : une entité proche d'un bord de tuile est écrite dans les deux tuiles voisines
    assert {
        zoom: {properties[RESOLUTION_ATTRIBUTE] for properties in tile_properties}
        for zoom, tile_properties in properties_by_zoom.items()
    } == {zoom: {resolution_km} for zoom, resolution_km in expected_resolution_by_zoom.items()}
    # Les attributs lus par la carte sont conservés, l'identifiant est retiré
    for tile_properties in properties_by_zoom.values():
        assert tile_properties[0]["conso_2020"] == 1200
        assert tile_properties[0]["REGION"] == '["11"]'
        assert "idcarreau" not in tile_properties[0]
