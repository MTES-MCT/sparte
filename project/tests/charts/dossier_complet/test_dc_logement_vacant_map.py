# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_vacant_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_logement_vacant_map/EPCI/200046977",
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
                    "title": {"text": "Taux de vacance (%)"},
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
                "title": {"text": "Taux de logements vacants des communes - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {"min": 2.8, "max": 12.1, "minColor": "#FFFFFF", "maxColor": "#D6AE73"},
                "series": [
                    {
                        "name": "Taux de vacance (%)",
                        "data": [
                            {
                                "land_id": "69003",
                                "taux_vacant": 7.9,
                                "logements_vacants": 99.094525686167,
                                "logements_total": 1247.25605227444,
                            },
                            {
                                "land_id": "69029",
                                "taux_vacant": 6.2,
                                "logements_vacants": 1228.02438287125,
                                "logements_total": 19938.211638656,
                            },
                            {
                                "land_id": "69033",
                                "taux_vacant": 4.8,
                                "logements_vacants": 56.5209634255129,
                                "logements_total": 1168.60823546413,
                            },
                            {
                                "land_id": "69034",
                                "taux_vacant": 7.2,
                                "logements_vacants": 1674.37515620201,
                                "logements_total": 23277.0727696615,
                            },
                            {
                                "land_id": "69040",
                                "taux_vacant": 7.7,
                                "logements_vacants": 244.036567452496,
                                "logements_total": 3164.34688418211,
                            },
                            {
                                "land_id": "69044",
                                "taux_vacant": 9.6,
                                "logements_vacants": 255.670308144826,
                                "logements_total": 2677.123402838,
                            },
                            {
                                "land_id": "69046",
                                "taux_vacant": 3.8,
                                "logements_vacants": 74.5950403173861,
                                "logements_total": 1979.41279260264,
                            },
                            {
                                "land_id": "69063",
                                "taux_vacant": 7.9,
                                "logements_vacants": 165.100347846771,
                                "logements_total": 2088.65328812201,
                            },
                            {
                                "land_id": "69068",
                                "taux_vacant": 9.2,
                                "logements_vacants": 106.024712093931,
                                "logements_total": 1158.40456971074,
                            },
                            {
                                "land_id": "69069",
                                "taux_vacant": 5.0,
                                "logements_vacants": 293.289528373979,
                                "logements_total": 5902.27345203133,
                            },
                            {
                                "land_id": "69071",
                                "taux_vacant": 4.2,
                                "logements_vacants": 21.2489291924887,
                                "logements_total": 500.882143945294,
                            },
                            {
                                "land_id": "69072",
                                "taux_vacant": 7.3,
                                "logements_vacants": 293.675480819707,
                                "logements_total": 4006.39852891833,
                            },
                            {
                                "land_id": "69081",
                                "taux_vacant": 9.0,
                                "logements_vacants": 818.002729535468,
                                "logements_total": 9126.33689528615,
                            },
                            {
                                "land_id": "69085",
                                "taux_vacant": 5.8,
                                "logements_vacants": 38.8268499053466,
                                "logements_total": 666.221256546314,
                            },
                            {
                                "land_id": "69087",
                                "taux_vacant": 7.6,
                                "logements_vacants": 95.658190883191,
                                "logements_total": 1254.76108132692,
                            },
                            {
                                "land_id": "69088",
                                "taux_vacant": 5.9,
                                "logements_vacants": 210.196194388957,
                                "logements_total": 3547.24115894436,
                            },
                            {
                                "land_id": "69089",
                                "taux_vacant": 4.0,
                                "logements_vacants": 267.475574921817,
                                "logements_total": 6634.30088195192,
                            },
                            {
                                "land_id": "69091",
                                "taux_vacant": 8.5,
                                "logements_vacants": 787.393159062713,
                                "logements_total": 9261.34787161884,
                            },
                            {
                                "land_id": "69096",
                                "taux_vacant": 4.9,
                                "logements_vacants": 207.902337652476,
                                "logements_total": 4256.87655157857,
                            },
                            {
                                "land_id": "69100",
                                "taux_vacant": 5.5,
                                "logements_vacants": 211.245924187871,
                                "logements_total": 3846.14574587685,
                            },
                            {
                                "land_id": "69116",
                                "taux_vacant": 12.1,
                                "logements_vacants": 224.0,
                                "logements_total": 1854.0,
                            },
                            {
                                "land_id": "69117",
                                "taux_vacant": 5.1,
                                "logements_vacants": 73.5454594088842,
                                "logements_total": 1439.71197802024,
                            },
                            {
                                "land_id": "69123",
                                "taux_vacant": 8.9,
                                "logements_vacants": 56922.1227779866,
                                "logements_total": 637224.772234874,
                            },
                            {
                                "land_id": "69127",
                                "taux_vacant": 4.6,
                                "logements_vacants": 74.2733645264208,
                                "logements_total": 1602.13553686566,
                            },
                            {
                                "land_id": "69142",
                                "taux_vacant": 11.9,
                                "logements_vacants": 441.285866099892,
                                "logements_total": 3720.85342421665,
                            },
                            {
                                "land_id": "69143",
                                "taux_vacant": 9.9,
                                "logements_vacants": 423.0,
                                "logements_total": 4275.0,
                            },
                            {
                                "land_id": "69149",
                                "taux_vacant": 7.2,
                                "logements_vacants": 1400.80171407707,
                                "logements_total": 19574.9425150741,
                            },
                            {
                                "land_id": "69153",
                                "taux_vacant": 5.1,
                                "logements_vacants": 23.2436440677965,
                                "logements_total": 459.777131419629,
                            },
                            {
                                "land_id": "69163",
                                "taux_vacant": 5.0,
                                "logements_vacants": 75.8768195510602,
                                "logements_total": 1514.04382305784,
                            },
                            {
                                "land_id": "69168",
                                "taux_vacant": 7.2,
                                "logements_vacants": 46.4226646248085,
                                "logements_total": 648.98730291651,
                            },
                            {
                                "land_id": "69191",
                                "taux_vacant": 11.1,
                                "logements_vacants": 327.183712538694,
                                "logements_total": 2957.41385676639,
                            },
                            {
                                "land_id": "69194",
                                "taux_vacant": 4.0,
                                "logements_vacants": 125.0,
                                "logements_total": 3157.0,
                            },
                            {
                                "land_id": "69199",
                                "taux_vacant": 5.3,
                                "logements_vacants": 434.42538762459,
                                "logements_total": 8168.32639985014,
                            },
                            {
                                "land_id": "69202",
                                "taux_vacant": 5.4,
                                "logements_vacants": 579.80023704497,
                                "logements_total": 10788.1474102924,
                            },
                            {
                                "land_id": "69204",
                                "taux_vacant": 4.1,
                                "logements_vacants": 403.536541959057,
                                "logements_total": 9821.79844274237,
                            },
                            {
                                "land_id": "69205",
                                "taux_vacant": 4.2,
                                "logements_vacants": 93.6153304290531,
                                "logements_total": 2225.72281804488,
                            },
                            {
                                "land_id": "69207",
                                "taux_vacant": 4.3,
                                "logements_vacants": 57.9551679151883,
                                "logements_total": 1353.78796758673,
                            },
                            {
                                "land_id": "69233",
                                "taux_vacant": 5.2,
                                "logements_vacants": 27.3,
                                "logements_total": 528.716122111366,
                            },
                            {
                                "land_id": "69244",
                                "taux_vacant": 5.2,
                                "logements_vacants": 603.407247680698,
                                "logements_total": 11663.1674792776,
                            },
                            {
                                "land_id": "69250",
                                "taux_vacant": 7.3,
                                "logements_vacants": 151.032759304431,
                                "logements_total": 2080.90654262809,
                            },
                            {
                                "land_id": "69256",
                                "taux_vacant": 6.9,
                                "logements_vacants": 1424.29401793511,
                                "logements_total": 20782.3435870754,
                            },
                            {
                                "land_id": "69259",
                                "taux_vacant": 8.4,
                                "logements_vacants": 2523.95856115266,
                                "logements_total": 30188.1188857192,
                            },
                            {
                                "land_id": "69260",
                                "taux_vacant": 5.7,
                                "logements_vacants": 123.184673084476,
                                "logements_total": 2150.73775033771,
                            },
                            {
                                "land_id": "69266",
                                "taux_vacant": 7.9,
                                "logements_vacants": 7197.91696196286,
                                "logements_total": 91641.3155325484,
                            },
                            {
                                "land_id": "69271",
                                "taux_vacant": 3.6,
                                "logements_vacants": 168.720993245554,
                                "logements_total": 4747.43676732576,
                            },
                            {
                                "land_id": "69273",
                                "taux_vacant": 4.1,
                                "logements_vacants": 178.590215376238,
                                "logements_total": 4386.35905585958,
                            },
                            {
                                "land_id": "69275",
                                "taux_vacant": 6.0,
                                "logements_vacants": 825.05997383078,
                                "logements_total": 13763.8954842434,
                            },
                            {
                                "land_id": "69276",
                                "taux_vacant": 6.4,
                                "logements_vacants": 290.846888839697,
                                "logements_total": 4509.92224036611,
                            },
                            {
                                "land_id": "69278",
                                "taux_vacant": 5.0,
                                "logements_vacants": 122.100079558112,
                                "logements_total": 2436.69596933674,
                            },
                            {
                                "land_id": "69279",
                                "taux_vacant": 2.8,
                                "logements_vacants": 70.1942304516482,
                                "logements_total": 2495.09010009391,
                            },
                            {
                                "land_id": "69282",
                                "taux_vacant": 4.1,
                                "logements_vacants": 627.961277497273,
                                "logements_total": 15355.3235721482,
                            },
                            {
                                "land_id": "69283",
                                "taux_vacant": 3.3,
                                "logements_vacants": 182.702402862119,
                                "logements_total": 5594.54959589705,
                            },
                            {
                                "land_id": "69284",
                                "taux_vacant": 3.9,
                                "logements_vacants": 51.971934387454,
                                "logements_total": 1318.11390648557,
                            },
                            {
                                "land_id": "69286",
                                "taux_vacant": 7.6,
                                "logements_vacants": 1016.26559242067,
                                "logements_total": 13395.9992031574,
                            },
                            {
                                "land_id": "69290",
                                "taux_vacant": 7.9,
                                "logements_vacants": 1790.59674266604,
                                "logements_total": 22752.1026267032,
                            },
                            {
                                "land_id": "69292",
                                "taux_vacant": 5.0,
                                "logements_vacants": 174.0,
                                "logements_total": 3457.0,
                            },
                            {
                                "land_id": "69293",
                                "taux_vacant": 3.3,
                                "logements_vacants": 31.2517528631219,
                                "logements_total": 939.815448124758,
                            },
                            {
                                "land_id": "69296",
                                "taux_vacant": 5.4,
                                "logements_vacants": 70.0,
                                "logements_total": 1307.0,
                            },
                        ],
                        "joinBy": ["land_id"],
                        "colorKey": "taux_vacant",
                        "opacity": 1,
                        "showInLegend": False,
                        "borderColor": "#999999",
                        "borderWidth": 1,
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Taux de vacance: {point.taux_vacant:.1f}%",
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
                    "filename": "Taux de logements vacants des communes - Métropole de Lyon (2022)",
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
                "headers": ["Logements vacants", "Taux de vacance (%)", "Territoire", "Total logements"],
                "boldFirstColumn": True,
                "rows": [
                    {"name": "", "data": ["1,016", "13,396", "7.6%", "Rillieux-la-Pape"]},
                    {"name": "", "data": ["1,158", "106", "9.2%", "Couzon-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,169", "4.8%", "57", "Cailloux-sur-Fontaines"]},
                    {"name": "", "data": ["1,228", "19,938", "6.2%", "Bron"]},
                    {"name": "", "data": ["1,247", "7.9%", "99", "Albigny-sur-Saône"]},
                    {"name": "", "data": ["1,255", "7.6%", "96", "Fontaines-Saint-Martin"]},
                    {"name": "", "data": ["1,307", "5.4%", "70", "Solaize"]},
                    {"name": "", "data": ["1,318", "3.9%", "52", "Montanay"]},
                    {"name": "", "data": ["1,354", "4.3%", "58", "Saint-Germain-au-Mont-d'Or"]},
                    {"name": "", "data": ["1,401", "19,575", "7.2%", "Oullins-Pierre-Bénite"]},
                    {"name": "", "data": ["1,424", "20,782", "6.9%", "Vaulx-en-Velin"]},
                    {"name": "", "data": ["1,440", "5.1%", "74", "Lissieu"]},
                    {"name": "", "data": ["1,514", "5.0%", "76", "Quincieux"]},
                    {"name": "", "data": ["1,602", "4.6%", "74", "Marcy-l'Étoile"]},
                    {"name": "", "data": ["1,674", "23,277", "7.2%", "Caluire-et-Cuire"]},
                    {"name": "", "data": ["1,791", "22,752", "7.9%", "Saint-Priest"]},
                    {"name": "", "data": ["1,854", "12.1%", "224", "Limonest"]},
                    {"name": "", "data": ["1,979", "3.8%", "75", "Charly"]},
                    {"name": "", "data": ["10,788", "5.4%", "580", "Sainte-Foy-lès-Lyon"]},
                    {"name": "", "data": ["11,663", "5.2%", "603", "Tassin-la-Demi-Lune"]},
                    {"name": "", "data": ["11.1%", "2,957", "327", "Saint-Cyr-au-Mont-d'Or"]},
                    {"name": "", "data": ["11.9%", "3,721", "441", "La Mulatière"]},
                    {"name": "", "data": ["122", "2,437", "5.0%", "Genay"]},
                    {"name": "", "data": ["123", "2,151", "5.7%", "Vernaison"]},
                    {"name": "", "data": ["125", "3,157", "4.0%", "Saint-Didier-au-Mont-d'Or"]},
                    {"name": "", "data": ["13,764", "6.0%", "825", "Décines-Charpieu"]},
                    {"name": "", "data": ["15,355", "4.1%", "628", "Meyzieu"]},
                    {"name": "", "data": ["151", "2,081", "7.3%", "La Tour-de-Salvagny"]},
                    {"name": "", "data": ["165", "2,089", "7.9%", "Collonges-au-Mont-d'Or"]},
                    {"name": "", "data": ["169", "3.6%", "4,747", "Chassieu"]},
                    {"name": "", "data": ["174", "3,457", "5.0%", "Sathonay-Camp"]},
                    {"name": "", "data": ["179", "4,386", "4.1%", "Corbas"]},
                    {"name": "", "data": ["183", "3.3%", "5,595", "Mions"]},
                    {"name": "", "data": ["2,226", "4.2%", "94", "Saint-Genis-les-Ollières"]},
                    {"name": "", "data": ["2,495", "2.8%", "70", "Jonage"]},
                    {"name": "", "data": ["2,524", "30,188", "8.4%", "Vénissieux"]},
                    {"name": "", "data": ["2,677", "256", "9.6%", "Charbonnières-les-Bains"]},
                    {"name": "", "data": ["208", "4,257", "4.9%", "Grigny"]},
                    {"name": "", "data": ["21", "4.2%", "501", "Curis-au-Mont-d'Or"]},
                    {"name": "", "data": ["210", "3,547", "5.9%", "Fontaines-sur-Saône"]},
                    {"name": "", "data": ["211", "3,846", "5.5%", "Irigny"]},
                    {"name": "", "data": ["23", "460", "5.1%", "Poleymieux-au-Mont-d'Or"]},
                    {"name": "", "data": ["244", "3,164", "7.7%", "Champagne-au-Mont-d'Or"]},
                    {"name": "", "data": ["267", "4.0%", "6,634", "Francheville"]},
                    {"name": "", "data": ["27", "5.2%", "529", "Saint-Romain-au-Mont-d'Or"]},
                    {"name": "", "data": ["291", "4,510", "6.4%", "Feyzin"]},
                    {"name": "", "data": ["293", "5,902", "5.0%", "Craponne"]},
                    {"name": "", "data": ["294", "4,006", "7.3%", "Dardilly"]},
                    {"name": "", "data": ["3.3%", "31", "940", "Sathonay-Village"]},
                    {"name": "", "data": ["39", "5.8%", "666", "Fleurieu-sur-Saône"]},
                    {"name": "", "data": ["4,275", "423", "9.9%", "Neuville-sur-Saône"]},
                    {"name": "", "data": ["4.1%", "404", "9,822", "Saint-Genis-Laval"]},
                    {"name": "", "data": ["434", "5.3%", "8,168", "Saint-Fons"]},
                    {"name": "", "data": ["46", "649", "7.2%", "Rochetaillée-sur-Saône"]},
                    {"name": "", "data": ["56,922", "637,225", "8.9%", "Lyon"]},
                    {"name": "", "data": ["7,198", "7.9%", "91,641", "Villeurbanne"]},
                    {"name": "", "data": ["787", "8.5%", "9,261", "Givors"]},
                    {"name": "", "data": ["818", "9,126", "9.0%", "Écully"]},
                ],
            },
        }
    )
