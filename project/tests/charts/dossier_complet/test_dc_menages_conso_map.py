# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_menages_conso_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_menages_conso_map/EPCI/200046977",
        {"child_land_type": "COMM"},
    )
    assert response.status_code == 200
    assert response.json() == snapshot(
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Solaize", "land_id": "69296"},
                            },
                            {
                                "type": "Feature",
                                "geometry": {
                                    "crs": {"type": "name", "properties": {"name": "EPSG:3857"}},
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [540000.0, 5730000.0],
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
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
                                            [541000.0, 5730000.0],
                                            [541000.0, 5731000.0],
                                            [540000.0, 5731000.0],
                                            [540000.0, 5730000.0],
                                        ]
                                    ],
                                },
                                "properties": {"name": "Saint-Romain-au-Mont-d'Or", "land_id": "69233"},
                            },
                        ],
                    }
                },
                "title": {
                    "text": "Rythmes annuels de consommation et évolution du nombre de ménages des communes - Métropole de Lyon (2011-2022)"
                },
                "subtitle": {
                    "text": "Croisement entre évolution du nombre de ménages et la consommation annuelle pour l'habitat NAF"
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
                    "indic_t1": 0.38,
                    "indic_t2": 1.14,
                    "conso_min": 0.0,
                    "conso_max": 0.2519,
                    "indic_min": 0.17,
                    "indic_max": 6.81,
                    "conso_label": "Consommation annuelle pour l'habitat",
                    "indicator_name": "Évolution du nombre de ménages",
                    "indicator_short": "évolution annuelle ménages",
                    "indicator_unit": "%",
                    "indicator_gender": "f",
                    "verdicts": [
                        [
                            "Peu de consommation et faible croissance des ménages : territoire stable et sobre.",
                            "Peu de consommation avec une croissance modérée des ménages : urbanisme bien dimensionné.",
                            "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
                        ],
                        [
                            "Consommation modérée mais peu de ménages supplémentaires : étalement peu justifié par les besoins.",
                            "Consommation et croissance des ménages dans la moyenne du territoire.",
                            "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
                        ],
                        [
                            "Forte consommation sans croissance significative des ménages : l'étalement ne répond pas à un besoin.",
                            "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                            "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                        ],
                    ],
                    "colors": [
                        ["#99d8c9", "#4ca092", "#00695c"],
                        ["#be917e", "#9e9578", "#7e9a73"],
                        ["#e34a33", "#f08b5e", "#fdcc8a"],
                    ],
                },
                "mapNavigation": {"enabled": True},
                "colorAxis": {
                    "dataClasses": [
                        {
                            "from": 0,
                            "to": 0,
                            "color": "#99d8c9",
                            "name": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus faibles",
                        },
                        {
                            "from": 1,
                            "to": 1,
                            "color": "#4ca092",
                            "name": "Consommation parmi les plus faibles, évolution annuelle ménages intermédiaire",
                        },
                        {
                            "from": 2,
                            "to": 2,
                            "color": "#00695c",
                            "name": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                        },
                        {
                            "from": 3,
                            "to": 3,
                            "color": "#be917e",
                            "name": "Consommation intermédiaire, évolution annuelle ménages parmi les plus faibles",
                        },
                        {
                            "from": 4,
                            "to": 4,
                            "color": "#9e9578",
                            "name": "Consommation intermédiaire, évolution annuelle ménages intermédiaire",
                        },
                        {
                            "from": 5,
                            "to": 5,
                            "color": "#7e9a73",
                            "name": "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                        },
                        {
                            "from": 6,
                            "to": 6,
                            "color": "#e34a33",
                            "name": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus faibles",
                        },
                        {
                            "from": 7,
                            "to": 7,
                            "color": "#f08b5e",
                            "name": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        },
                        {
                            "from": 8,
                            "to": 8,
                            "color": "#fdcc8a",
                            "name": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        },
                    ]
                },
                "series": [
                    {
                        "name": "Territoires",
                        "data": [
                            {
                                "land_id": "69286",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.0309,
                                "indic_val": 0.5469,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69081",
                                "land_type": "COMM",
                                "conso_ha": 0.36,
                                "conso_pct": 0.042662,
                                "indic_val": 1.1337,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.36",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69071",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.046836,
                                "indic_val": 1.3253,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69142",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.003113,
                                "indic_val": 0.3477,
                                "category_id": 0,
                                "color": "#99d8c9",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus faibles",
                                "verdict": "Peu de consommation et faible croissance des ménages : territoire stable et sobre.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+0.3%",
                            },
                            {
                                "land_id": "69044",
                                "land_type": "COMM",
                                "conso_ha": 0.72,
                                "conso_pct": 0.176397,
                                "indic_val": 1.8387,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.72",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69033",
                                "land_type": "COMM",
                                "conso_ha": 0.83,
                                "conso_pct": 0.097941,
                                "indic_val": 2.2016,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.83",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69260",
                                "land_type": "COMM",
                                "conso_ha": 0.45,
                                "conso_pct": 0.107588,
                                "indic_val": 2.4863,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.45",
                                "conso_pct_fmt": "0.11",
                                "indic_fmt": "+2.5%",
                            },
                            {
                                "land_id": "69284",
                                "land_type": "COMM",
                                "conso_ha": 1.31,
                                "conso_pct": 0.180027,
                                "indic_val": 2.7195,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.31",
                                "conso_pct_fmt": "0.18",
                                "indic_fmt": "+2.7%",
                            },
                            {
                                "land_id": "69250",
                                "land_type": "COMM",
                                "conso_ha": 1.15,
                                "conso_pct": 0.136667,
                                "indic_val": 1.666,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.15",
                                "conso_pct_fmt": "0.14",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69256",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.008135,
                                "indic_val": 2.0804,
                                "category_id": 2,
                                "color": "#00695c",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69244",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.097279,
                                "indic_val": 1.8008,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+1.8%",
                            },
                            {
                                "land_id": "69278",
                                "land_type": "COMM",
                                "conso_ha": 1.44,
                                "conso_pct": 0.166917,
                                "indic_val": 1.5379,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.44",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69089",
                                "land_type": "COMM",
                                "conso_ha": 0.68,
                                "conso_pct": 0.082034,
                                "indic_val": 2.1827,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.68",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.2%",
                            },
                            {
                                "land_id": "69091",
                                "land_type": "COMM",
                                "conso_ha": 1.25,
                                "conso_pct": 0.071711,
                                "indic_val": 0.9356,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "1.25",
                                "conso_pct_fmt": "0.07",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69205",
                                "land_type": "COMM",
                                "conso_ha": 0.63,
                                "conso_pct": 0.167218,
                                "indic_val": 1.4928,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.63",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69153",
                                "land_type": "COMM",
                                "conso_ha": 0.49,
                                "conso_pct": 0.077053,
                                "indic_val": 1.3278,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.49",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69029",
                                "land_type": "COMM",
                                "conso_ha": 0.07,
                                "conso_pct": 0.007206,
                                "indic_val": 1.27,
                                "category_id": 2,
                                "color": "#00695c",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
                                "conso_fmt": "0.07",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69163",
                                "land_type": "COMM",
                                "conso_ha": 1.14,
                                "conso_pct": 0.063403,
                                "indic_val": 1.9829,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.14",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69068",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.043447,
                                "indic_val": 0.1702,
                                "category_id": 6,
                                "color": "#e34a33",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus faibles",
                                "verdict": "Forte consommation sans croissance significative des ménages : l'étalement ne répond pas à un besoin.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+0.2%",
                            },
                            {
                                "land_id": "69127",
                                "land_type": "COMM",
                                "conso_ha": 0.43,
                                "conso_pct": 0.079458,
                                "indic_val": 2.2702,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.43",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69292",
                                "land_type": "COMM",
                                "conso_ha": 0.02,
                                "conso_pct": 0.011084,
                                "indic_val": 6.8133,
                                "category_id": 5,
                                "color": "#7e9a73",
                                "category_label": "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
                                "conso_fmt": "0.02",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+6.8%",
                            },
                            {
                                "land_id": "69271",
                                "land_type": "COMM",
                                "conso_ha": 0.22,
                                "conso_pct": 0.019406,
                                "indic_val": 2.2573,
                                "category_id": 5,
                                "color": "#7e9a73",
                                "category_label": "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
                                "conso_fmt": "0.22",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69117",
                                "land_type": "COMM",
                                "conso_ha": 0.48,
                                "conso_pct": 0.084038,
                                "indic_val": 1.0662,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.48",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69063",
                                "land_type": "COMM",
                                "conso_ha": 0.58,
                                "conso_pct": 0.153458,
                                "indic_val": 2.3627,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.58",
                                "conso_pct_fmt": "0.15",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69273",
                                "land_type": "COMM",
                                "conso_ha": 0.24,
                                "conso_pct": 0.020199,
                                "indic_val": 0.8481,
                                "category_id": 4,
                                "color": "#9e9578",
                                "category_label": "Consommation intermédiaire, évolution annuelle ménages intermédiaire",
                                "verdict": "Consommation et croissance des ménages dans la moyenne du territoire.",
                                "conso_fmt": "0.24",
                                "conso_pct_fmt": "0.02",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69266",
                                "land_type": "COMM",
                                "conso_ha": 0.01,
                                "conso_pct": 0.000771,
                                "indic_val": 1.5278,
                                "category_id": 2,
                                "color": "#00695c",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
                                "conso_fmt": "0.01",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69168",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.120806,
                                "indic_val": 0.5477,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+0.5%",
                            },
                            {
                                "land_id": "69296",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.041548,
                                "indic_val": 1.6816,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69087",
                                "land_type": "COMM",
                                "conso_ha": 0.69,
                                "conso_pct": 0.251918,
                                "indic_val": 1.2281,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.69",
                                "conso_pct_fmt": "0.25",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69123",
                                "land_type": "COMM",
                                "conso_ha": 0.34,
                                "conso_pct": 0.007096,
                                "indic_val": 0.8906,
                                "category_id": 1,
                                "color": "#4ca092",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages intermédiaire",
                                "verdict": "Peu de consommation avec une croissance modérée des ménages : urbanisme bien dimensionné.",
                                "conso_fmt": "0.34",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69279",
                                "land_type": "COMM",
                                "conso_ha": 0.77,
                                "conso_pct": 0.063677,
                                "indic_val": 1.5883,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.77",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69116",
                                "land_type": "COMM",
                                "conso_ha": 2.11,
                                "conso_pct": 0.232648,
                                "indic_val": 2.7512,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "2.11",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+2.8%",
                            },
                            {
                                "land_id": "69290",
                                "land_type": "COMM",
                                "conso_ha": 1.56,
                                "conso_pct": 0.052492,
                                "indic_val": 2.0649,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.56",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69259",
                                "land_type": "COMM",
                                "conso_ha": 0.17,
                                "conso_pct": 0.010867,
                                "indic_val": 1.5934,
                                "category_id": 5,
                                "color": "#7e9a73",
                                "category_label": "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
                                "conso_fmt": "0.17",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69293",
                                "land_type": "COMM",
                                "conso_ha": 0.41,
                                "conso_pct": 0.0808,
                                "indic_val": 1.3206,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.41",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69204",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.061326,
                                "indic_val": 1.155,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69143",
                                "land_type": "COMM",
                                "conso_ha": 0.21,
                                "conso_pct": 0.038031,
                                "indic_val": 1.4721,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.21",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.5%",
                            },
                            {
                                "land_id": "69149",
                                "land_type": "COMM",
                                "conso_ha": 0.31,
                                "conso_pct": 0.035263,
                                "indic_val": 1.204,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.31",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+1.2%",
                            },
                            {
                                "land_id": "69072",
                                "land_type": "COMM",
                                "conso_ha": 1.19,
                                "conso_pct": 0.084999,
                                "indic_val": 1.3269,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.19",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+1.3%",
                            },
                            {
                                "land_id": "69283",
                                "land_type": "COMM",
                                "conso_ha": 0.94,
                                "conso_pct": 0.081019,
                                "indic_val": 2.353,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.94",
                                "conso_pct_fmt": "0.08",
                                "indic_fmt": "+2.4%",
                            },
                            {
                                "land_id": "69046",
                                "land_type": "COMM",
                                "conso_ha": 1.22,
                                "conso_pct": 0.237179,
                                "indic_val": 1.5992,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.22",
                                "conso_pct_fmt": "0.24",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69191",
                                "land_type": "COMM",
                                "conso_ha": 0.87,
                                "conso_pct": 0.119341,
                                "indic_val": 1.717,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.87",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69275",
                                "land_type": "COMM",
                                "conso_ha": 0.73,
                                "conso_pct": 0.042558,
                                "indic_val": 2.065,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.73",
                                "conso_pct_fmt": "0.04",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69069",
                                "land_type": "COMM",
                                "conso_ha": 1.07,
                                "conso_pct": 0.22693,
                                "indic_val": 2.8851,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.07",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+2.9%",
                            },
                            {
                                "land_id": "69282",
                                "land_type": "COMM",
                                "conso_ha": 0.76,
                                "conso_pct": 0.032571,
                                "indic_val": 2.2754,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.76",
                                "conso_pct_fmt": "0.03",
                                "indic_fmt": "+2.3%",
                            },
                            {
                                "land_id": "69100",
                                "land_type": "COMM",
                                "conso_ha": 0.79,
                                "conso_pct": 0.089056,
                                "indic_val": 1.0964,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.79",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+1.1%",
                            },
                            {
                                "land_id": "69040",
                                "land_type": "COMM",
                                "conso_ha": 0.14,
                                "conso_pct": 0.053845,
                                "indic_val": 1.9125,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.14",
                                "conso_pct_fmt": "0.05",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69233",
                                "land_type": "COMM",
                                "conso_ha": 0.23,
                                "conso_pct": 0.090067,
                                "indic_val": 1.9084,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.23",
                                "conso_pct_fmt": "0.09",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69003",
                                "land_type": "COMM",
                                "conso_ha": 0.59,
                                "conso_pct": 0.225222,
                                "indic_val": 2.1076,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.59",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+2.1%",
                            },
                            {
                                "land_id": "69199",
                                "land_type": "COMM",
                                "conso_ha": 0.0,
                                "conso_pct": 0.0,
                                "indic_val": 0.9782,
                                "category_id": 1,
                                "color": "#4ca092",
                                "category_label": "Consommation parmi les plus faibles, évolution annuelle ménages intermédiaire",
                                "verdict": "Peu de consommation avec une croissance modérée des ménages : urbanisme bien dimensionné.",
                                "conso_fmt": "0.00",
                                "conso_pct_fmt": "0.00",
                                "indic_fmt": "+1.0%",
                            },
                            {
                                "land_id": "69085",
                                "land_type": "COMM",
                                "conso_ha": 0.35,
                                "conso_pct": 0.120305,
                                "indic_val": 1.723,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.35",
                                "conso_pct_fmt": "0.12",
                                "indic_fmt": "+1.7%",
                            },
                            {
                                "land_id": "69088",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.233953,
                                "indic_val": 1.6413,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.23",
                                "indic_fmt": "+1.6%",
                            },
                            {
                                "land_id": "69096",
                                "land_type": "COMM",
                                "conso_ha": 0.78,
                                "conso_pct": 0.13262,
                                "indic_val": 0.8974,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.78",
                                "conso_pct_fmt": "0.13",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69202",
                                "land_type": "COMM",
                                "conso_ha": 1.18,
                                "conso_pct": 0.172738,
                                "indic_val": 0.828,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "1.18",
                                "conso_pct_fmt": "0.17",
                                "indic_fmt": "+0.8%",
                            },
                            {
                                "land_id": "69276",
                                "land_type": "COMM",
                                "conso_ha": 0.13,
                                "conso_pct": 0.01205,
                                "indic_val": 2.0214,
                                "category_id": 5,
                                "color": "#7e9a73",
                                "category_label": "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
                                "conso_fmt": "0.13",
                                "conso_pct_fmt": "0.01",
                                "indic_fmt": "+2.0%",
                            },
                            {
                                "land_id": "69034",
                                "land_type": "COMM",
                                "conso_ha": 0.61,
                                "conso_pct": 0.058751,
                                "indic_val": 0.9363,
                                "category_id": 7,
                                "color": "#f08b5e",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                                "verdict": "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
                                "conso_fmt": "0.61",
                                "conso_pct_fmt": "0.06",
                                "indic_fmt": "+0.9%",
                            },
                            {
                                "land_id": "69194",
                                "land_type": "COMM",
                                "conso_ha": 1.82,
                                "conso_pct": 0.218163,
                                "indic_val": 1.9291,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "1.82",
                                "conso_pct_fmt": "0.22",
                                "indic_fmt": "+1.9%",
                            },
                            {
                                "land_id": "69207",
                                "land_type": "COMM",
                                "conso_ha": 0.55,
                                "conso_pct": 0.102054,
                                "indic_val": 1.6304,
                                "category_id": 8,
                                "color": "#fdcc8a",
                                "category_label": "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                                "verdict": "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
                                "conso_fmt": "0.55",
                                "conso_pct_fmt": "0.10",
                                "indic_fmt": "+1.6%",
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
                            "pointFormat": "<b>{point.name}</b><br/>Évolution du nombre de ménages : <b>{point.indic_fmt}</b><br/>Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>",
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
                    "filename": "Rythmes annuels de consommation et évolution du nombre de ménages des communes - Métropole de Lyon (2011-2022)",
                    "url": "https://highcharts-export.osc-fr1.scalingo.io",
                    "chartOptions": {"chart": {"style": {"fontSize": "8px"}}},
                },
                "colors": [
                    "#6a6af4",
                    "#8ecac7",
                    "#eeb088",
                    "#cab8ee",
                    "#6b8abc",
                    "#86cdf2",
                    "#fd8970",
                    "#c9e7c9",
                    "#f5d3b5",
                    "#91e8e1",
                    "#4e9c79",
                    "#bce3f9",
                ],
            },
            "data_table": {
                "headers": [
                    "Commune",
                    "évolution annuelle ménages (%/an)",
                    "Consommation annuelle pour l'habitat 2011-2022 (%/an)",
                    "Catégorie",
                ],
                "boldFirstColumn": True,
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "Rillieux-la-Pape",
                            "+0.5%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Écully",
                            "+1.1%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Curis-au-Mont-d'Or",
                            "+1.3%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "La Mulatière",
                            "+0.3%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Charbonnières-les-Bains",
                            "+1.8%",
                            "0.18%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Cailloux-sur-Fontaines",
                            "+2.2%",
                            "0.10%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Vernaison",
                            "+2.5%",
                            "0.11%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Montanay",
                            "+2.7%",
                            "0.18%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "La Tour-de-Salvagny",
                            "+1.7%",
                            "0.14%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Vaulx-en-Velin",
                            "+2.1%",
                            "0.01%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Tassin-la-Demi-Lune",
                            "+1.8%",
                            "0.10%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Genay",
                            "+1.5%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Francheville",
                            "+2.2%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Givors",
                            "+0.9%",
                            "0.07%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Genis-les-Ollières",
                            "+1.5%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Poleymieux-au-Mont-d'Or",
                            "+1.3%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Bron",
                            "+1.3%",
                            "0.01%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Quincieux",
                            "+2.0%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Couzon-au-Mont-d'Or",
                            "+0.2%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus faibles",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Marcy-l'Étoile",
                            "+2.3%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Sathonay-Camp",
                            "+6.8%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Chassieu",
                            "+2.3%",
                            "0.02%",
                            "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Lissieu",
                            "+1.1%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Collonges-au-Mont-d'Or",
                            "+2.4%",
                            "0.15%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Corbas",
                            "+0.8%",
                            "0.02%",
                            "Consommation intermédiaire, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Villeurbanne",
                            "+1.5%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Rochetaillée-sur-Saône",
                            "+0.5%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Solaize",
                            "+1.7%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Fontaines-Saint-Martin",
                            "+1.2%",
                            "0.25%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Lyon",
                            "+0.9%",
                            "0.01%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Jonage",
                            "+1.6%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Limonest",
                            "+2.8%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Priest",
                            "+2.1%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Vénissieux",
                            "+1.6%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Sathonay-Village",
                            "+1.3%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Genis-Laval",
                            "+1.2%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Neuville-sur-Saône",
                            "+1.5%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Oullins-Pierre-Bénite",
                            "+1.2%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Dardilly",
                            "+1.3%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Mions",
                            "+2.4%",
                            "0.08%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Charly",
                            "+1.6%",
                            "0.24%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Cyr-au-Mont-d'Or",
                            "+1.7%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Décines-Charpieu",
                            "+2.1%",
                            "0.04%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Craponne",
                            "+2.9%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Meyzieu",
                            "+2.3%",
                            "0.03%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Irigny",
                            "+1.1%",
                            "0.09%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Champagne-au-Mont-d'Or",
                            "+1.9%",
                            "0.05%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Romain-au-Mont-d'Or",
                            "+1.9%",
                            "0.09%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Albigny-sur-Saône",
                            "+2.1%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Fons",
                            "+1.0%",
                            "0.00%",
                            "Consommation parmi les plus faibles, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Fleurieu-sur-Saône",
                            "+1.7%",
                            "0.12%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Fontaines-sur-Saône",
                            "+1.6%",
                            "0.23%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Grigny",
                            "+0.9%",
                            "0.13%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Sainte-Foy-lès-Lyon",
                            "+0.8%",
                            "0.17%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Feyzin",
                            "+2.0%",
                            "0.01%",
                            "Consommation intermédiaire, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Caluire-et-Cuire",
                            "+0.9%",
                            "0.06%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages intermédiaire",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Didier-au-Mont-d'Or",
                            "+1.9%",
                            "0.22%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "Saint-Germain-au-Mont-d'Or",
                            "+1.6%",
                            "0.10%",
                            "Consommation parmi les plus élevées, évolution annuelle ménages parmi les plus élevées",
                        ],
                    },
                ],
            },
        }
    )
