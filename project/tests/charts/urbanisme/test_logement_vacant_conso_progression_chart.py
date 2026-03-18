# flake8: noqa: E501
from inline_snapshot import snapshot


def test_logement_vacant_conso_progression_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/logement_vacant_conso_progression_chart/DEPART/92",
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
                        "title": {"text": "Nombre de logements vacants", "style": {"color": "#E2D6BD"}},
                        "labels": {"style": {"color": "#E2D6BD"}},
                        "opposite": True,
                    },
                    {
                        "labels": {"style": {"color": "#6a6af4"}},
                        "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                    },
                ],
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "shared": True},
                "series": [
                    {
                        "name": "Logements vacants de plus de 2 ans dans le parc privé",
                        "type": "area",
                        "yAxis": 0,
                        "data": [
                            {
                                "x": -0.5,
                                "y": 7086,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {"x": 0, "y": 7086},
                            {
                                "x": 0.5,
                                "y": 7086,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                        ],
                        "color": "#E2D6BD",
                        "stack": "vacants",
                    },
                    {
                        "name": "Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux",
                        "type": "area",
                        "yAxis": 0,
                        "data": [
                            {
                                "x": -0.5,
                                "y": 1656,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                            {"x": 0, "y": 1656},
                            {
                                "x": 0.5,
                                "y": 1656,
                                "custom": {"skipTooltip": True},
                                "marker": {"enabled": False, "states": {"hover": {"enabled": False}}},
                            },
                        ],
                        "color": "#C09F6D",
                        "stack": "vacants",
                    },
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [23.83, 0.69, 1.15, 2.5, 1.01, 2.15],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "stack": "conso",
                        "id": "main",
                    },
                    {
                        "name": "Consommation à destination de l'habitat",
                        "type": "column",
                        "yAxis": 1,
                        "data": [0.85, 0.22, 0.71, 1.39, 0.83, 1.5],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6A6AF4",
                        "stack": "conso",
                        "linkTo": "main",
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
                "headers": ["Année", "2015", "2016", "2017", "2018", "2019", "2020"],
                "rows": [
                    {"name": "", "data": ["Logements vacants de plus de 2 ans dans le parc privé", 7086]},
                    {
                        "name": "",
                        "data": ["Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux", 1656],
                    },
                    {"name": "", "data": ["Total logements en vacance structurelle", 8742]},
                    {"name": "", "data": ["Consommation totale (ha)", 23.83, 0.69, 1.15, 2.5, 1.01, 2.15]},
                    {
                        "name": "",
                        "data": ["Consommation à destination de l'habitat (ha)", 0.85, 0.22, 0.71, 1.39, 0.83, 1.5],
                    },
                ],
                "boldFirstColumn": True,
            },
        }
    )
