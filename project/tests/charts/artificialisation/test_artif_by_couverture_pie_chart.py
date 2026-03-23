# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_by_couverture_pie_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/pie_artif_by_couverture/EPCI/200046977",
        {"index": 1},
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
                "title": {"text": "Surfaces artificialisées par couverture  en 2017"},
                "series": [
                    {
                        "name": "Surface artificielle",
                        "data": [
                            {
                                "name": "Zones bâties",
                                "y": 8326.41675987,
                                "color": "#ff377a",
                                "code": "CS1.1.1.1",
                                "long_name": "Zones bâties",
                                "surface": 8326.41675987,
                            },
                            {
                                "name": "Zones non bâties",
                                "y": 9001.79230405,
                                "color": "#ff9191",
                                "code": "CS1.1.1.2",
                                "long_name": "Zones non bâties (Routes; places; parking…)",
                                "surface": 9001.79230405,
                            },
                            {
                                "name": "Zones à matériaux minéraux",
                                "y": 1445.38693113,
                                "color": "#ff9",
                                "code": "CS1.1.2.1",
                                "long_name": "Zones à matériaux minéraux",
                                "surface": 1445.38693113,
                            },
                            {
                                "name": "Surfaces d'eau",
                                "y": 2.04718839,
                                "color": "#00ccf2",
                                "code": "CS1.2.2",
                                "long_name": "Surfaces d'eau (Eau continentale et maritime)",
                                "surface": 2.04718839,
                            },
                            {
                                "name": "Peuplement de feuillus",
                                "y": 646.50216048,
                                "color": "#80ff00",
                                "code": "CS2.1.1.1",
                                "long_name": "Peuplement de feuillus",
                                "surface": 646.50216048,
                            },
                            {
                                "name": "Peuplement de conifères",
                                "y": 41.83852022,
                                "color": "#00a600",
                                "code": "CS2.1.1.2",
                                "long_name": "Peuplement de conifères",
                                "surface": 41.83852022,
                            },
                            {
                                "name": "Peuplement mixte",
                                "y": 41.5950979,
                                "color": "#80be00",
                                "code": "CS2.1.1.3",
                                "long_name": "Peuplement mixte",
                                "surface": 41.5950979,
                            },
                            {
                                "name": "Formations arbustives et sous-...",
                                "y": 1.38089049,
                                "color": "#a6ff80",
                                "code": "CS2.1.2",
                                "long_name": "Formations arbustives et sous-arbrisseaux (Landes basses; formations arbustives; formations arbustives organisées; …)",
                                "surface": 1.38089049,
                            },
                            {
                                "name": "Formations herbacées",
                                "y": 10917.26701042,
                                "color": "#ccf24d",
                                "code": "CS2.2.1",
                                "long_name": "Formations herbacées (Pelouses et prairies; terres arables; roselières; …)",
                                "surface": 10917.26701042,
                            },
                        ],
                    }
                ],
                "chart": {"type": "pie"},
                "tooltip": {
                    "valueSuffix": " Ha",
                    "valueDecimals": 2,
                    "pointFormat": "{point.code} - {point.long_name} - {point.percentage:.1f}% ({point.surface:,.1f} ha)",
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "plotOptions": {
                    "pie": {
                        "innerSize": "60%",
                        "dataLabels": {
                            "enabled": True,
                            "overflow": "justify",
                            "format": "{point.name} - {point.percentage:.2f}%",
                            "style": {"textOverflow": "clip", "width": "100px"},
                        },
                    }
                },
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
                    "filename": "Surfaces artificialisées par couverture  en 2017",
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
                    "Code",
                    "Couverture",
                    "Pourcentage de la surface artificielle (%)",
                    "Pourcentage du territoire (%)",
                    "Surface (ha)",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 15.49, 27.37, 8326.42]},
                    {
                        "name": "",
                        "data": ["CS1.1.1.2", "Zones non bâties (Routes; places; parking…)", 16.75, 29.59, 9001.79],
                    },
                    {"name": "", "data": ["CS1.1.2.1", "Zones à matériaux minéraux", 1445.39, 2.69, 4.75]},
                    {
                        "name": "",
                        "data": ["CS1.2.2", "Surfaces d'eau (Eau continentale et maritime)", 0.0, 0.01, 2.05],
                    },
                    {"name": "", "data": ["CS2.1.1.1", "Peuplement de feuillus", 1.2, 2.12, 646.5]},
                    {"name": "", "data": ["CS2.1.1.2", "Peuplement de conifères", 0.08, 0.14, 41.84]},
                    {"name": "", "data": ["CS2.1.1.3", "Peuplement mixte", 0.08, 0.14, 41.6]},
                    {
                        "name": "",
                        "data": [
                            "CS2.1.2",
                            "Formations arbustives et sous-arbrisseaux (Landes basses; formations arbustives; formations arbustives organisées; …)",
                            0.0,
                            0.0,
                            1.38,
                        ],
                    },
                    {
                        "name": "",
                        "data": [
                            "CS2.2.1",
                            "Formations herbacées (Pelouses et prairies; terres arables; roselières; …)",
                            10917.27,
                            20.31,
                            35.88,
                        ],
                    },
                ],
                "boldFirstColumn": True,
            },
        }
    )
