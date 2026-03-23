# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_population_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_population_map/EPCI/200046977",
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
                "legend": {
                    "title": {"text": "Population (2022)"},
                    "backgroundColor": "#ffffff",
                    "align": "right",
                    "verticalAlign": "middle",
                    "layout": "vertical",
                },
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
                "title": {"text": "Population des communes - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {"min": 1186.0, "max": 1041548.0, "minColor": "#FFFFFF", "maxColor": "#6A6AF4"},
                "series": [
                    {
                        "name": "Population (2022)",
                        "data": [
                            {"land_id": "69003", "population": 3013.00000000001},
                            {"land_id": "69029", "population": 42850.0},
                            {"land_id": "69033", "population": 2950.99999999999},
                            {"land_id": "69034", "population": 43479.0},
                            {"land_id": "69040", "population": 6124.0},
                            {"land_id": "69044", "population": 5272.0},
                            {"land_id": "69046", "population": 4670.00000000001},
                            {"land_id": "69063", "population": 4604.0},
                            {"land_id": "69068", "population": 2541.0},
                            {"land_id": "69069", "population": 12170.0},
                            {"land_id": "69071", "population": 1186.0},
                            {"land_id": "69072", "population": 8979.99999999999},
                            {"land_id": "69081", "population": 18019.0},
                            {"land_id": "69085", "population": 1549.0},
                            {"land_id": "69087", "population": 3070.0},
                            {"land_id": "69088", "population": 7005.00000000001},
                            {"land_id": "69089", "population": 15664.0},
                            {"land_id": "69091", "population": 20943.0},
                            {"land_id": "69096", "population": 9941.0},
                            {"land_id": "69100", "population": 8909.0},
                            {"land_id": "69116", "population": 3933.0},
                            {"land_id": "69117", "population": 3193.0},
                            {"land_id": "69123", "population": 1041548.0},
                            {"land_id": "69127", "population": 3711.0},
                            {"land_id": "69142", "population": 6553.99999999999},
                            {"land_id": "69143", "population": 7807.0},
                            {"land_id": "69149", "population": 37928.0},
                            {"land_id": "69153", "population": 1394.0},
                            {"land_id": "69163", "population": 3620.0},
                            {"land_id": "69168", "population": 1546.0},
                            {"land_id": "69191", "population": 6113.0},
                            {"land_id": "69194", "population": 7405.0},
                            {"land_id": "69199", "population": 19549.0},
                            {"land_id": "69202", "population": 21893.0},
                            {"land_id": "69204", "population": 21329.0},
                            {"land_id": "69205", "population": 5370.0},
                            {"land_id": "69207", "population": 3037.0},
                            {"land_id": "69233", "population": 1241.0},
                            {"land_id": "69244", "population": 22819.0},
                            {"land_id": "69250", "population": 4460.0},
                            {"land_id": "69256", "population": 52448.0},
                            {"land_id": "69259", "population": 66701.0},
                            {"land_id": "69260", "population": 5175.0},
                            {"land_id": "69266", "population": 162207.0},
                            {"land_id": "69271", "population": 11214.0},
                            {"land_id": "69273", "population": 11196.0},
                            {"land_id": "69275", "population": 29905.0},
                            {"land_id": "69276", "population": 9727.0},
                            {"land_id": "69278", "population": 5632.00000000001},
                            {"land_id": "69279", "population": 6109.00000000001},
                            {"land_id": "69282", "population": 36437.0},
                            {"land_id": "69283", "population": 13716.0},
                            {"land_id": "69284", "population": 3270.00000000001},
                            {"land_id": "69286", "population": 31479.0},
                            {"land_id": "69290", "population": 49193.0},
                            {"land_id": "69292", "population": 7039.0},
                            {"land_id": "69293", "population": 2418.0},
                            {"land_id": "69296", "population": 3131.0},
                        ],
                        "joinBy": ["land_id"],
                        "colorKey": "population",
                        "opacity": 1,
                        "showInLegend": False,
                        "borderColor": "#999999",
                        "borderWidth": 1,
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Population: {point.population:,.0f}",
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
                    "filename": "Population des communes - Métropole de Lyon (2022)",
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
                "headers": ["Population 2011", "Population 2016", "Population 2022", "Territoire"],
                "boldFirstColumn": True,
                "rows": [
                    {"name": "", "data": ["1,031,390", "1,041,548", "982,536", "Lyon"]},
                    {"name": "", "data": ["1,056", "1,200", "1,241", "Saint-Romain-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,119", "1,170", "1,186", "Curis-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,290", "1,297", "1,394", "Poleymieux-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,363", "1,435", "1,549", "Fleurieu-sur-Saône"]},
                    {"name": "", "data": ["1,518", "1,535", "1,546", "Rochetaillée-sur-Saône"]},
                    {"name": "", "data": ["10,234", "11,214", "9,735", "Chassieu"]},
                    {"name": "", "data": ["10,621", "11,196", "11,209", "Corbas"]},
                    {"name": "", "data": ["11,158", "12,170", "9,865", "Craponne"]},
                    {"name": "", "data": ["11,943", "13,244", "13,716", "Mions"]},
                    {"name": "", "data": ["12,980", "14,278", "15,664", "Francheville"]},
                    {"name": "", "data": ["145,034", "149,019", "162,207", "Villeurbanne"]},
                    {"name": "", "data": ["17,032", "18,566", "19,549", "Saint-Fons"]},
                    {"name": "", "data": ["17,854", "18,019", "18,097", "Écully"]},
                    {"name": "", "data": ["19,312", "19,718", "20,943", "Givors"]},
                    {"name": "", "data": ["19,868", "22,356", "22,819", "Tassin-la-Demi-Lune"]},
                    {"name": "", "data": ["2,208", "2,346", "2,418", "Sathonay-Village"]},
                    {"name": "", "data": ["2,494", "2,642", "2,951", "Cailloux-sur-Fontaines"]},
                    {"name": "", "data": ["2,541", "2,551", "2,559", "Couzon-au-Mont-d'Or"]},
                    {"name": "", "data": ["2,755", "2,833", "3,013", "Albigny-sur-Saône"]},
                    {"name": "", "data": ["2,761", "3,037", "3,135", "Saint-Germain-au-Mont-d'Or"]},
                    {"name": "", "data": ["2,799", "2,916", "3,131", "Solaize"]},
                    {"name": "", "data": ["2,801", "3,087", "3,270", "Montanay"]},
                    {"name": "", "data": ["2,994", "3,070", "3,070", "Fontaines-Saint-Martin"]},
                    {"name": "", "data": ["20,673", "21,329", "21,545", "Saint-Genis-Laval"]},
                    {"name": "", "data": ["21,585", "21,893", "21,995", "Sainte-Foy-lès-Lyon"]},
                    {"name": "", "data": ["25,794", "27,851", "29,905", "Décines-Charpieu"]},
                    {"name": "", "data": ["29,885", "29,966", "31,479", "Rillieux-la-Pape"]},
                    {"name": "", "data": ["3,049", "3,116", "3,193", "Lissieu"]},
                    {"name": "", "data": ["3,110", "3,453", "3,620", "Quincieux"]},
                    {"name": "", "data": ["3,312", "3,675", "3,933", "Limonest"]},
                    {"name": "", "data": ["3,534", "3,711", "3,736", "Marcy-l'Étoile"]},
                    {"name": "", "data": ["3,779", "4,061", "4,460", "La Tour-de-Salvagny"]},
                    {"name": "", "data": ["3,802", "4,054", "4,604", "Collonges-au-Mont-d'Or"]},
                    {"name": "", "data": ["31,090", "32,996", "36,437", "Meyzieu"]},
                    {"name": "", "data": ["35,268", "37,005", "37,928", "Oullins-Pierre-Bénite"]},
                    {"name": "", "data": ["38,881", "41,060", "42,850", "Bron"]},
                    {"name": "", "data": ["4,241", "5,926", "7,039", "Sathonay-Camp"]},
                    {"name": "", "data": ["4,481", "4,529", "4,670", "Charly"]},
                    {"name": "", "data": ["4,497", "4,872", "5,175", "Vernaison"]},
                    {"name": "", "data": ["4,602", "4,879", "5,370", "Saint-Genis-les-Ollières"]},
                    {"name": "", "data": ["4,782", "5,016", "5,272", "Charbonnières-les-Bains"]},
                    {"name": "", "data": ["41,357", "42,915", "43,479", "Caluire-et-Cuire"]},
                    {"name": "", "data": ["42,535", "45,844", "49,193", "Saint-Priest"]},
                    {"name": "", "data": ["42,726", "48,497", "52,448", "Vaulx-en-Velin"]},
                    {"name": "", "data": ["5,115", "5,446", "5,632", "Genay"]},
                    {"name": "", "data": ["5,165", "5,603", "6,124", "Champagne-au-Mont-d'Or"]},
                    {"name": "", "data": ["5,534", "5,545", "6,113", "Saint-Cyr-au-Mont-d'Or"]},
                    {"name": "", "data": ["5,765", "5,838", "6,109", "Jonage"]},
                    {"name": "", "data": ["6,294", "7,001", "7,005", "Fontaines-sur-Saône"]},
                    {"name": "", "data": ["6,320", "6,554", "6,556", "La Mulatière"]},
                    {"name": "", "data": ["6,411", "6,650", "7,405", "Saint-Didier-au-Mont-d'Or"]},
                    {"name": "", "data": ["60,159", "65,405", "66,701", "Vénissieux"]},
                    {"name": "", "data": ["7,232", "7,435", "7,807", "Neuville-sur-Saône"]},
                    {"name": "", "data": ["8,266", "8,609", "8,909", "Irigny"]},
                    {"name": "", "data": ["8,450", "8,617", "8,980", "Dardilly"]},
                    {"name": "", "data": ["9,094", "9,615", "9,941", "Grigny"]},
                    {"name": "", "data": ["9,333", "9,727", "9,879", "Feyzin"]},
                ],
            },
        }
    )
