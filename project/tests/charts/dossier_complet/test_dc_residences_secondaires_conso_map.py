# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_residences_secondaires_conso_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_residences_secondaires_conso_map/EPCI/200046977",
        {"child_land_type": "COMM"},
    )
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {
                        "position": "absolute",
                        "backgroundColor": "#ffffff",
                        "textAlign": "center",
                        "textAlignLast": "center",
                        "fontSize": "0.85em",
                        "padding": "15px",
                    }
                },
                "legend": {"enabled": False},
                "chart": {
                    "map": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Albigny-sur-Saône", "land_id": "69003"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Bron", "land_id": "69029"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Cailloux-sur-Fontaines", "land_id": "69033"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Caluire-et-Cuire", "land_id": "69034"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Champagne-au-Mont-d'Or", "land_id": "69040"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Charbonnières-les-Bains", "land_id": "69044"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Charly", "land_id": "69046"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Collonges-au-Mont-d'Or", "land_id": "69063"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Couzon-au-Mont-d'Or", "land_id": "69068"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Craponne", "land_id": "69069"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Curis-au-Mont-d'Or", "land_id": "69071"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Dardilly", "land_id": "69072"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Écully", "land_id": "69081"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Fleurieu-sur-Saône", "land_id": "69085"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Fontaines-Saint-Martin", "land_id": "69087"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Fontaines-sur-Saône", "land_id": "69088"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Francheville", "land_id": "69089"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Givors", "land_id": "69091"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Grigny", "land_id": "69096"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Irigny", "land_id": "69100"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Limonest", "land_id": "69116"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Lissieu", "land_id": "69117"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Lyon", "land_id": "69123"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Marcy-l'Étoile", "land_id": "69127"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "La Mulatière", "land_id": "69142"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Neuville-sur-Saône", "land_id": "69143"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Oullins-Pierre-Bénite", "land_id": "69149"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Poleymieux-au-Mont-d'Or", "land_id": "69153"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Quincieux", "land_id": "69163"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Rochetaillée-sur-Saône", "land_id": "69168"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Cyr-au-Mont-d'Or", "land_id": "69191"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Didier-au-Mont-d'Or", "land_id": "69194"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Fons", "land_id": "69199"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Sainte-Foy-lès-Lyon", "land_id": "69202"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Genis-Laval", "land_id": "69204"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Genis-les-Ollières", "land_id": "69205"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Germain-au-Mont-d'Or", "land_id": "69207"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Romain-au-Mont-d'Or", "land_id": "69233"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Tassin-la-Demi-Lune", "land_id": "69244"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "La Tour-de-Salvagny", "land_id": "69250"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Vaulx-en-Velin", "land_id": "69256"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Vénissieux", "land_id": "69259"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Vernaison", "land_id": "69260"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Villeurbanne", "land_id": "69266"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Chassieu", "land_id": "69271"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Corbas", "land_id": "69273"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Décines-Charpieu", "land_id": "69275"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Feyzin", "land_id": "69276"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Genay", "land_id": "69278"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Jonage", "land_id": "69279"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Meyzieu", "land_id": "69282"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Mions", "land_id": "69283"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Montanay", "land_id": "69284"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Rillieux-la-Pape", "land_id": "69286"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Priest", "land_id": "69290"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Sathonay-Camp", "land_id": "69292"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Sathonay-Village", "land_id": "69293"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [540000.0, 5730000.0],
                                            [540000.0, 5731000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Solaize", "land_id": "69296"},
                            },
                        ],
                    }
                },
                "title": {
                    "text": "Rythmes annuels de consommation et taux de résidences secondaires des communes - Métropole de Lyon (2011-2022)"
                },
                "subtitle": {
                    "text": "Croisement entre le taux de résidences secondaires (INSEE) et la consommation d'espaces NAF (fichiers fonciers)."
                },
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "custom": {
                    "conso_t1": 0.0087,
                    "conso_t2": 0.0287,
                    "indic_t1": 3.84,
                    "indic_t2": 13.03,
                    "conso_min": 0.0,
                    "conso_max": 0.2519,
                    "indic_min": 0.16,
                    "indic_max": 9.01,
                    "conso_label": "Consommation annuelle pour l'habitat",
                    "indicator_name": "Taux de résidences secondaires",
                    "indicator_short": "taux résidences secondaires",
                    "indicator_unit": "%",
                    "indicator_gender": "m",
                    "verdicts": [
                        [
                            "Consommation et taux de résidences secondaires dans la moyenne du territoire.",
                            "Consommation modérée avec un fort taux de résidences secondaires : le tourisme résidentiel contribue à la consommation.",
                            "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                        ],
                        [
                            "Forte consommation avec un taux modéré de résidences secondaires.",
                            "Forte consommation et fort taux de résidences secondaires : le tourisme résidentiel est un moteur de l'étalement.",
                            "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                        ],
                        [
                            "Peu de consommation avec un taux modéré de résidences secondaires.",
                            "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                            "Peu de consommation malgré un fort taux de résidences secondaires : pression touristique contenue.",
                        ],
                    ],
                    "colors": [
                        ["#d94701", "#eb8d4f", "#fdd49e"],
                        ["#e34a33", "#f08b5e", "#fdcc8a"],
                        ["#eb8945", "#ed8c56", "#f08f68"],
                    ],
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {
                    "dataClasses": [
                        {
                            "from": 2,
                            "to": 2,
                            "color": "#d94701",
                            "name": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus élevées",
                        },
                        {
                            "from": 6,
                            "to": 6,
                            "color": "#e34a33",
                            "name": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        },
                        {
                            "from": 5,
                            "to": 5,
                            "color": "#eb8945",
                            "name": "Consommation intermédiaire, taux résidences secondaires parmi les plus élevées",
                        },
                        {
                            "from": 1,
                            "to": 1,
                            "color": "#eb8d4f",
                            "name": "Consommation parmi les plus faibles, taux résidences secondaires intermédiaire",
                        },
                        {
                            "from": 4,
                            "to": 4,
                            "color": "#ed8c56",
                            "name": "Consommation intermédiaire, taux résidences secondaires intermédiaire",
                        },
                        {
                            "from": 7,
                            "to": 7,
                            "color": "#f08b5e",
                            "name": "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                        },
                        {
                            "from": 3,
                            "to": 3,
                            "color": "#f08f68",
                            "name": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                        },
                        {
                            "from": 8,
                            "to": 8,
                            "color": "#fdcc8a",
                            "name": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus élevées",
                        },
                        {
                            "from": 0,
                            "to": 0,
                            "color": "#fdd49e",
                            "name": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                        },
                    ]
                },
                "series": [
                    {
                        "name": "Territoires",
                        "data": [
                            {
                                "land_id": "69199",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 0.7362,
                                "category_id": 0,
                                "color": "#fdd49e",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "0.7%",
                            },
                            {
                                "land_id": "69266",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.000771,
                                "indic_val": 3.5013,
                                "category_id": 0,
                                "color": "#fdd49e",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "3.5%",
                            },
                            {
                                "land_id": "69142",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.003113,
                                "indic_val": 1.779,
                                "category_id": 0,
                                "color": "#fdd49e",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "1.8%",
                            },
                            {
                                "land_id": "69029",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.007206,
                                "indic_val": 1.5631,
                                "category_id": 0,
                                "color": "#fdd49e",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "1.6%",
                            },
                            {
                                "land_id": "69256",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.008135,
                                "indic_val": 0.6966,
                                "category_id": 0,
                                "color": "#fdd49e",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "0.7%",
                            },
                            {
                                "land_id": "69123",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.007096,
                                "indic_val": 5.8218,
                                "category_id": 1,
                                "color": "#eb8d4f",
                                "category_label": "Consommation parmi les plus faibles, taux résidences secondaires intermédiaire",
                                "verdict": "Peu de consommation avec un taux modéré de résidences secondaires.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "5.8%",
                            },
                            {
                                "land_id": "69292",
                                "land_type": "COMM",
                                "conso_ha": 0.02,
                                "conso_pct": 0.011084,
                                "indic_val": 0.8389,
                                "category_id": 3,
                                "color": "#f08f68",
                                "category_label": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                                "conso_fmt": "0.02",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69276",
                                "land_type": "COMM",
                                "conso_ha": 0.13,
                                "conso_pct": 0.01205,
                                "indic_val": 0.4769,
                                "category_id": 3,
                                "color": "#f08f68",
                                "category_label": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                                "conso_fmt": "0.13",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "0.5%",
                            },
                            {
                                "land_id": "69259",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.010867,
                                "indic_val": 1.2102,
                                "category_id": 3,
                                "color": "#f08f68",
                                "category_label": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "1.2%",
                            },
                            {
                                "land_id": "69271",
                                "land_type": "COMM",
                                "conso_ha": 0.22,
                                "conso_pct": 0.019406,
                                "indic_val": 0.5248,
                                "category_id": 3,
                                "color": "#f08f68",
                                "category_label": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                                "conso_fmt": "0.22",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "0.5%",
                            },
                            {
                                "land_id": "69273",
                                "land_type": "COMM",
                                "conso_ha": 0.24,
                                "conso_pct": 0.020199,
                                "indic_val": 0.9649,
                                "category_id": 3,
                                "color": "#f08f68",
                                "category_label": "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
                                "conso_fmt": "0.24",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "1.0%",
                            },
                            {
                                "land_id": "69068",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.043447,
                                "indic_val": 1.8871,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "1.9%",
                            },
                            {
                                "land_id": "69071",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.046836,
                                "indic_val": 1.4141,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "1.4%",
                            },
                            {
                                "land_id": "69040",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.053845,
                                "indic_val": 1.8197,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "1.8%",
                            },
                            {
                                "land_id": "69168",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.120806,
                                "indic_val": 1.0885,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69143",
                                "land_type": "COMM",
                                "conso_ha": 0.21,
                                "conso_pct": 0.038031,
                                "indic_val": 1.1462,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.21",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69233",
                                "land_type": "COMM",
                                "conso_ha": 0.23,
                                "conso_pct": 0.090067,
                                "indic_val": 1.1474,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.23",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69149",
                                "land_type": "COMM",
                                "conso_ha": 0.31,
                                "conso_pct": 0.035263,
                                "indic_val": 1.636,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.31",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "1.6%",
                            },
                            {
                                "land_id": "69296",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.041548,
                                "indic_val": 0.5356,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "0.5%",
                            },
                            {
                                "land_id": "69085",
                                "land_type": "COMM",
                                "conso_ha": 0.35,
                                "conso_pct": 0.120305,
                                "indic_val": 0.9991,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.35",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "1.0%",
                            },
                            {
                                "land_id": "69081",
                                "land_type": "COMM",
                                "conso_ha": 0.36,
                                "conso_pct": 0.042662,
                                "indic_val": 3.1192,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.36",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "3.1%",
                            },
                            {
                                "land_id": "69293",
                                "land_type": "COMM",
                                "conso_ha": 0.41,
                                "conso_pct": 0.0808,
                                "indic_val": 1.1376,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.41",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69286",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.0309,
                                "indic_val": 0.5955,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "0.6%",
                            },
                            {
                                "land_id": "69260",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.107588,
                                "indic_val": 0.8502,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "0.9%",
                            },
                            {
                                "land_id": "69153",
                                "land_type": "COMM",
                                "conso_ha": 0.49,
                                "conso_pct": 0.077053,
                                "indic_val": 3.0772,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.49",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "3.1%",
                            },
                            {
                                "land_id": "69207",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.102054,
                                "indic_val": 0.7645,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69088",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.233953,
                                "indic_val": 0.8222,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69063",
                                "land_type": "COMM",
                                "conso_ha": 0.58,
                                "conso_pct": 0.153458,
                                "indic_val": 1.4327,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.58",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "1.4%",
                            },
                            {
                                "land_id": "69003",
                                "land_type": "COMM",
                                "conso_ha": 0.59,
                                "conso_pct": 0.225222,
                                "indic_val": 1.8839,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.59",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "1.9%",
                            },
                            {
                                "land_id": "69034",
                                "land_type": "COMM",
                                "conso_ha": 0.61,
                                "conso_pct": 0.058751,
                                "indic_val": 2.0233,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.61",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "2.0%",
                            },
                            {
                                "land_id": "69205",
                                "land_type": "COMM",
                                "conso_ha": 0.63,
                                "conso_pct": 0.167218,
                                "indic_val": 1.0749,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.63",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69089",
                                "land_type": "COMM",
                                "conso_ha": 0.68,
                                "conso_pct": 0.082034,
                                "indic_val": 1.1192,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.68",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69087",
                                "land_type": "COMM",
                                "conso_ha": 0.69,
                                "conso_pct": 0.251918,
                                "indic_val": 1.0891,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.69",
                                "conso_pct_fmt": "0.25",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69044",
                                "land_type": "COMM",
                                "conso_ha": 0.72,
                                "conso_pct": 0.176397,
                                "indic_val": 1.8004,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.72",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "1.8%",
                            },
                            {
                                "land_id": "69275",
                                "land_type": "COMM",
                                "conso_ha": 0.73,
                                "conso_pct": 0.042558,
                                "indic_val": 0.8099,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.73",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69282",
                                "land_type": "COMM",
                                "conso_ha": 0.76,
                                "conso_pct": 0.032571,
                                "indic_val": 1.453,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.76",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "1.5%",
                            },
                            {
                                "land_id": "69279",
                                "land_type": "COMM",
                                "conso_ha": 0.77,
                                "conso_pct": 0.063677,
                                "indic_val": 1.2825,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.77",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "1.3%",
                            },
                            {
                                "land_id": "69244",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.097279,
                                "indic_val": 2.9707,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "3.0%",
                            },
                            {
                                "land_id": "69096",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.13262,
                                "indic_val": 0.7622,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69204",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.061326,
                                "indic_val": 1.4252,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "1.4%",
                            },
                            {
                                "land_id": "69100",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.089056,
                                "indic_val": 1.2147,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "1.2%",
                            },
                            {
                                "land_id": "69033",
                                "land_type": "COMM",
                                "conso_ha": 0.83,
                                "conso_pct": 0.097941,
                                "indic_val": 0.8794,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.83",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "0.9%",
                            },
                            {
                                "land_id": "69283",
                                "land_type": "COMM",
                                "conso_ha": 0.94,
                                "conso_pct": 0.081019,
                                "indic_val": 0.3857,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "0.94",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "0.4%",
                            },
                            {
                                "land_id": "69069",
                                "land_type": "COMM",
                                "conso_ha": 1.07,
                                "conso_pct": 0.22693,
                                "indic_val": 0.8515,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.07",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "0.9%",
                            },
                            {
                                "land_id": "69163",
                                "land_type": "COMM",
                                "conso_ha": 1.14,
                                "conso_pct": 0.063403,
                                "indic_val": 1.38,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.14",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "1.4%",
                            },
                            {
                                "land_id": "69250",
                                "land_type": "COMM",
                                "conso_ha": 1.15,
                                "conso_pct": 0.136667,
                                "indic_val": 2.2811,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.15",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "2.3%",
                            },
                            {
                                "land_id": "69202",
                                "land_type": "COMM",
                                "conso_ha": 1.18,
                                "conso_pct": 0.172738,
                                "indic_val": 1.6242,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.18",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "1.6%",
                            },
                            {
                                "land_id": "69046",
                                "land_type": "COMM",
                                "conso_ha": 1.22,
                                "conso_pct": 0.237179,
                                "indic_val": 1.0616,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.22",
                                "conso_pct_fmt": "0.24",
                                "indic_fmt": "1.1%",
                            },
                            {
                                "land_id": "69091",
                                "land_type": "COMM",
                                "conso_ha": 1.25,
                                "conso_pct": 0.071711,
                                "indic_val": 0.9529,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.25",
                                "conso_pct_fmt": "0.07",
                                "indic_fmt": "1.0%",
                            },
                            {
                                "land_id": "69284",
                                "land_type": "COMM",
                                "conso_ha": 1.31,
                                "conso_pct": 0.180027,
                                "indic_val": 0.1577,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.31",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "0.2%",
                            },
                            {
                                "land_id": "69278",
                                "land_type": "COMM",
                                "conso_ha": 1.44,
                                "conso_pct": 0.166917,
                                "indic_val": 0.8493,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.44",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "0.8%",
                            },
                            {
                                "land_id": "69290",
                                "land_type": "COMM",
                                "conso_ha": 1.56,
                                "conso_pct": 0.052492,
                                "indic_val": 1.4742,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.56",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "1.5%",
                            },
                            {
                                "land_id": "69194",
                                "land_type": "COMM",
                                "conso_ha": 1.82,
                                "conso_pct": 0.218163,
                                "indic_val": 2.8508,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "1.82",
                                "conso_pct_fmt": "0.22",
                                "indic_fmt": "2.9%",
                            },
                            {
                                "land_id": "69116",
                                "land_type": "COMM",
                                "conso_ha": 2.11,
                                "conso_pct": 0.232648,
                                "indic_val": 2.4811,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                                "verdict": "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
                                "conso_fmt": "2.11",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "2.5%",
                            },
                            {
                                "land_id": "69127",
                                "land_type": "COMM",
                                "conso_ha": 0.43,
                                "conso_pct": 0.079458,
                                "indic_val": 9.0142,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                                "verdict": "Forte consommation avec un taux modéré de résidences secondaires.",
                                "conso_fmt": "0.43",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "9.0%",
                            },
                            {
                                "land_id": "69117",
                                "land_type": "COMM",
                                "conso_ha": 0.48,
                                "conso_pct": 0.084038,
                                "indic_val": 8.1302,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                                "verdict": "Forte consommation avec un taux modéré de résidences secondaires.",
                                "conso_fmt": "0.48",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "8.1%",
                            },
                            {
                                "land_id": "69191",
                                "land_type": "COMM",
                                "conso_ha": 0.87,
                                "conso_pct": 0.119341,
                                "indic_val": 5.5892,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                                "verdict": "Forte consommation avec un taux modéré de résidences secondaires.",
                                "conso_fmt": "0.87",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "5.6%",
                            },
                            {
                                "land_id": "69072",
                                "land_type": "COMM",
                                "conso_ha": 1.19,
                                "conso_pct": 0.084999,
                                "indic_val": 5.144,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                                "verdict": "Forte consommation avec un taux modéré de résidences secondaires.",
                                "conso_fmt": "1.19",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "5.1%",
                            },
                        ],
                        "joinBy": ["land_id"],
                        "colorKey": "category_id",
                        "opacity": 1,
                        "borderColor": "#999999",
                        "borderWidth": 1,
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "headerFormat": "",
                            "pointFormat": "<b>{point.name}</b><br/>Taux de résidences secondaires : <b>{point.indic_fmt}</b><br/>Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>",
                        },
                    }
                ],
                "navigation": {"buttonOptions": {"enabled": False}},
                "responsive": {
                    "rules": [
                        {
                            "condition": {"maxWidth": 600},
                            "chartOptions": {
                                "legend": {"align": "center", "verticalAlign": "bottom", "layout": "horizontal"}
                            },
                        }
                    ]
                },
                "exporting": {
                    "filename": "Rythmes annuels de consommation et taux de résidences secondaires des communes - Métropole de Lyon (2011-2022)",
                    "url": "https://highcharts-export.osc-fr1.scalingo.io",
                    "chartOptions": {"chart": {"style": {"fontSize": "8px"}}},
                },
                "colors": [
                    "#4e9c79",
                    "#6a6af4",
                    "#6b8abc",
                    "#86cdf2",
                    "#8ecac7",
                    "#91e8e1",
                    "#bce3f9",
                    "#c9e7c9",
                    "#cab8ee",
                    "#eeb088",
                    "#f5d3b5",
                    "#fd8970",
                ],
            },
            "data_table": {
                "headers": [
                    "Catégorie",
                    "Commune",
                    "Consommation annuelle pour l'habitat 2011-2022 (%/an)",
                    "taux résidences secondaires (%/an)",
                ],
                "boldFirstColumn": True,
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "0.00%",
                            "0.7%",
                            "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                            "Saint-Fons",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.00%",
                            "1.8%",
                            "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                            "La Mulatière",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.00%",
                            "3.5%",
                            "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                            "Villeurbanne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "0.5%",
                            "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                            "Feyzin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "0.7%",
                            "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                            "Vaulx-en-Velin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "0.8%",
                            "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                            "Sathonay-Camp",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "1.2%",
                            "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                            "Vénissieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "1.6%",
                            "Bron",
                            "Consommation parmi les plus faibles, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.01%",
                            "5.8%",
                            "Consommation parmi les plus faibles, taux résidences secondaires intermédiaire",
                            "Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.02%",
                            "0.5%",
                            "Chassieu",
                            "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.02%",
                            "1.0%",
                            "Consommation intermédiaire, taux résidences secondaires parmi les plus faibles",
                            "Corbas",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.03%",
                            "0.6%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Rillieux-la-Pape",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.03%",
                            "1.5%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Meyzieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "0.5%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Solaize",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "0.8%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Décines-Charpieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Neuville-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "1.6%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Oullins-Pierre-Bénite",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "1.9%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Couzon-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.04%",
                            "3.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Écully",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.05%",
                            "1.4%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Curis-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.05%",
                            "1.5%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Priest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.05%",
                            "1.8%",
                            "Champagne-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.06%",
                            "1.3%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Jonage",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.06%",
                            "1.4%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Quincieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.06%",
                            "1.4%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Genis-Laval",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.06%",
                            "2.0%",
                            "Caluire-et-Cuire",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.07%",
                            "1.0%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Givors",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "0.4%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Mions",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Francheville",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Sathonay-Village",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "3.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Poleymieux-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "5.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                            "Dardilly",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "8.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                            "Lissieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.08%",
                            "9.0%",
                            "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                            "Marcy-l'Étoile",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.09%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Romain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.09%",
                            "1.2%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Irigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.10%",
                            "0.8%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Germain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.10%",
                            "0.9%",
                            "Cailloux-sur-Fontaines",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.10%",
                            "3.0%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Tassin-la-Demi-Lune",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.11%",
                            "0.9%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Vernaison",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.12%",
                            "1.0%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Fleurieu-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.12%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Rochetaillée-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.12%",
                            "5.6%",
                            "Consommation parmi les plus élevées, taux résidences secondaires intermédiaire",
                            "Saint-Cyr-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.13%",
                            "0.8%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Grigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.14%",
                            "2.3%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "La Tour-de-Salvagny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.15%",
                            "1.4%",
                            "Collonges-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.17%",
                            "0.8%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Genay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.17%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Genis-les-Ollières",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.17%",
                            "1.6%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Sainte-Foy-lès-Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.18%",
                            "0.2%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Montanay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.18%",
                            "1.8%",
                            "Charbonnières-les-Bains",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.22%",
                            "2.9%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Saint-Didier-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.23%",
                            "0.8%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Fontaines-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.23%",
                            "0.9%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Craponne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.23%",
                            "1.9%",
                            "Albigny-sur-Saône",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.23%",
                            "2.5%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Limonest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.24%",
                            "1.1%",
                            "Charly",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "0.25%",
                            "1.1%",
                            "Consommation parmi les plus élevées, taux résidences secondaires parmi les plus faibles",
                            "Fontaines-Saint-Martin",
                        ],
                    },
                ],
            },
        }
    )
