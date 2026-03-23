# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_conso_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_logement_conso_map/EPCI/200046977",
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
                    "text": "Rythmes annuels de consommation et évolution annuelle du parc de logements des communes - Métropole de Lyon (2011-2022)"
                },
                "subtitle": {
                    "text": "Croisement entre évolution annuelle du parc de logements et la consommation annuelle pour l'habitat NAF"
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
                    "indic_t1": 0.43,
                    "indic_t2": 1.04,
                    "conso_min": 0.0,
                    "conso_max": 0.2519,
                    "indic_min": 0.46,
                    "indic_max": 6.44,
                    "conso_label": "Consommation annuelle pour l'habitat",
                    "indicator_name": "Évolution annuelle du parc de logements",
                    "indicator_short": "évolution annuelle logements",
                    "indicator_unit": "%",
                    "indicator_gender": "f",
                    "verdicts": [
                        [
                            "Consommation et construction dans la moyenne : situation intermédiaire.",
                            "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                            "Consommation modérée pour une faible construction : étalement sans réelle demande.",
                        ],
                        [
                            "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                            "Forte consommation pour une construction modérée : étalement disproportionné.",
                            "Forte consommation sans construction significative : étalement non justifié par le logement.",
                        ],
                        [
                            "Peu de consommation avec une construction modérée : urbanisme maîtrisé.",
                            "Peu de consommation et faible construction : territoire à faible dynamique immobilière.",
                            "Peu de consommation malgré une forte construction : densification exemplaire.",
                        ],
                    ],
                    "colors": [
                        ["#084594", "#5387ba", "#9ecae1"],
                        ["#82818c", "#a1858b", "#c08a8a"],
                        ["#e34a33", "#f0845c", "#fdbe85"],
                    ],
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {
                    "dataClasses": [
                        {
                            "from": 2,
                            "to": 2,
                            "color": "#084594",
                            "name": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                        },
                        {
                            "from": 1,
                            "to": 1,
                            "color": "#5387ba",
                            "name": "Consommation parmi les plus faibles, évolution annuelle logements intermédiaire",
                        },
                        {
                            "from": 5,
                            "to": 5,
                            "color": "#82818c",
                            "name": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                        },
                        {
                            "from": 0,
                            "to": 0,
                            "color": "#9ecae1",
                            "name": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus faibles",
                        },
                        {
                            "from": 4,
                            "to": 4,
                            "color": "#a1858b",
                            "name": "Consommation intermédiaire, évolution annuelle logements intermédiaire",
                        },
                        {
                            "from": 3,
                            "to": 3,
                            "color": "#c08a8a",
                            "name": "Consommation intermédiaire, évolution annuelle logements parmi les plus faibles",
                        },
                        {
                            "from": 6,
                            "to": 6,
                            "color": "#e34a33",
                            "name": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus faibles",
                        },
                        {
                            "from": 7,
                            "to": 7,
                            "color": "#f0845c",
                            "name": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                        },
                        {
                            "from": 8,
                            "to": 8,
                            "color": "#fdbe85",
                            "name": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
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
                                "indic_val": 1.0127,
                                "category_id": 1,
                                "color": "#5387ba",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements intermédiaire",
                                "verdict": "Peu de consommation avec une construction modérée : urbanisme maîtrisé.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69142",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.003113,
                                "indic_val": 0.974,
                                "category_id": 1,
                                "color": "#5387ba",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements intermédiaire",
                                "verdict": "Peu de consommation avec une construction modérée : urbanisme maîtrisé.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69266",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.000771,
                                "indic_val": 1.827,
                                "category_id": 2,
                                "color": "#084594",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte construction : densification exemplaire.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69029",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.007206,
                                "indic_val": 1.2027,
                                "category_id": 2,
                                "color": "#084594",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte construction : densification exemplaire.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69256",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.008135,
                                "indic_val": 2.1468,
                                "category_id": 2,
                                "color": "#084594",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte construction : densification exemplaire.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69123",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.007096,
                                "indic_val": 1.2706,
                                "category_id": 2,
                                "color": "#084594",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte construction : densification exemplaire.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69292",
                                "land_type": "COMM",
                                "conso_ha": 0.02,
                                "conso_pct": 0.011084,
                                "indic_val": 6.4441,
                                "category_id": 5,
                                "color": "#82818c",
                                "category_label": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                                "conso_fmt": "0.02",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+6.4%",
                            },
                            {
                                "land_id": "69276",
                                "land_type": "COMM",
                                "conso_ha": 0.13,
                                "conso_pct": 0.01205,
                                "indic_val": 2.1957,
                                "category_id": 5,
                                "color": "#82818c",
                                "category_label": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                                "conso_fmt": "0.13",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69259",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.010867,
                                "indic_val": 2.0837,
                                "category_id": 5,
                                "color": "#82818c",
                                "category_label": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69271",
                                "land_type": "COMM",
                                "conso_ha": 0.22,
                                "conso_pct": 0.019406,
                                "indic_val": 2.4003,
                                "category_id": 5,
                                "color": "#82818c",
                                "category_label": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                                "conso_fmt": "0.22",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69273",
                                "land_type": "COMM",
                                "conso_ha": 0.24,
                                "conso_pct": 0.020199,
                                "indic_val": 1.0557,
                                "category_id": 5,
                                "color": "#82818c",
                                "category_label": "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
                                "conso_fmt": "0.24",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69068",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.043447,
                                "indic_val": 0.4594,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                                "verdict": "Forte consommation pour une construction modérée : étalement disproportionné.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69168",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.120806,
                                "indic_val": 0.7757,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                                "verdict": "Forte consommation pour une construction modérée : étalement disproportionné.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69286",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.0309,
                                "indic_val": 0.9963,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                                "verdict": "Forte consommation pour une construction modérée : étalement disproportionné.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69096",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.13262,
                                "indic_val": 0.9487,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                                "verdict": "Forte consommation pour une construction modérée : étalement disproportionné.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69202",
                                "land_type": "COMM",
                                "conso_ha": 1.18,
                                "conso_pct": 0.172738,
                                "indic_val": 0.8169,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                                "verdict": "Forte consommation pour une construction modérée : étalement disproportionné.",
                                "conso_fmt": "1.18",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69071",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.046836,
                                "indic_val": 1.1544,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69040",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.053845,
                                "indic_val": 2.2064,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69143",
                                "land_type": "COMM",
                                "conso_ha": 0.21,
                                "conso_pct": 0.038031,
                                "indic_val": 1.9687,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.21",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69233",
                                "land_type": "COMM",
                                "conso_ha": 0.23,
                                "conso_pct": 0.090067,
                                "indic_val": 1.5192,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.23",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69149",
                                "land_type": "COMM",
                                "conso_ha": 0.31,
                                "conso_pct": 0.035263,
                                "indic_val": 1.2483,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.31",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69296",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.041548,
                                "indic_val": 1.4895,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69085",
                                "land_type": "COMM",
                                "conso_ha": 0.35,
                                "conso_pct": 0.120305,
                                "indic_val": 1.603,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.35",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69081",
                                "land_type": "COMM",
                                "conso_ha": 0.36,
                                "conso_pct": 0.042662,
                                "indic_val": 1.7093,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.36",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69293",
                                "land_type": "COMM",
                                "conso_ha": 0.41,
                                "conso_pct": 0.0808,
                                "indic_val": 1.5306,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.41",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69127",
                                "land_type": "COMM",
                                "conso_ha": 0.43,
                                "conso_pct": 0.079458,
                                "indic_val": 2.2707,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.43",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69260",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.107588,
                                "indic_val": 2.7399,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+2.7%",
                            },
                            {
                                "land_id": "69117",
                                "land_type": "COMM",
                                "conso_ha": 0.48,
                                "conso_pct": 0.084038,
                                "indic_val": 1.2307,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.48",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69153",
                                "land_type": "COMM",
                                "conso_ha": 0.49,
                                "conso_pct": 0.077053,
                                "indic_val": 1.0442,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.49",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69207",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.102054,
                                "indic_val": 1.4743,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69088",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.233953,
                                "indic_val": 1.6751,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69063",
                                "land_type": "COMM",
                                "conso_ha": 0.58,
                                "conso_pct": 0.153458,
                                "indic_val": 2.5903,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.58",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "+2.6%",
                            },
                            {
                                "land_id": "69003",
                                "land_type": "COMM",
                                "conso_ha": 0.59,
                                "conso_pct": 0.225222,
                                "indic_val": 1.9677,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.59",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69034",
                                "land_type": "COMM",
                                "conso_ha": 0.61,
                                "conso_pct": 0.058751,
                                "indic_val": 1.1327,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.61",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69205",
                                "land_type": "COMM",
                                "conso_ha": 0.63,
                                "conso_pct": 0.167218,
                                "indic_val": 1.5524,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.63",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69089",
                                "land_type": "COMM",
                                "conso_ha": 0.68,
                                "conso_pct": 0.082034,
                                "indic_val": 2.1834,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.68",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69087",
                                "land_type": "COMM",
                                "conso_ha": 0.69,
                                "conso_pct": 0.251918,
                                "indic_val": 1.6146,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.69",
                                "conso_pct_fmt": "0.25",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69044",
                                "land_type": "COMM",
                                "conso_ha": 0.72,
                                "conso_pct": 0.176397,
                                "indic_val": 2.2631,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.72",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69275",
                                "land_type": "COMM",
                                "conso_ha": 0.73,
                                "conso_pct": 0.042558,
                                "indic_val": 2.4154,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.73",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69282",
                                "land_type": "COMM",
                                "conso_ha": 0.76,
                                "conso_pct": 0.032571,
                                "indic_val": 2.3565,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.76",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69279",
                                "land_type": "COMM",
                                "conso_ha": 0.77,
                                "conso_pct": 0.063677,
                                "indic_val": 1.7003,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.77",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69244",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.097279,
                                "indic_val": 1.9061,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69204",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.061326,
                                "indic_val": 1.0676,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69100",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.089056,
                                "indic_val": 1.3029,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69033",
                                "land_type": "COMM",
                                "conso_ha": 0.83,
                                "conso_pct": 0.097941,
                                "indic_val": 2.4022,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.83",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69191",
                                "land_type": "COMM",
                                "conso_ha": 0.87,
                                "conso_pct": 0.119341,
                                "indic_val": 2.6705,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.87",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+2.7%",
                            },
                            {
                                "land_id": "69283",
                                "land_type": "COMM",
                                "conso_ha": 0.94,
                                "conso_pct": 0.081019,
                                "indic_val": 2.5399,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "0.94",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.5%",
                            },
                            {
                                "land_id": "69069",
                                "land_type": "COMM",
                                "conso_ha": 1.07,
                                "conso_pct": 0.22693,
                                "indic_val": 2.8835,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.07",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+2.9%",
                            },
                            {
                                "land_id": "69163",
                                "land_type": "COMM",
                                "conso_ha": 1.14,
                                "conso_pct": 0.063403,
                                "indic_val": 2.0259,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.14",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69250",
                                "land_type": "COMM",
                                "conso_ha": 1.15,
                                "conso_pct": 0.136667,
                                "indic_val": 2.1789,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.15",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69072",
                                "land_type": "COMM",
                                "conso_ha": 1.19,
                                "conso_pct": 0.084999,
                                "indic_val": 1.7331,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.19",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69046",
                                "land_type": "COMM",
                                "conso_ha": 1.22,
                                "conso_pct": 0.237179,
                                "indic_val": 1.5148,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.22",
                                "conso_pct_fmt": "0.24",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69091",
                                "land_type": "COMM",
                                "conso_ha": 1.25,
                                "conso_pct": 0.071711,
                                "indic_val": 1.1931,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.25",
                                "conso_pct_fmt": "0.07",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69284",
                                "land_type": "COMM",
                                "conso_ha": 1.31,
                                "conso_pct": 0.180027,
                                "indic_val": 2.6146,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.31",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+2.6%",
                            },
                            {
                                "land_id": "69278",
                                "land_type": "COMM",
                                "conso_ha": 1.44,
                                "conso_pct": 0.166917,
                                "indic_val": 1.7118,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.44",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69290",
                                "land_type": "COMM",
                                "conso_ha": 1.56,
                                "conso_pct": 0.052492,
                                "indic_val": 2.6088,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.56",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+2.6%",
                            },
                            {
                                "land_id": "69194",
                                "land_type": "COMM",
                                "conso_ha": 1.82,
                                "conso_pct": 0.218163,
                                "indic_val": 1.9774,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "1.82",
                                "conso_pct_fmt": "0.22",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69116",
                                "land_type": "COMM",
                                "conso_ha": 2.11,
                                "conso_pct": 0.232648,
                                "indic_val": 3.6103,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                                "verdict": "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
                                "conso_fmt": "2.11",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+3.6%",
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
                            "pointFormat": "<b>{point.name}</b><br/>Évolution annuelle du parc de logements : <b>{point.indic_fmt}</b><br/>Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>",
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
                    "filename": "Rythmes annuels de consommation et évolution annuelle du parc de logements des communes - Métropole de Lyon (2011-2022)",
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
                    "évolution annuelle logements (%/an)",
                ],
                "boldFirstColumn": True,
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                            "Couzon-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                            "Rochetaillée-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                            "Sainte-Foy-lès-Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.13%",
                            "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                            "Grigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle logements intermédiaire",
                            "La Mulatière",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle logements intermédiaire",
                            "Saint-Fons",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle logements intermédiaire",
                            "Rillieux-la-Pape",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Poleymieux-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.02%",
                            "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                            "Corbas",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.06%",
                            "Caluire-et-Cuire",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Genis-Laval",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.01%",
                            "Bron",
                            "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Oullins-Pierre-Bénite",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Curis-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.07%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Givors",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Lissieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.01%",
                            "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                            "Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.09%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Irigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Solaize",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Sathonay-Village",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.09%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Romain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.10%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Germain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.24%",
                            "Charly",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Fleurieu-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Genis-les-Ollières",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.25%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Fontaines-Saint-Martin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Écully",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Jonage",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Dardilly",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Genay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Fontaines-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.8%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                            "Villeurbanne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.9%",
                            "0.10%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Tassin-la-Demi-Lune",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.0%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Neuville-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.0%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Quincieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.0%",
                            "0.22%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Didier-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.0%",
                            "0.23%",
                            "Albigny-sur-Saône",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                            "Vénissieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "0.01%",
                            "Consommation parmi les plus faibles, évolution annuelle logements parmi les plus élevées",
                            "Vaulx-en-Velin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.2%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                            "Feyzin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.2%",
                            "0.05%",
                            "Champagne-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.2%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Francheville",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.2%",
                            "0.14%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "La Tour-de-Salvagny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.3%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Marcy-l'Étoile",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.3%",
                            "0.18%",
                            "Charbonnières-les-Bains",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.4%",
                            "0.02%",
                            "Chassieu",
                            "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.4%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Meyzieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.4%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Décines-Charpieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.4%",
                            "0.10%",
                            "Cailloux-sur-Fontaines",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.5%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Mions",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.6%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Priest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.6%",
                            "0.15%",
                            "Collonges-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.6%",
                            "0.18%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Montanay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.7%",
                            "0.11%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Vernaison",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.7%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Saint-Cyr-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.9%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Craponne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+3.6%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle logements parmi les plus élevées",
                            "Limonest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+6.4%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle logements parmi les plus élevées",
                            "Sathonay-Camp",
                        ],
                    },
                ],
            },
        }
    )
