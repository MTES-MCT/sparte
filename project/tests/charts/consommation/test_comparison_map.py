# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_comparison_map(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/comparison_map/EPCI/200046977",
        {"start_date": 2015, "end_date": 2020},
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
                                "id": 7036,
                                "properties": {"land_id": "200046977", "name": "Métropole de Lyon"},
                                "geometry": {
                                    "type": "MultiPolygon",
                                    "coordinates": [
                                        [
                                            [
                                                [534333.5558077131, 5732403.655048728],
                                                [534333.5558077131, 5732403.655048728],
                                                [534333.5558077131, 5748356.801602935],
                                                [545465.5048870406, 5732403.655048728],
                                                [545465.5048870406, 5748356.801602935],
                                            ]
                                        ]
                                    ],
                                },
                            }
                        ],
                    }
                },
                "title": {
                    "text": "Consommation d'espaces NAF de Métropole de Lyon et des territoires de comparaison (2015 à 2020)"
                },
                "mapNavigation": {"enabled": False},
                "colorAxis": {
                    "min": 0.805705887054088,
                    "max": 0.805705887054088,
                    "minColor": "#FFFFFF",
                    "maxColor": "#6a6af4",
                },
                "series": [
                    {
                        "name": "Consommation totale",
                        "type": "mapbubble",
                        "data": [
                            {
                                "land_id": "200046977",
                                "z": 433.031,
                                "color": "#6a6af4",
                                "conso_density_percent": 0.805705887054088,
                                "total_conso_ha": 433.031,
                                "habitat_ha": 176.8584,
                                "activite_ha": 191.6679,
                                "mixte_ha": 10.2102,
                                "inconnu_ha": 14.4055,
                                "route_ha": 39.7027,
                                "ferroviaire_ha": 0.1863,
                            }
                        ],
                        "showInLegend": True,
                        "maxSize": 50,
                        "marker": {"fillOpacity": 0.5},
                        "color": "#6a6af4",
                        "joinBy": ["land_id"],
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Consommation totale: {point.total_conso_ha:,.1f} ha<br/>",
                        },
                    },
                    {
                        "name": "Consommation relative à la surface",
                        "colorKey": "conso_density_percent",
                        "data": [
                            {
                                "land_id": "200046977",
                                "value": 0.805705887054088,
                                "total_conso_ha": 433.031,
                                "habitat_ha": 176.8584,
                                "activite_ha": 191.6679,
                                "mixte_ha": 10.2102,
                                "route_ha": 39.7027,
                                "ferroviaire_ha": 0.1863,
                                "conso_density_percent": 0.805705887054088,
                                "borderColor": "#0063CB",
                                "borderWidth": 3,
                            }
                        ],
                        "states": {"hover": {"borderColor": "#000", "borderWidth": 2}},
                        "dataLabels": {"enabled": False},
                        "joinBy": "land_id",
                        "tooltip": {
                            "valueDecimals": 1,
                            "pointFormat": "<b>{point.name}</b>:<br/>Consommation relative à la surface: {point.conso_density_percent:,.2f} %<br/>",
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
                    "filename": "Consommation d'espaces NAF de Métropole de Lyon et des territoires de comparaison (2015 à 2020)",
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
                    "Activité (ha)",
                    "Consommation relative à la surface (%) - 2015 à 2020",
                    "Consommation totale (ha) - 2015 à 2020",
                    "Ferroviaire (ha)",
                    "Habitat (ha)",
                    "Inconnu (ha)",
                    "Mixte (ha)",
                    "Route (ha)",
                    "Territoire",
                    "Type",
                ],
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "EPCI",
                            "Métropole de Lyon (principal)",
                            0.19,
                            0.81,
                            10.21,
                            14.41,
                            176.86,
                            191.67,
                            39.7,
                            433.03,
                        ],
                    }
                ],
            },
        }
    )
