# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_population_conso_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_population_conso_map/EPCI/200046977",
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
                    "text": "Rythmes annuels de consommation et évolution de la population des communes - Métropole de Lyon (2011-2022)"
                },
                "subtitle": {
                    "text": "Croisement entre évolution de la population et la consommation annuelle totale NAF"
                },
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "custom": {
                    "conso_t1": 0.0121,
                    "conso_t2": 0.0408,
                    "indic_t1": -0.3,
                    "indic_t2": 0.56,
                    "conso_min": 0.0031,
                    "conso_max": 0.4108,
                    "indic_min": -0.04,
                    "indic_max": 6.0,
                    "conso_label": "Consommation annuelle totale",
                    "indicator_name": "Évolution de la population",
                    "indicator_short": "évolution annuelle population",
                    "indicator_unit": "%",
                    "indicator_gender": "f",
                    "verdicts": [
                        [
                            "Situation contrastée : consommation modérée mais faible dynamique démographique.",
                            "Situation intermédiaire : consommation et dynamique démographique dans la moyenne du territoire.",
                            "Situation plutôt favorable : bonne dynamique démographique pour une consommation modérée.",
                        ],
                        [
                            "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                            "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                            "Situation la plus défavorable : forte consommation d'espaces sans dynamique démographique pour la justifier.",
                        ],
                        [
                            "Situation favorable : peu de consommation d'espaces malgré une dynamique démographique modérée.",
                            "Situation idéale : croissance démographique soutenue avec très peu de consommation d'espaces.",
                            "Situation très favorable : peu de consommation d'espaces avec une croissance démographique correcte.",
                        ],
                    ],
                    "colors": [
                        ["#006d2c", "#3a9851", "#74c476"],
                        ["#7e9c5b", "#949157", "#ab8754"],
                        ["#e34a33", "#f08b5e", "#fdcc8a"],
                    ],
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {
                    "dataClasses": [
                        {
                            "from": 2,
                            "to": 2,
                            "color": "#006d2c",
                            "name": "Consommation parmi les plus faibles, évolution annuelle population parmi les plus élevées",
                        },
                        {
                            "from": 1,
                            "to": 1,
                            "color": "#3a9851",
                            "name": "Consommation parmi les plus faibles, évolution annuelle population intermédiaire",
                        },
                        {
                            "from": 0,
                            "to": 0,
                            "color": "#74c476",
                            "name": "Consommation parmi les plus faibles, évolution annuelle population parmi les plus faibles",
                        },
                        {
                            "from": 5,
                            "to": 5,
                            "color": "#7e9c5b",
                            "name": "Consommation intermédiaire, évolution annuelle population parmi les plus élevées",
                        },
                        {
                            "from": 4,
                            "to": 4,
                            "color": "#949157",
                            "name": "Consommation intermédiaire, évolution annuelle population intermédiaire",
                        },
                        {
                            "from": 3,
                            "to": 3,
                            "color": "#ab8754",
                            "name": "Consommation intermédiaire, évolution annuelle population parmi les plus faibles",
                        },
                        {
                            "from": 6,
                            "to": 6,
                            "color": "#e34a33",
                            "name": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus faibles",
                        },
                        {
                            "from": 7,
                            "to": 7,
                            "color": "#f08b5e",
                            "name": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                        },
                        {
                            "from": 8,
                            "to": 8,
                            "color": "#fdcc8a",
                            "name": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        },
                    ]
                },
                "series": [
                    {
                        "name": "Territoires",
                        "data": [
                            {
                                "land_id": "69142",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.003113,
                                "indic_val": -0.0028,
                                "category_id": 1,
                                "color": "#3a9851",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle population intermédiaire",
                                "verdict": "Situation très favorable : peu de consommation d'espaces avec une croissance démographique correcte.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "-0.0%",
                            },
                            {
                                "land_id": "69199",
                                "land_type": "COMM",
                                "conso_ha": 0.06,
                                "conso_pct": 0.010075,
                                "indic_val": 1.3435,
                                "category_id": 2,
                                "color": "#006d2c",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation idéale : croissance démographique soutenue avec très peu de consommation d'espaces.",
                                "conso_fmt": "0.06",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69266",
                                "land_type": "COMM",
                                "conso_ha": 0.13,
                                "conso_pct": 0.009061,
                                "indic_val": 1.0764,
                                "category_id": 2,
                                "color": "#006d2c",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation idéale : croissance démographique soutenue avec très peu de consommation d'espaces.",
                                "conso_fmt": "0.13",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69123",
                                "land_type": "COMM",
                                "conso_ha": 0.68,
                                "conso_pct": 0.014173,
                                "indic_val": 0.546,
                                "category_id": 4,
                                "color": "#949157",
                                "category_label": "Consommation intermédiaire, évolution annuelle population intermédiaire",
                                "verdict": "Situation intermédiaire : consommation et dynamique démographique dans la moyenne du territoire.",
                                "conso_fmt": "0.68",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69256",
                                "land_type": "COMM",
                                "conso_ha": 0.54,
                                "conso_pct": 0.025914,
                                "indic_val": 2.0686,
                                "category_id": 5,
                                "color": "#7e9c5b",
                                "category_label": "Consommation intermédiaire, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation plutôt favorable : bonne dynamique démographique pour une consommation modérée.",
                                "conso_fmt": "0.54",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69068",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.045858,
                                "indic_val": -0.0356,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "-0.0%",
                            },
                            {
                                "land_id": "69071",
                                "land_type": "COMM",
                                "conso_ha": 0.15,
                                "conso_pct": 0.04829,
                                "indic_val": 0.5443,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.15",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69168",
                                "land_type": "COMM",
                                "conso_ha": 0.18,
                                "conso_pct": 0.133012,
                                "indic_val": 0.0651,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.18",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69117",
                                "land_type": "COMM",
                                "conso_ha": 0.7,
                                "conso_pct": 0.122803,
                                "indic_val": 0.4294,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.70",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.4%",
                            },
                            {
                                "land_id": "69081",
                                "land_type": "COMM",
                                "conso_ha": 0.74,
                                "conso_pct": 0.086815,
                                "indic_val": 0.084,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.74",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69087",
                                "land_type": "COMM",
                                "conso_ha": 0.81,
                                "conso_pct": 0.297766,
                                "indic_val": 0.2308,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "0.81",
                                "conso_pct_fmt": "0.30",
                                "indic_fmt": "+0.2%",
                            },
                            {
                                "land_id": "69204",
                                "land_type": "COMM",
                                "conso_ha": 1.11,
                                "conso_pct": 0.086445,
                                "indic_val": 0.2885,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.11",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69276",
                                "land_type": "COMM",
                                "conso_ha": 1.24,
                                "conso_pct": 0.119102,
                                "indic_val": 0.3838,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.24",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.4%",
                            },
                            {
                                "land_id": "69286",
                                "land_type": "COMM",
                                "conso_ha": 1.37,
                                "conso_pct": 0.094393,
                                "indic_val": 0.459,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.37",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69046",
                                "land_type": "COMM",
                                "conso_ha": 1.43,
                                "conso_pct": 0.277621,
                                "indic_val": 0.3834,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.43",
                                "conso_pct_fmt": "0.28",
                                "indic_fmt": "+0.4%",
                            },
                            {
                                "land_id": "69202",
                                "land_type": "COMM",
                                "conso_ha": 1.51,
                                "conso_pct": 0.221427,
                                "indic_val": 0.1297,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.51",
                                "conso_pct_fmt": "0.22",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69127",
                                "land_type": "COMM",
                                "conso_ha": 1.67,
                                "conso_pct": 0.310907,
                                "indic_val": 0.4553,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.67",
                                "conso_pct_fmt": "0.31",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69034",
                                "land_type": "COMM",
                                "conso_ha": 1.73,
                                "conso_pct": 0.166262,
                                "indic_val": 0.4664,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "1.73",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69273",
                                "land_type": "COMM",
                                "conso_ha": 4.56,
                                "conso_pct": 0.384706,
                                "indic_val": 0.4922,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "4.56",
                                "conso_pct_fmt": "0.38",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69279",
                                "land_type": "COMM",
                                "conso_ha": 4.96,
                                "conso_pct": 0.410805,
                                "indic_val": 0.5425,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                                "verdict": "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
                                "conso_fmt": "4.96",
                                "conso_pct_fmt": "0.41",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69292",
                                "land_type": "COMM",
                                "conso_ha": 0.19,
                                "conso_pct": 0.098515,
                                "indic_val": 5.9977,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.19",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+6.0%",
                            },
                            {
                                "land_id": "69233",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.130923,
                                "indic_val": 1.5926,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69296",
                                "land_type": "COMM",
                                "conso_ha": 0.43,
                                "conso_pct": 0.0529,
                                "indic_val": 1.0783,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.43",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69040",
                                "land_type": "COMM",
                                "conso_ha": 0.48,
                                "conso_pct": 0.188631,
                                "indic_val": 1.6879,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.48",
                                "conso_pct_fmt": "0.19",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69085",
                                "land_type": "COMM",
                                "conso_ha": 0.52,
                                "conso_pct": 0.175201,
                                "indic_val": 1.2406,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.52",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69149",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.062532,
                                "indic_val": 0.6857,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69088",
                                "land_type": "COMM",
                                "conso_ha": 0.58,
                                "conso_pct": 0.249081,
                                "indic_val": 1.027,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.58",
                                "conso_pct_fmt": "0.25",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69260",
                                "land_type": "COMM",
                                "conso_ha": 0.63,
                                "conso_pct": 0.149829,
                                "indic_val": 1.3706,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.63",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69293",
                                "land_type": "COMM",
                                "conso_ha": 0.66,
                                "conso_pct": 0.128488,
                                "indic_val": 0.8646,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.66",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69207",
                                "land_type": "COMM",
                                "conso_ha": 0.68,
                                "conso_pct": 0.124326,
                                "indic_val": 0.9088,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.68",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69063",
                                "land_type": "COMM",
                                "conso_ha": 0.69,
                                "conso_pct": 0.182858,
                                "indic_val": 1.9177,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.69",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69003",
                                "land_type": "COMM",
                                "conso_ha": 0.71,
                                "conso_pct": 0.272038,
                                "indic_val": 0.8513,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.71",
                                "conso_pct_fmt": "0.27",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69153",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.122799,
                                "indic_val": 0.7329,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69044",
                                "land_type": "COMM",
                                "conso_ha": 0.88,
                                "conso_pct": 0.214254,
                                "indic_val": 0.9315,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.88",
                                "conso_pct_fmt": "0.21",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69205",
                                "land_type": "COMM",
                                "conso_ha": 0.93,
                                "conso_pct": 0.247585,
                                "indic_val": 1.5171,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "0.93",
                                "conso_pct_fmt": "0.25",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69143",
                                "land_type": "COMM",
                                "conso_ha": 1.01,
                                "conso_pct": 0.185788,
                                "indic_val": 0.7228,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.01",
                                "conso_pct_fmt": "0.19",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69096",
                                "land_type": "COMM",
                                "conso_ha": 1.1,
                                "conso_pct": 0.186885,
                                "indic_val": 0.8467,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.10",
                                "conso_pct_fmt": "0.19",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69244",
                                "land_type": "COMM",
                                "conso_ha": 1.15,
                                "conso_pct": 0.14441,
                                "indic_val": 1.3503,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.15",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69033",
                                "land_type": "COMM",
                                "conso_ha": 1.2,
                                "conso_pct": 0.14221,
                                "indic_val": 1.6658,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.20",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69089",
                                "land_type": "COMM",
                                "conso_ha": 1.2,
                                "conso_pct": 0.14532,
                                "indic_val": 1.8798,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.20",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69069",
                                "land_type": "COMM",
                                "conso_ha": 1.34,
                                "conso_pct": 0.284488,
                                "indic_val": 2.1241,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.34",
                                "conso_pct_fmt": "0.28",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69271",
                                "land_type": "COMM",
                                "conso_ha": 1.39,
                                "conso_pct": 0.119894,
                                "indic_val": 1.3811,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.39",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69072",
                                "land_type": "COMM",
                                "conso_ha": 1.42,
                                "conso_pct": 0.101402,
                                "indic_val": 0.5702,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.42",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+0.6%",
                            },
                            {
                                "land_id": "69275",
                                "land_type": "COMM",
                                "conso_ha": 1.46,
                                "conso_pct": 0.085368,
                                "indic_val": 1.4489,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.46",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69284",
                                "land_type": "COMM",
                                "conso_ha": 1.54,
                                "conso_pct": 0.211995,
                                "indic_val": 1.5222,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.54",
                                "conso_pct_fmt": "0.21",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69283",
                                "land_type": "COMM",
                                "conso_ha": 1.6,
                                "conso_pct": 0.137863,
                                "indic_val": 1.3496,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.60",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69191",
                                "land_type": "COMM",
                                "conso_ha": 1.6,
                                "conso_pct": 0.22015,
                                "indic_val": 0.9511,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.60",
                                "conso_pct_fmt": "0.22",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69163",
                                "land_type": "COMM",
                                "conso_ha": 1.96,
                                "conso_pct": 0.10922,
                                "indic_val": 1.4908,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "1.96",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69091",
                                "land_type": "COMM",
                                "conso_ha": 2.0,
                                "conso_pct": 0.114657,
                                "indic_val": 0.5648,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.00",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+0.6%",
                            },
                            {
                                "land_id": "69100",
                                "land_type": "COMM",
                                "conso_ha": 2.01,
                                "conso_pct": 0.226134,
                                "indic_val": 0.7072,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.01",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69278",
                                "land_type": "COMM",
                                "conso_ha": 2.1,
                                "conso_pct": 0.2435,
                                "indic_val": 0.9189,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.10",
                                "conso_pct_fmt": "0.24",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69259",
                                "land_type": "COMM",
                                "conso_ha": 2.12,
                                "conso_pct": 0.13774,
                                "indic_val": 0.9886,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.12",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69194",
                                "land_type": "COMM",
                                "conso_ha": 2.3,
                                "conso_pct": 0.276061,
                                "indic_val": 1.4095,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.30",
                                "conso_pct_fmt": "0.28",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69250",
                                "land_type": "COMM",
                                "conso_ha": 2.6,
                                "conso_pct": 0.309712,
                                "indic_val": 1.6382,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.60",
                                "conso_pct_fmt": "0.31",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69282",
                                "land_type": "COMM",
                                "conso_ha": 2.8,
                                "conso_pct": 0.119601,
                                "indic_val": 1.5635,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "2.80",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69116",
                                "land_type": "COMM",
                                "conso_ha": 3.22,
                                "conso_pct": 0.354384,
                                "indic_val": 1.7045,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "3.22",
                                "conso_pct_fmt": "0.35",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69029",
                                "land_type": "COMM",
                                "conso_ha": 3.78,
                                "conso_pct": 0.367429,
                                "indic_val": 0.928,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "3.78",
                                "conso_pct_fmt": "0.37",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69290",
                                "land_type": "COMM",
                                "conso_ha": 8.93,
                                "conso_pct": 0.301097,
                                "indic_val": 1.423,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                                "verdict": "Situation contrastée : la forte consommation d'espaces s'accompagne d'une dynamique démographique soutenue.",
                                "conso_fmt": "8.93",
                                "conso_pct_fmt": "0.30",
                                "indic_fmt": "+1.4%",
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
                            "pointFormat": "<b>{point.name}</b><br/>Évolution de la population : <b>{point.indic_fmt}</b><br/>Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>",
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
                    "filename": "Rythmes annuels de consommation et évolution de la population des communes - Métropole de Lyon (2011-2022)",
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
                    "Consommation 2011-2022 (ha/an)",
                    "Évolution de la population (%/an)",
                ],
                "boldFirstColumn": True,
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.18",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Rochetaillée-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.74",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Écully",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "1.51",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Sainte-Foy-lès-Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.2%",
                            "0.81",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Fontaines-Saint-Martin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.3%",
                            "1.11",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Saint-Genis-Laval",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.4%",
                            "0.70",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Lissieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.4%",
                            "1.24",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Feyzin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.4%",
                            "1.43",
                            "Charly",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "0.15",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Curis-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "0.68",
                            "Consommation intermédiaire, évolution annuelle population intermédiaire",
                            "Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "1.37",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Rillieux-la-Pape",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "1.67",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Marcy-l'Étoile",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "1.73",
                            "Caluire-et-Cuire",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "4.56",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Corbas",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "4.96",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Jonage",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.6%",
                            "1.42",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Dardilly",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.6%",
                            "2.00",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Givors",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "0.55",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Oullins-Pierre-Bénite",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "0.78",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Poleymieux-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "1.01",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Neuville-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "2.01",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Irigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "1.10",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Grigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.66",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Sathonay-Village",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.68",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Germain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.71",
                            "Albigny-sur-Saône",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.88",
                            "Charbonnières-les-Bains",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "2.10",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Genay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "3.78",
                            "Bron",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.58",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Fontaines-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "1.60",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Cyr-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "2.12",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Vénissieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.13",
                            "Consommation parmi les plus faibles, évolution annuelle population parmi les plus élevées",
                            "Villeurbanne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.43",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Solaize",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.52",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Fleurieu-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.06",
                            "Consommation parmi les plus faibles, évolution annuelle population parmi les plus élevées",
                            "Saint-Fons",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "1.60",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Mions",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "0.63",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Vernaison",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "1.15",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Tassin-la-Demi-Lune",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "1.39",
                            "Chassieu",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "1.46",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Décines-Charpieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "2.30",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Didier-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "8.93",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Priest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.93",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Genis-les-Ollières",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "1.54",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Montanay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "1.96",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Quincieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.34",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Saint-Romain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "2.60",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "La Tour-de-Salvagny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "2.80",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Meyzieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.48",
                            "Champagne-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "1.20",
                            "Cailloux-sur-Fontaines",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "3.22",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Limonest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.9%",
                            "0.69",
                            "Collonges-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.9%",
                            "1.20",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Francheville",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "0.54",
                            "Consommation intermédiaire, évolution annuelle population parmi les plus élevées",
                            "Vaulx-en-Velin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "1.34",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Craponne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+6.0%",
                            "0.19",
                            "Consommation parmi les plus élevées, évolution annuelle population parmi les plus élevées",
                            "Sathonay-Camp",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "-0.0%",
                            "0.01",
                            "Consommation parmi les plus faibles, évolution annuelle population intermédiaire",
                            "La Mulatière",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "-0.0%",
                            "0.14",
                            "Consommation parmi les plus élevées, évolution annuelle population intermédiaire",
                            "Couzon-au-Mont-d'Or",
                        ],
                    },
                ],
            },
        }
    )
