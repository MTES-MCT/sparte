# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_emploi_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_emploi_map/EPCI/200046977",
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
                    "title": {"text": "Taux de chômage (%)"},
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
                "title": {"text": "Taux de chômage des communes - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {"min": 3.3, "max": 19.8, "minColor": "#FFFFFF", "maxColor": "#FA4B42"},
                "series": [
                    {
                        "name": "Taux de chômage (%)",
                        "data": [
                            {"land_id": "69003", "taux_chomage": 10.0},
                            {"land_id": "69029", "taux_chomage": 12.5},
                            {"land_id": "69033", "taux_chomage": 5.7},
                            {"land_id": "69034", "taux_chomage": 9.0},
                            {"land_id": "69040", "taux_chomage": 8.9},
                            {"land_id": "69044", "taux_chomage": 8.7},
                            {"land_id": "69046", "taux_chomage": 7.3},
                            {"land_id": "69063", "taux_chomage": 7.1},
                            {"land_id": "69068", "taux_chomage": 7.8},
                            {"land_id": "69069", "taux_chomage": 7.0},
                            {"land_id": "69071", "taux_chomage": 6.0},
                            {"land_id": "69072", "taux_chomage": 8.1},
                            {"land_id": "69081", "taux_chomage": 10.0},
                            {"land_id": "69085", "taux_chomage": 5.4},
                            {"land_id": "69087", "taux_chomage": 8.6},
                            {"land_id": "69088", "taux_chomage": 10.2},
                            {"land_id": "69089", "taux_chomage": 10.0},
                            {"land_id": "69091", "taux_chomage": 18.1},
                            {"land_id": "69096", "taux_chomage": 8.8},
                            {"land_id": "69100", "taux_chomage": 9.1},
                            {"land_id": "69116", "taux_chomage": 7.0},
                            {"land_id": "69117", "taux_chomage": 6.7},
                            {"land_id": "69123", "taux_chomage": 11.1},
                            {"land_id": "69127", "taux_chomage": 8.2},
                            {"land_id": "69142", "taux_chomage": 12.7},
                            {"land_id": "69143", "taux_chomage": 10.1},
                            {"land_id": "69149", "taux_chomage": 11.5},
                            {"land_id": "69153", "taux_chomage": 3.3},
                            {"land_id": "69163", "taux_chomage": 5.8},
                            {"land_id": "69168", "taux_chomage": 11.0},
                            {"land_id": "69191", "taux_chomage": 8.1},
                            {"land_id": "69194", "taux_chomage": 6.8},
                            {"land_id": "69199", "taux_chomage": 19.8},
                            {"land_id": "69202", "taux_chomage": 9.4},
                            {"land_id": "69204", "taux_chomage": 9.8},
                            {"land_id": "69205", "taux_chomage": 6.0},
                            {"land_id": "69207", "taux_chomage": 9.6},
                            {"land_id": "69233", "taux_chomage": 8.0},
                            {"land_id": "69244", "taux_chomage": 10.3},
                            {"land_id": "69250", "taux_chomage": 5.4},
                            {"land_id": "69256", "taux_chomage": 19.8},
                            {"land_id": "69259", "taux_chomage": 19.7},
                            {"land_id": "69260", "taux_chomage": 8.4},
                            {"land_id": "69266", "taux_chomage": 13.3},
                            {"land_id": "69271", "taux_chomage": 9.1},
                            {"land_id": "69273", "taux_chomage": 10.1},
                            {"land_id": "69275", "taux_chomage": 12.9},
                            {"land_id": "69276", "taux_chomage": 13.5},
                            {"land_id": "69278", "taux_chomage": 8.8},
                            {"land_id": "69279", "taux_chomage": 6.6},
                            {"land_id": "69282", "taux_chomage": 11.0},
                            {"land_id": "69283", "taux_chomage": 9.8},
                            {"land_id": "69284", "taux_chomage": 5.8},
                            {"land_id": "69286", "taux_chomage": 15.6},
                            {"land_id": "69290", "taux_chomage": 12.3},
                            {"land_id": "69292", "taux_chomage": 7.8},
                            {"land_id": "69293", "taux_chomage": 5.4},
                            {"land_id": "69296", "taux_chomage": 4.8},
                        ],
                        "joinBy": ["land_id"],
                        "colorKey": "taux_chomage",
                        "opacity": 1,
                        "showInLegend": False,
                        "borderColor": "#999999",
                        "borderWidth": 1,
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Taux de chômage: {point.taux_chomage:.1f}%",
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
                    "filename": "Taux de chômage des communes - Métropole de Lyon (2022)",
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
                "headers": ["Actifs occupés", "Chômeurs", "Pop. 15-64 ans", "Taux de chômage (%)", "Territoire"],
                "boldFirstColumn": True,
                "rows": [
                    {"name": "", "data": ["1,095", "1,462", "5.4%", "62", "Sathonay-Village"]},
                    {"name": "", "data": ["1,134", "1,544", "7.8%", "96", "Couzon-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,148", "10,047", "10.3%", "14,261", "Tassin-la-Demi-Lune"]},
                    {"name": "", "data": ["1,171", "1,705", "10.0%", "130", "Albigny-sur-Saône"]},
                    {"name": "", "data": ["1,259", "1,805", "119", "8.6%", "Fontaines-Saint-Martin"]},
                    {"name": "", "data": ["1,353", "1,854", "144", "9.6%", "Saint-Germain-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,390", "1,947", "100", "6.7%", "Lissieu"]},
                    {"name": "", "data": ["1,402", "1,886", "5.7%", "84", "Cailloux-sur-Fontaines"]},
                    {"name": "", "data": ["1,439", "1,904", "4.8%", "72", "Solaize"]},
                    {"name": "", "data": ["1,491", "2,094", "5.8%", "92", "Montanay"]},
                    {"name": "", "data": ["1,598", "12,627", "18.1%", "7,230", "Givors"]},
                    {"name": "", "data": ["1,619", "145", "2,354", "8.2%", "Marcy-l'Étoile"]},
                    {"name": "", "data": ["1,668", "11,842", "19.8%", "6,752", "Saint-Fons"]},
                    {"name": "", "data": ["1,759", "108", "2,253", "5.8%", "Quincieux"]},
                    {"name": "", "data": ["1,766", "132", "2,422", "7.0%", "Limonest"]},
                    {"name": "", "data": ["1,836", "12,362", "12.9%", "18,706", "Décines-Charpieu"]},
                    {"name": "", "data": ["1,886", "11.0%", "15,218", "22,313", "Meyzieu"]},
                    {"name": "", "data": ["1,897", "19,100", "26,351", "9.0%", "Caluire-et-Cuire"]},
                    {"name": "", "data": ["1,926", "111", "2,591", "5.4%", "La Tour-de-Salvagny"]},
                    {"name": "", "data": ["1,977", "152", "2,763", "7.1%", "Collonges-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,982", "156", "2,747", "7.3%", "Charly"]},
                    {"name": "", "data": ["10,753", "10.0%", "6,534", "728", "Écully"]},
                    {"name": "", "data": ["10,974", "113,041", "13.3%", "71,483", "Villeurbanne"]},
                    {"name": "", "data": ["10.0%", "6,447", "719", "9,550", "Francheville"]},
                    {"name": "", "data": ["10.1%", "3,258", "366", "4,599", "Neuville-sur-Saône"]},
                    {"name": "", "data": ["10.1%", "4,355", "489", "7,080", "Corbas"]},
                    {"name": "", "data": ["10.2%", "2,986", "339", "4,187", "Fontaines-sur-Saône"]},
                    {"name": "", "data": ["11,049", "15.6%", "18,746", "2,041", "Rillieux-la-Pape"]},
                    {"name": "", "data": ["11.0%", "683", "84", "983", "Rochetaillée-sur-Saône"]},
                    {"name": "", "data": ["11.1%", "486,568", "60,972", "731,961", "Lyon"]},
                    {"name": "", "data": ["11.5%", "16,538", "2,150", "24,455", "Oullins-Pierre-Bénite"]},
                    {"name": "", "data": ["12,384", "8,622", "9.4%", "900", "Sainte-Foy-lès-Lyon"]},
                    {"name": "", "data": ["12,949", "8,727", "9.8%", "951", "Saint-Genis-Laval"]},
                    {"name": "", "data": ["12.3%", "2,849", "20,266", "30,861", "Saint-Priest"]},
                    {"name": "", "data": ["12.5%", "17,419", "2,477", "27,058", "Bron"]},
                    {"name": "", "data": ["12.7%", "2,653", "3,968", "388", "La Mulatière"]},
                    {"name": "", "data": ["13.5%", "3,848", "599", "6,060", "Feyzin"]},
                    {"name": "", "data": ["149", "2,341", "3,207", "6.0%", "Saint-Genis-les-Ollières"]},
                    {"name": "", "data": ["17,861", "19.8%", "32,847", "4,396", "Vaulx-en-Velin"]},
                    {"name": "", "data": ["19.7%", "22,397", "41,609", "5,506", "Vénissieux"]},
                    {"name": "", "data": ["198", "2,778", "3,858", "6.6%", "Jonage"]},
                    {"name": "", "data": ["2,123", "202", "3,084", "8.7%", "Charbonnières-les-Bains"]},
                    {"name": "", "data": ["2,187", "200", "3,116", "8.4%", "Vernaison"]},
                    {"name": "", "data": ["2,443", "215", "3,506", "8.1%", "Saint-Cyr-au-Mont-d'Or"]},
                    {"name": "", "data": ["2,469", "238", "3,453", "8.8%", "Genay"]},
                    {"name": "", "data": ["2,651", "258", "3,702", "8.9%", "Champagne-au-Mont-d'Or"]},
                    {"name": "", "data": ["2,937", "215", "4,119", "6.8%", "Saint-Didier-au-Mont-d'Or"]},
                    {"name": "", "data": ["28", "3.3%", "808", "997", "Poleymieux-au-Mont-d'Or"]},
                    {"name": "", "data": ["3,551", "300", "4,655", "7.8%", "Sathonay-Camp"]},
                    {"name": "", "data": ["3,686", "325", "5,492", "8.1%", "Dardilly"]},
                    {"name": "", "data": ["3,739", "376", "5,380", "9.1%", "Irigny"]},
                    {"name": "", "data": ["37", "581", "6.0%", "763", "Curis-au-Mont-d'Or"]},
                    {"name": "", "data": ["398", "5,276", "7,235", "7.0%", "Craponne"]},
                    {"name": "", "data": ["4,204", "404", "6,314", "8.8%", "Grigny"]},
                    {"name": "", "data": ["4,857", "487", "6,844", "9.1%", "Chassieu"]},
                    {"name": "", "data": ["41", "5.4%", "721", "966", "Fleurieu-sur-Saône"]},
                    {"name": "", "data": ["48", "553", "765", "8.0%", "Saint-Romain-au-Mont-d'Or"]},
                    {"name": "", "data": ["5,815", "632", "8,430", "9.8%", "Mions"]},
                ],
            },
        }
    )
