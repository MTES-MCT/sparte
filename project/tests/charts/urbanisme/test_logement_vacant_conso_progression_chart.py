# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_logement_vacant_conso_progression_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/logement_vacant_conso_progression_chart/EPCI/200046977",
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
                    "itemWidth": 200,
                    "itemStyle": {"textOverflow": None},
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "title": {"text": "Évolution de la consommation d'espaces NAF et de la vacance des logements"},
                "credits": {"enabled": False},
                "plotOptions": {
                    "column": {"borderWidth": 0, "stacking": "normal"},
                    "area": {"stacking": "normal", "lineWidth": 1, "marker": {"enabled": False}},
                },
                "xAxis": {
                    "categories": ["2015", "2016", "2017", "2018", "2019", "2020"],
                    "min": -0.5,
                    "max": 5.5,
                    "tickPositions": [0, 1, 2, 3, 4, 5],
                },
                "yAxis": [
                    {
                        "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                        "labels": {"style": {"color": "#6a6af4"}},
                    },
                    {
                        "labels": {"style": {"color": "#E2D6BD"}},
                        "title": {"text": "Nombre de logements vacants", "style": {"color": "#E2D6BD"}},
                        "opposite": True,
                    },
                ],
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "shared": True},
                "series": [
                    {
                        "name": "Consommation à destination de l'habitat",
                        "type": "column",
                        "yAxis": 1,
                        "data": [23.2, 27.76, 27.76, 28.46, 33.44, 36.23],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6A6AF4",
                        "stack": "conso",
                        "linkTo": "main",
                    },
                    {
                        "name": "Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux",
                        "type": "area",
                        "yAxis": 0,
                        "data": [
                            {
                                "x": -0.5,
                                "y": 2758,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {
                                "x": 0.5,
                                "y": 2758,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {"x": 0, "y": 2758},
                        ],
                        "color": "#C09F6D",
                        "stack": "vacants",
                    },
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [116.13, 44.28, 64.65, 65.43, 68.88, 73.66],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "stack": "conso",
                        "id": "main",
                    },
                    {
                        "name": "Logements vacants de plus de 2 ans dans le parc privé",
                        "type": "area",
                        "yAxis": 0,
                        "data": [
                            {
                                "x": -0.5,
                                "y": 6039,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {
                                "x": 0.5,
                                "y": 6039,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {"x": 0, "y": 6039},
                        ],
                        "color": "#E2D6BD",
                        "stack": "vacants",
                    },
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
                    "filename": "Évolution de la consommation d'espaces NAF et de la vacance des logements",
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
                "headers": ["2015", "2016", "2017", "2018", "2019", "2020", "Année"],
                "rows": [
                    {
                        "name": "",
                        "data": [
                            "Consommation à destination de l'habitat (ha)",
                            23.2,
                            27.76,
                            27.76,
                            28.46,
                            33.44,
                            36.23,
                        ],
                    },
                    {
                        "name": "",
                        "data": ["Consommation totale (ha)", 116.13, 44.28, 64.65, 65.43, 68.88, 73.66],
                    },
                    {"name": "", "data": ["Logements vacants de plus de 2 ans dans le parc privé", 6039]},
                    {
                        "name": "",
                        "data": ["Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux", 2758],
                    },
                    {
                        "name": "",
                        "data": ["Total logements en vacance structurelle", 8797],
                    },
                ],
                "boldFirstColumn": True,
            },
        }
    )
