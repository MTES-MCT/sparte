# flake8: noqa: E501
from inline_snapshot import snapshot


def test_comparison_map(client, hauts_de_seine):
    response = client.get(
        "/api/chart/comparison_map/DEPART/92",
        {"start_date": 2015, "end_date": 2020},
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
                "legend": {
                    "title": {"text": "Consommation relative à la surface (%)"},
                    "backgroundColor": "#ffffff",
                    "bubbleLegend": {
                        "enabled": True,
                        "borderWidth": 1,
                        "legendIndex": 100,
                        "labels": {"format": "{value:.0f} ha"},
                        "color": "transparent",
                        "borderColor": "#000",
                        "connectorDistance": 40,
                        "connectorColor": "#000",
                    },
                },
                "chart": {
                    "map": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "id": 36240,
                                "properties": {"land_id": "92", "name": "Hauts-de-Seine"},
                                "geometry": {
                                    "type": "MultiPolygon",
                                    "coordinates": [
                                        [
                                            [
                                                [258248.6589903632, 6257988.348299641],
                                                [247598.93827928157, 6250042.731247349],
                                                [259585.70469200247, 6243868.823320456],
                                                [258341.44817407973, 6232337.9175099125],
                                                [257617.42631585497, 6229224.997527156],
                                                [253795.46334305694, 6229635.501205812],
                                                [253376.74200533848, 6233666.064936843],
                                                [248532.18077116268, 6235255.116951041],
                                                [248311.57335141694, 6236557.603620967],
                                                [248095.51092474372, 6236687.057912617],
                                                [248003.50374901135, 6236879.2582344785],
                                                [247915.75007526047, 6236961.199928469],
                                                [247858.84462218403, 6236955.627300095],
                                                [238886.4536561278, 6247057.02403549],
                                                [239115.89396391402, 6252714.219366181],
                                                [244954.94362410612, 6259371.089946002],
                                                [255011.28378932012, 6266566.13855458],
                                                [259979.9681138232, 6264839.5388951525],
                                                [258248.6589903632, 6257988.348299641],
                                            ]
                                        ]
                                    ],
                                },
                            }
                        ],
                    }
                },
                "title": {
                    "text": "Consommation d'espaces NAF de Hauts-de-Seine et des territoires de comparaison (2015 à 2020)"
                },
                "mapNavigation": {"enabled": False},
                "colorAxis": {
                    "min": 0.17846109414691783,
                    "max": 0.17846109414691783,
                    "minColor": "#FFFFFF",
                    "maxColor": "#6a6af4",
                },
                "series": [
                    {
                        "name": "Consommation relative à la surface",
                        "colorKey": "conso_density_percent",
                        "data": [
                            {
                                "land_id": "92",
                                "conso_density_percent": 0.17846109414691783,
                                "value": 0.17846109414691783,
                                "total_conso_ha": 31.3333,
                                "habitat_ha": 5.5036,
                                "activite_ha": 17.9784,
                                "mixte_ha": 0.5941,
                                "route_ha": 6.4709,
                                "ferroviaire_ha": 0.6211,
                                "borderColor": "#0063CB",
                                "borderWidth": 3,
                            }
                        ],
                        "joinBy": "land_id",
                        "states": {"hover": {"borderColor": "#000", "borderWidth": 2}},
                        "dataLabels": {"enabled": False},
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Consommation relative à la surface: {point.conso_density_percent:,.2f} %<br/>",
                        },
                    },
                    {
                        "name": "Consommation totale",
                        "type": "mapbubble",
                        "data": [
                            {
                                "land_id": "92",
                                "z": 31.3333,
                                "color": "#6a6af4",
                                "total_conso_ha": 31.3333,
                                "habitat_ha": 5.5036,
                                "activite_ha": 17.9784,
                                "mixte_ha": 0.5941,
                                "route_ha": 6.4709,
                                "ferroviaire_ha": 0.6211,
                                "inconnu_ha": 0.1652,
                                "conso_density_percent": 0.17846109414691783,
                            }
                        ],
                        "joinBy": ["land_id"],
                        "showInLegend": True,
                        "maxSize": 50,
                        "marker": {"fillOpacity": 0.5},
                        "color": "#6a6af4",
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Consommation totale: {point.total_conso_ha:,.1f} ha<br/>",
                        },
                    },
                ],
                "navigation": {"buttonOptions": {"enabled": False}},
                "credits": {"enabled": False},
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
                    "filename": "Consommation d'espaces NAF de Hauts-de-Seine et des territoires de comparaison (2015 à 2020)",
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
                    "Territoire",
                    "Type",
                    "Consommation relative à la surface (%) - 2015 à 2020",
                    "Consommation totale (ha) - 2015 à 2020",
                    "Habitat (ha)",
                    "Activité (ha)",
                    "Mixte (ha)",
                    "Route (ha)",
                    "Ferroviaire (ha)",
                    "Inconnu (ha)",
                ],
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "Hauts-de-Seine (principal)",
                            "Département",
                            0.18,
                            31.33,
                            5.5,
                            17.98,
                            0.59,
                            6.47,
                            0.62,
                            0.17,
                        ],
                    }
                ],
            },
        }
    )
