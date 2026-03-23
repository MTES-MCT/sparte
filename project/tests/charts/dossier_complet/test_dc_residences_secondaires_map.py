# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_residences_secondaires_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_residences_secondaires_map/EPCI/200046977",
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
                    "title": {"text": "Résidences secondaires (%)"},
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
                "title": {"text": "Part des résidences secondaires des communes - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {"min": 0.2, "max": 9.0, "minColor": "#FFFFFF", "maxColor": "#d94701"},
                "series": [
                    {
                        "name": "Résidences secondaires (%)",
                        "data": [
                            {
                                "land_id": "69003",
                                "taux_rs": 1.9,
                                "rs": 23.496640111153,
                                "logements_total": 1247.25605227444,
                            },
                            {
                                "land_id": "69029",
                                "taux_rs": 1.6,
                                "rs": 311.655836342842,
                                "logements_total": 19938.211638656,
                            },
                            {
                                "land_id": "69033",
                                "taux_rs": 0.9,
                                "rs": 10.2765388046387,
                                "logements_total": 1168.60823546413,
                            },
                            {
                                "land_id": "69034",
                                "taux_rs": 2.0,
                                "rs": 470.970971020153,
                                "logements_total": 23277.0727696615,
                            },
                            {
                                "land_id": "69040",
                                "taux_rs": 1.8,
                                "rs": 57.5816619831731,
                                "logements_total": 3164.34688418211,
                            },
                            {
                                "land_id": "69044",
                                "taux_rs": 1.8,
                                "rs": 48.2001400600901,
                                "logements_total": 2677.123402838,
                            },
                            {
                                "land_id": "69046",
                                "taux_rs": 1.1,
                                "rs": 21.0126874133482,
                                "logements_total": 1979.41279260264,
                            },
                            {
                                "land_id": "69063",
                                "taux_rs": 1.4,
                                "rs": 29.9244380472273,
                                "logements_total": 2088.65328812201,
                            },
                            {
                                "land_id": "69068",
                                "taux_rs": 1.9,
                                "rs": 21.860765380192,
                                "logements_total": 1158.40456971074,
                            },
                            {
                                "land_id": "69069",
                                "taux_rs": 0.9,
                                "rs": 50.2605010763548,
                                "logements_total": 5902.27345203133,
                            },
                            {
                                "land_id": "69071",
                                "taux_rs": 1.4,
                                "rs": 7.08297639749623,
                                "logements_total": 500.882143945294,
                            },
                            {
                                "land_id": "69072",
                                "taux_rs": 5.1,
                                "rs": 206.088056715584,
                                "logements_total": 4006.39852891833,
                            },
                            {
                                "land_id": "69081",
                                "taux_rs": 3.1,
                                "rs": 284.668703122464,
                                "logements_total": 9126.33689528615,
                            },
                            {
                                "land_id": "69085",
                                "taux_rs": 1.0,
                                "rs": 6.65603141234514,
                                "logements_total": 666.221256546314,
                            },
                            {
                                "land_id": "69087",
                                "taux_rs": 1.1,
                                "rs": 13.6654558404559,
                                "logements_total": 1254.76108132692,
                            },
                            {
                                "land_id": "69088",
                                "taux_rs": 0.8,
                                "rs": 29.1659791257404,
                                "logements_total": 3547.24115894436,
                            },
                            {
                                "land_id": "69089",
                                "taux_rs": 1.1,
                                "rs": 74.2529824286051,
                                "logements_total": 6634.30088195192,
                            },
                            {
                                "land_id": "69091",
                                "taux_rs": 1.0,
                                "rs": 88.2499687236478,
                                "logements_total": 9261.34787161884,
                            },
                            {
                                "land_id": "69096",
                                "taux_rs": 0.8,
                                "rs": 32.4471856451841,
                                "logements_total": 4256.87655157857,
                            },
                            {
                                "land_id": "69100",
                                "taux_rs": 1.2,
                                "rs": 46.7178486184715,
                                "logements_total": 3846.14574587685,
                            },
                            {
                                "land_id": "69116",
                                "taux_rs": 2.5,
                                "rs": 46.0,
                                "logements_total": 1854.0,
                            },
                            {
                                "land_id": "69117",
                                "taux_rs": 8.1,
                                "rs": 117.051224129633,
                                "logements_total": 1439.71197802024,
                            },
                            {
                                "land_id": "69123",
                                "taux_rs": 5.8,
                                "rs": 37097.8697575788,
                                "logements_total": 637224.772234874,
                            },
                            {
                                "land_id": "69127",
                                "taux_rs": 9.0,
                                "rs": 144.420431023596,
                                "logements_total": 1602.13553686566,
                            },
                            {
                                "land_id": "69142",
                                "taux_rs": 1.8,
                                "rs": 66.1928799149838,
                                "logements_total": 3720.85342421665,
                            },
                            {
                                "land_id": "69143",
                                "taux_rs": 1.1,
                                "rs": 49.0,
                                "logements_total": 4275.0,
                            },
                            {
                                "land_id": "69149",
                                "taux_rs": 1.6,
                                "rs": 320.25495720587,
                                "logements_total": 19574.9425150741,
                            },
                            {
                                "land_id": "69153",
                                "taux_rs": 3.1,
                                "rs": 14.1483050847457,
                                "logements_total": 459.777131419629,
                            },
                            {
                                "land_id": "69163",
                                "taux_rs": 1.4,
                                "rs": 20.8936169778282,
                                "logements_total": 1514.04382305784,
                            },
                            {
                                "land_id": "69168",
                                "taux_rs": 1.1,
                                "rs": 7.06431852986216,
                                "logements_total": 648.98730291651,
                            },
                            {
                                "land_id": "69191",
                                "taux_rs": 5.6,
                                "rs": 165.295938105486,
                                "logements_total": 2957.41385676639,
                            },
                            {
                                "land_id": "69194",
                                "taux_rs": 2.9,
                                "rs": 90.0,
                                "logements_total": 3157.0,
                            },
                            {
                                "land_id": "69199",
                                "taux_rs": 0.7,
                                "rs": 60.1325753901025,
                                "logements_total": 8168.32639985014,
                            },
                            {
                                "land_id": "69202",
                                "taux_rs": 1.6,
                                "rs": 175.221277745927,
                                "logements_total": 10788.1474102924,
                            },
                            {
                                "land_id": "69204",
                                "taux_rs": 1.4,
                                "rs": 139.980155087869,
                                "logements_total": 9821.79844274237,
                            },
                            {
                                "land_id": "69205",
                                "taux_rs": 1.1,
                                "rs": 23.9239177763136,
                                "logements_total": 2225.72281804488,
                            },
                            {
                                "land_id": "69207",
                                "taux_rs": 0.8,
                                "rs": 10.3491371277122,
                                "logements_total": 1353.78796758673,
                            },
                            {
                                "land_id": "69233",
                                "taux_rs": 1.1,
                                "rs": 6.06666666666666,
                                "logements_total": 528.716122111366,
                            },
                            {
                                "land_id": "69244",
                                "taux_rs": 3.0,
                                "rs": 346.482638313478,
                                "logements_total": 11663.1674792776,
                            },
                            {
                                "land_id": "69250",
                                "taux_rs": 2.3,
                                "rs": 47.4674386385355,
                                "logements_total": 2080.90654262809,
                            },
                            {
                                "land_id": "69256",
                                "taux_rs": 0.7,
                                "rs": 144.773615945793,
                                "logements_total": 20782.3435870754,
                            },
                            {
                                "land_id": "69259",
                                "taux_rs": 1.2,
                                "rs": 365.342753471679,
                                "logements_total": 30188.1188857192,
                            },
                            {
                                "land_id": "69260",
                                "taux_rs": 0.9,
                                "rs": 18.285224910977,
                                "logements_total": 2150.73775033771,
                            },
                            {
                                "land_id": "69266",
                                "taux_rs": 3.5,
                                "rs": 3208.67755317662,
                                "logements_total": 91641.3155325484,
                            },
                            {
                                "land_id": "69271",
                                "taux_rs": 0.5,
                                "rs": 24.9160900614043,
                                "logements_total": 4747.43676732576,
                            },
                            {
                                "land_id": "69273",
                                "taux_rs": 1.0,
                                "rs": 42.3240220524461,
                                "logements_total": 4386.35905585958,
                            },
                            {
                                "land_id": "69275",
                                "taux_rs": 0.8,
                                "rs": 111.479183294876,
                                "logements_total": 13763.8954842434,
                            },
                            {
                                "land_id": "69276",
                                "taux_rs": 0.5,
                                "rs": 21.5062840339213,
                                "logements_total": 4509.92224036611,
                            },
                            {
                                "land_id": "69278",
                                "taux_rs": 0.8,
                                "rs": 20.694928738663,
                                "logements_total": 2436.69596933674,
                            },
                            {
                                "land_id": "69279",
                                "taux_rs": 1.3,
                                "rs": 32.0003109411926,
                                "logements_total": 2495.09010009391,
                            },
                            {
                                "land_id": "69282",
                                "taux_rs": 1.5,
                                "rs": 223.118375265488,
                                "logements_total": 15355.3235721482,
                            },
                            {
                                "land_id": "69283",
                                "taux_rs": 0.4,
                                "rs": 21.5755661946569,
                                "logements_total": 5594.54959589705,
                            },
                            {
                                "land_id": "69284",
                                "taux_rs": 0.2,
                                "rs": 2.07887737549816,
                                "logements_total": 1318.11390648557,
                            },
                            {
                                "land_id": "69286",
                                "taux_rs": 0.6,
                                "rs": 79.7768162214033,
                                "logements_total": 13395.9992031574,
                            },
                            {
                                "land_id": "69290",
                                "taux_rs": 1.5,
                                "rs": 335.405554179877,
                                "logements_total": 22752.1026267032,
                            },
                            {
                                "land_id": "69292",
                                "taux_rs": 0.8,
                                "rs": 29.0,
                                "logements_total": 3457.0,
                            },
                            {
                                "land_id": "69293",
                                "taux_rs": 1.1,
                                "rs": 10.6913891373838,
                                "logements_total": 939.815448124758,
                            },
                            {
                                "land_id": "69296",
                                "taux_rs": 0.5,
                                "rs": 7.0,
                                "logements_total": 1307.0,
                            },
                        ],
                        "joinBy": ["land_id"],
                        "colorKey": "taux_rs",
                        "opacity": 1,
                        "showInLegend": False,
                        "borderColor": "#999999",
                        "borderWidth": 1,
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Rés. secondaires: {point.taux_rs:.1f}%",
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
                    "filename": "Part des résidences secondaires des communes - Métropole de Lyon (2022)",
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
                "headers": ["Part rés. secondaires (2022) (%)", "Rés. secondaires", "Territoire", "Total logements"],
                "boldFirstColumn": True,
                "rows": [
                    {"name": "", "data": ["0.2%", "1,318", "2", "Montanay"]},
                    {"name": "", "data": ["0.4%", "22", "5,595", "Mions"]},
                    {"name": "", "data": ["0.5%", "1,307", "7", "Solaize"]},
                    {"name": "", "data": ["0.5%", "22", "4,510", "Feyzin"]},
                    {"name": "", "data": ["0.5%", "25", "4,747", "Chassieu"]},
                    {"name": "", "data": ["0.6%", "13,396", "80", "Rillieux-la-Pape"]},
                    {"name": "", "data": ["0.7%", "145", "20,782", "Vaulx-en-Velin"]},
                    {"name": "", "data": ["0.7%", "60", "8,168", "Saint-Fons"]},
                    {"name": "", "data": ["0.8%", "1,354", "10", "Saint-Germain-au-Mont-d'Or"]},
                    {"name": "", "data": ["0.8%", "111", "13,764", "Décines-Charpieu"]},
                    {"name": "", "data": ["0.8%", "2,437", "21", "Genay"]},
                    {"name": "", "data": ["0.8%", "29", "3,457", "Sathonay-Camp"]},
                    {"name": "", "data": ["0.8%", "29", "3,547", "Fontaines-sur-Saône"]},
                    {"name": "", "data": ["0.8%", "32", "4,257", "Grigny"]},
                    {"name": "", "data": ["0.9%", "1,169", "10", "Cailloux-sur-Fontaines"]},
                    {"name": "", "data": ["0.9%", "18", "2,151", "Vernaison"]},
                    {"name": "", "data": ["0.9%", "5,902", "50", "Craponne"]},
                    {"name": "", "data": ["1,158", "1.9%", "22", "Couzon-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,247", "1.9%", "23", "Albigny-sur-Saône"]},
                    {"name": "", "data": ["1,255", "1.1%", "14", "Fontaines-Saint-Martin"]},
                    {"name": "", "data": ["1,440", "117", "8.1%", "Lissieu"]},
                    {"name": "", "data": ["1,514", "1.4%", "21", "Quincieux"]},
                    {"name": "", "data": ["1,602", "144", "9.0%", "Marcy-l'Étoile"]},
                    {"name": "", "data": ["1,854", "2.5%", "46", "Limonest"]},
                    {"name": "", "data": ["1,979", "1.1%", "21", "Charly"]},
                    {"name": "", "data": ["1.0%", "4,386", "42", "Corbas"]},
                    {"name": "", "data": ["1.0%", "666", "7", "Fleurieu-sur-Saône"]},
                    {"name": "", "data": ["1.0%", "88", "9,261", "Givors"]},
                    {"name": "", "data": ["1.1%", "11", "940", "Sathonay-Village"]},
                    {"name": "", "data": ["1.1%", "2,226", "24", "Saint-Genis-les-Ollières"]},
                    {"name": "", "data": ["1.1%", "4,275", "49", "Neuville-sur-Saône"]},
                    {"name": "", "data": ["1.1%", "529", "6", "Saint-Romain-au-Mont-d'Or"]},
                    {"name": "", "data": ["1.1%", "6,634", "74", "Francheville"]},
                    {"name": "", "data": ["1.1%", "649", "7", "Rochetaillée-sur-Saône"]},
                    {"name": "", "data": ["1.2%", "3,846", "47", "Irigny"]},
                    {"name": "", "data": ["1.2%", "30,188", "365", "Vénissieux"]},
                    {"name": "", "data": ["1.3%", "2,495", "32", "Jonage"]},
                    {"name": "", "data": ["1.4%", "140", "9,822", "Saint-Genis-Laval"]},
                    {"name": "", "data": ["1.4%", "2,089", "30", "Collonges-au-Mont-d'Or"]},
                    {"name": "", "data": ["1.4%", "501", "7", "Curis-au-Mont-d'Or"]},
                    {"name": "", "data": ["1.5%", "15,355", "223", "Meyzieu"]},
                    {"name": "", "data": ["1.5%", "22,752", "335", "Saint-Priest"]},
                    {"name": "", "data": ["1.6%", "10,788", "175", "Sainte-Foy-lès-Lyon"]},
                    {"name": "", "data": ["1.6%", "19,575", "320", "Oullins-Pierre-Bénite"]},
                    {"name": "", "data": ["1.6%", "19,938", "312", "Bron"]},
                    {"name": "", "data": ["1.8%", "2,677", "48", "Charbonnières-les-Bains"]},
                    {"name": "", "data": ["1.8%", "3,164", "58", "Champagne-au-Mont-d'Or"]},
                    {"name": "", "data": ["1.8%", "3,721", "66", "La Mulatière"]},
                    {"name": "", "data": ["11,663", "3.0%", "346", "Tassin-la-Demi-Lune"]},
                    {"name": "", "data": ["14", "3.1%", "460", "Poleymieux-au-Mont-d'Or"]},
                    {"name": "", "data": ["165", "2,957", "5.6%", "Saint-Cyr-au-Mont-d'Or"]},
                    {"name": "", "data": ["2,081", "2.3%", "47", "La Tour-de-Salvagny"]},
                    {"name": "", "data": ["2.0%", "23,277", "471", "Caluire-et-Cuire"]},
                    {"name": "", "data": ["2.9%", "3,157", "90", "Saint-Didier-au-Mont-d'Or"]},
                    {"name": "", "data": ["206", "4,006", "5.1%", "Dardilly"]},
                    {"name": "", "data": ["285", "3.1%", "9,126", "Écully"]},
                    {"name": "", "data": ["3,209", "3.5%", "91,641", "Villeurbanne"]},
                    {"name": "", "data": ["37,098", "5.8%", "637,225", "Lyon"]},
                ],
            },
        }
    )
