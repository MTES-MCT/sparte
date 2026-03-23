# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_emploi_conso_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_emploi_conso_map/EPCI/200046977",
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
                    "text": "Rythmes annuels de consommation et évolution de l'emploi des communes - Métropole de Lyon (2011-2022)"
                },
                "subtitle": {
                    "text": "Croisement entre évolution de l'emploi et la consommation annuelle pour l'activité NAF"
                },
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "custom": {
                    "conso_t1": 0.0,
                    "conso_t2": 0.0027,
                    "indic_t1": -0.33,
                    "indic_t2": 0.78,
                    "conso_min": 0.0,
                    "conso_max": 0.3429,
                    "indic_min": -0.54,
                    "indic_max": 7.67,
                    "conso_label": "Consommation annuelle pour l'activité",
                    "indicator_name": "Évolution de l'emploi",
                    "indicator_short": "évolution annuelle emploi",
                    "indicator_unit": "%",
                    "indicator_gender": "f",
                    "verdicts": [
                        [
                            "Consommation et emploi dans la moyenne du territoire.",
                            "Consommation modérée accompagnée d'une bonne dynamique d'emploi.",
                            "Consommation modérée sans dynamique d'emploi : étalement peu justifié par l'activité économique.",
                        ],
                        [
                            "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                            "Forte consommation pour un développement économique limité.",
                            "Forte consommation sans création d'emploi : étalement non justifié par l'activité économique.",
                        ],
                        [
                            "Peu de consommation avec un emploi stable : sobriété foncière dans un contexte modéré.",
                            "Peu de consommation et emploi en recul : territoire en retrait mais économe en foncier.",
                            "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
                        ],
                    ],
                    "colors": [
                        ["#4a1486", "#7f66af", "#b5b8d9"],
                        ["#a36985", "#b77585", "#cc8186"],
                        ["#e34a33", "#f0845c", "#fdbe85"],
                    ],
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {
                    "dataClasses": [
                        {
                            "from": 2,
                            "to": 2,
                            "color": "#4a1486",
                            "name": "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                        },
                        {
                            "from": 1,
                            "to": 1,
                            "color": "#7f66af",
                            "name": "Consommation parmi les plus faibles, évolution annuelle emploi intermédiaire",
                        },
                        {
                            "from": 5,
                            "to": 5,
                            "color": "#a36985",
                            "name": "Consommation intermédiaire, évolution annuelle emploi parmi les plus élevées",
                        },
                        {
                            "from": 0,
                            "to": 0,
                            "color": "#b5b8d9",
                            "name": "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus faibles",
                        },
                        {
                            "from": 4,
                            "to": 4,
                            "color": "#b77585",
                            "name": "Consommation intermédiaire, évolution annuelle emploi intermédiaire",
                        },
                        {
                            "from": 3,
                            "to": 3,
                            "color": "#cc8186",
                            "name": "Consommation intermédiaire, évolution annuelle emploi parmi les plus faibles",
                        },
                        {
                            "from": 6,
                            "to": 6,
                            "color": "#e34a33",
                            "name": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus faibles",
                        },
                        {
                            "from": 7,
                            "to": 7,
                            "color": "#f0845c",
                            "name": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                        },
                        {
                            "from": 8,
                            "to": 8,
                            "color": "#fdbe85",
                            "name": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        },
                    ]
                },
                "series": [
                    {
                        "name": "Territoires",
                        "data": [
                            {
                                "land_id": "69068",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 0.114,
                                "category_id": 1,
                                "color": "#7f66af",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle emploi intermédiaire",
                                "verdict": "Peu de consommation avec un emploi stable : sobriété foncière dans un contexte modéré.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69142",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 0.2833,
                                "category_id": 1,
                                "color": "#7f66af",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle emploi intermédiaire",
                                "verdict": "Peu de consommation avec un emploi stable : sobriété foncière dans un contexte modéré.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69071",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 0.799,
                                "category_id": 2,
                                "color": "#4a1486",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69003",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 1.4172,
                                "category_id": 2,
                                "color": "#4a1486",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69260",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 1.6974,
                                "category_id": 2,
                                "color": "#4a1486",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69296",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.000193,
                                "indic_val": 0.9335,
                                "category_id": 5,
                                "color": "#a36985",
                                "category_label": "Consommation intermédiaire, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Consommation modérée accompagnée d'une bonne dynamique d'emploi.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69273",
                                "land_type": "COMM",
                                "conso_ha": 4.06,
                                "conso_pct": 0.342851,
                                "indic_val": -0.5395,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus faibles",
                                "verdict": "Forte consommation sans création d'emploi : étalement non justifié par l'activité économique.",
                                "conso_fmt": "4.06",
                                "conso_pct_fmt": "0.34",
                                "indic_fmt": "-0.5%",
                            },
                            {
                                "land_id": "69168",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.007739,
                                "indic_val": 0.0804,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69046",
                                "land_type": "COMM",
                                "conso_ha": 0.02,
                                "conso_pct": 0.004461,
                                "indic_val": 0.6384,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.02",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.6%",
                            },
                            {
                                "land_id": "69087",
                                "land_type": "COMM",
                                "conso_ha": 0.02,
                                "conso_pct": 0.006052,
                                "indic_val": 0.45,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.02",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69088",
                                "land_type": "COMM",
                                "conso_ha": 0.03,
                                "conso_pct": 0.013959,
                                "indic_val": 0.754,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.03",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69117",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.012717,
                                "indic_val": 0.09,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69207",
                                "land_type": "COMM",
                                "conso_ha": 0.08,
                                "conso_pct": 0.01529,
                                "indic_val": 0.5642,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.08",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+0.6%",
                            },
                            {
                                "land_id": "69072",
                                "land_type": "COMM",
                                "conso_ha": 0.16,
                                "conso_pct": 0.011369,
                                "indic_val": -0.0962,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.16",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "-0.1%",
                            },
                            {
                                "land_id": "69202",
                                "land_type": "COMM",
                                "conso_ha": 0.19,
                                "conso_pct": 0.028445,
                                "indic_val": -0.267,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.19",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "-0.3%",
                            },
                            {
                                "land_id": "69293",
                                "land_type": "COMM",
                                "conso_ha": 0.2,
                                "conso_pct": 0.039392,
                                "indic_val": 0.4712,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.20",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69204",
                                "land_type": "COMM",
                                "conso_ha": 0.21,
                                "conso_pct": 0.016495,
                                "indic_val": 0.0804,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.21",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69081",
                                "land_type": "COMM",
                                "conso_ha": 0.27,
                                "conso_pct": 0.031911,
                                "indic_val": 0.2702,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.27",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69091",
                                "land_type": "COMM",
                                "conso_ha": 0.28,
                                "conso_pct": 0.015893,
                                "indic_val": 0.674,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.28",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69096",
                                "land_type": "COMM",
                                "conso_ha": 0.29,
                                "conso_pct": 0.049853,
                                "indic_val": 0.6738,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.29",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+0.7%",
                            },
                            {
                                "land_id": "69278",
                                "land_type": "COMM",
                                "conso_ha": 0.5,
                                "conso_pct": 0.058123,
                                "indic_val": 0.283,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.50",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69286",
                                "land_type": "COMM",
                                "conso_ha": 0.54,
                                "conso_pct": 0.037294,
                                "indic_val": 0.2074,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.54",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+0.2%",
                            },
                            {
                                "land_id": "69276",
                                "land_type": "COMM",
                                "conso_ha": 0.62,
                                "conso_pct": 0.059174,
                                "indic_val": 0.0904,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.62",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+0.1%",
                            },
                            {
                                "land_id": "69100",
                                "land_type": "COMM",
                                "conso_ha": 0.99,
                                "conso_pct": 0.111602,
                                "indic_val": 0.3976,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "0.99",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+0.4%",
                            },
                            {
                                "land_id": "69127",
                                "land_type": "COMM",
                                "conso_ha": 1.05,
                                "conso_pct": 0.196097,
                                "indic_val": 0.7696,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "1.05",
                                "conso_pct_fmt": "0.20",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69279",
                                "land_type": "COMM",
                                "conso_ha": 3.53,
                                "conso_pct": 0.292562,
                                "indic_val": 0.2601,
                                "category_id": 7,
                                "color": "#f0845c",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                                "verdict": "Forte consommation pour un développement économique limité.",
                                "conso_fmt": "3.53",
                                "conso_pct_fmt": "0.29",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69233",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.002777,
                                "indic_val": 1.668,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69063",
                                "land_type": "COMM",
                                "conso_ha": 0.04,
                                "conso_pct": 0.009351,
                                "indic_val": 1.6985,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.04",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69205",
                                "land_type": "COMM",
                                "conso_ha": 0.04,
                                "conso_pct": 0.009578,
                                "indic_val": 1.2851,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.04",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69199",
                                "land_type": "COMM",
                                "conso_ha": 0.06,
                                "conso_pct": 0.009841,
                                "indic_val": 1.5676,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.06",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69149",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.007723,
                                "indic_val": 1.0061,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69033",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.00776,
                                "indic_val": 1.4117,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69085",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.023717,
                                "indic_val": 1.2245,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69266",
                                "land_type": "COMM",
                                "conso_ha": 0.09,
                                "conso_pct": 0.005768,
                                "indic_val": 1.4962,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.09",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69069",
                                "land_type": "COMM",
                                "conso_ha": 0.09,
                                "conso_pct": 0.019724,
                                "indic_val": 1.8345,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.09",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69044",
                                "land_type": "COMM",
                                "conso_ha": 0.09,
                                "conso_pct": 0.021804,
                                "indic_val": 1.2825,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.09",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69292",
                                "land_type": "COMM",
                                "conso_ha": 0.09,
                                "conso_pct": 0.044924,
                                "indic_val": 7.6702,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.09",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+7.7%",
                            },
                            {
                                "land_id": "69284",
                                "land_type": "COMM",
                                "conso_ha": 0.1,
                                "conso_pct": 0.013588,
                                "indic_val": 1.4627,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.10",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69194",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.020296,
                                "indic_val": 2.0341,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69089",
                                "land_type": "COMM",
                                "conso_ha": 0.18,
                                "conso_pct": 0.021623,
                                "indic_val": 1.5948,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.18",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69256",
                                "land_type": "COMM",
                                "conso_ha": 0.2,
                                "conso_pct": 0.009739,
                                "indic_val": 2.347,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.20",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69123",
                                "land_type": "COMM",
                                "conso_ha": 0.22,
                                "conso_pct": 0.004681,
                                "indic_val": 0.977,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.22",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69153",
                                "land_type": "COMM",
                                "conso_ha": 0.23,
                                "conso_pct": 0.035672,
                                "indic_val": 1.3157,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.23",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69283",
                                "land_type": "COMM",
                                "conso_ha": 0.25,
                                "conso_pct": 0.021077,
                                "indic_val": 0.9257,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.25",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69244",
                                "land_type": "COMM",
                                "conso_ha": 0.26,
                                "conso_pct": 0.032603,
                                "indic_val": 0.8338,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.26",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69040",
                                "land_type": "COMM",
                                "conso_ha": 0.29,
                                "conso_pct": 0.112789,
                                "indic_val": 2.2386,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.29",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69163",
                                "land_type": "COMM",
                                "conso_ha": 0.46,
                                "conso_pct": 0.025541,
                                "indic_val": 1.8106,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.46",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69271",
                                "land_type": "COMM",
                                "conso_ha": 0.49,
                                "conso_pct": 0.042526,
                                "indic_val": 0.9225,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.49",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69191",
                                "land_type": "COMM",
                                "conso_ha": 0.57,
                                "conso_pct": 0.0783,
                                "indic_val": 1.3572,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.57",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69275",
                                "land_type": "COMM",
                                "conso_ha": 0.63,
                                "conso_pct": 0.037028,
                                "indic_val": 1.7946,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.63",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69143",
                                "land_type": "COMM",
                                "conso_ha": 0.7,
                                "conso_pct": 0.128823,
                                "indic_val": 0.9526,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.70",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69034",
                                "land_type": "COMM",
                                "conso_ha": 0.86,
                                "conso_pct": 0.082667,
                                "indic_val": 1.0908,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.86",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69116",
                                "land_type": "COMM",
                                "conso_ha": 0.86,
                                "conso_pct": 0.09475,
                                "indic_val": 2.7313,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "0.86",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+2.7%",
                            },
                            {
                                "land_id": "69250",
                                "land_type": "COMM",
                                "conso_ha": 1.3,
                                "conso_pct": 0.154601,
                                "indic_val": 2.1194,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "1.30",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69282",
                                "land_type": "COMM",
                                "conso_ha": 1.39,
                                "conso_pct": 0.059489,
                                "indic_val": 2.13,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "1.39",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69259",
                                "land_type": "COMM",
                                "conso_ha": 1.84,
                                "conso_pct": 0.119028,
                                "indic_val": 1.0309,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "1.84",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69029",
                                "land_type": "COMM",
                                "conso_ha": 3.05,
                                "conso_pct": 0.296532,
                                "indic_val": 1.4306,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "3.05",
                                "conso_pct_fmt": "0.30",
                                "indic_fmt": "+1.4%",
                            },
                            {
                                "land_id": "69290",
                                "land_type": "COMM",
                                "conso_ha": 6.37,
                                "conso_pct": 0.214648,
                                "indic_val": 1.6919,
                                "category_id": 8,
                                "color": "#fdbe85",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
                                "conso_fmt": "6.37",
                                "conso_pct_fmt": "0.21",
                                "indic_fmt": "+1.7%",
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
                            "pointFormat": "<b>{point.name}</b><br/>Évolution de l'emploi : <b>{point.indic_fmt}</b><br/>Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>",
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
                    "filename": "Rythmes annuels de consommation et évolution de l'emploi des communes - Métropole de Lyon (2011-2022)",
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
                    "Consommation annuelle pour l'activité 2011-2022 (%/an)",
                    "évolution annuelle emploi (%/an)",
                ],
                "boldFirstColumn": True,
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle emploi intermédiaire",
                            "Couzon-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Lissieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Rochetaillée-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Saint-Genis-Laval",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.1%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Feyzin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.2%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Rillieux-la-Pape",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.3%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle emploi intermédiaire",
                            "La Mulatière",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.3%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Écully",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.3%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Genay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.3%",
                            "0.29%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Jonage",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.4%",
                            "0.11%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Irigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Fontaines-Saint-Martin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.5%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Sathonay-Village",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.6%",
                            "0.00%",
                            "Charly",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.6%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Saint-Germain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Givors",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.7%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Grigny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                            "Curis-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Fontaines-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Tassin-la-Demi-Lune",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.8%",
                            "0.20%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Marcy-l'Étoile",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.00%",
                            "Consommation intermédiaire, évolution annuelle emploi parmi les plus élevées",
                            "Solaize",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Mions",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+0.9%",
                            "0.04%",
                            "Chassieu",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.00%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Oullins-Pierre-Bénite",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Vénissieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.0%",
                            "0.13%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Neuville-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.1%",
                            "0.08%",
                            "Caluire-et-Cuire",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.2%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Fleurieu-sur-Saône",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Genis-les-Ollières",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.02%",
                            "Charbonnières-les-Bains",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.3%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Poleymieux-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "0.00%",
                            "Albigny-sur-Saône",
                            "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "0.01%",
                            "Cailloux-sur-Fontaines",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Cyr-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.4%",
                            "0.30%",
                            "Bron",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Montanay",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.5%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Villeurbanne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Fons",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.6%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Francheville",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.00%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Romain-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle emploi parmi les plus élevées",
                            "Vernaison",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.01%",
                            "Collonges-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.7%",
                            "0.21%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Priest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.8%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Craponne",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.8%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Quincieux",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+1.8%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Décines-Charpieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.0%",
                            "0.02%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Saint-Didier-au-Mont-d'Or",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Meyzieu",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.1%",
                            "0.15%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "La Tour-de-Salvagny",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.2%",
                            "0.11%",
                            "Champagne-au-Mont-d'Or",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.3%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Vaulx-en-Velin",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+2.7%",
                            "0.09%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Limonest",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "+7.7%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus élevées",
                            "Sathonay-Camp",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "-0.1%",
                            "0.01%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Dardilly",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "-0.3%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi intermédiaire",
                            "Sainte-Foy-lès-Lyon",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "-0.5%",
                            "0.34%",
                            "Consommation parmi les plus élevées, évolution annuelle emploi parmi les plus faibles",
                            "Corbas",
                        ],
                    },
                ],
            },
        }
    )
