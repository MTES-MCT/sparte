# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_friche_zonage_environnemental_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/friche_zonage_environnemental/EPCI/200046977")
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
                "title": {
                    "text": "Répartition par intersection ou proximité avec un zonage environnemental (en surface)"
                },
                "series": [
                    {
                        "name": "Type de zonage environnemental",
                        "data": [
                            {
                                "name": "hors zone",
                                "surface": 22.7291170990075,
                                "count": 5,
                                "y": 22.7291170990075,
                            },
                            {
                                "name": "proche d'une zone Natura 2000",
                                "surface": 28.6111778028694,
                                "count": 6,
                                "y": 28.6111778028694,
                            },
                            {
                                "name": "proche d'une ZNIEFF",
                                "surface": 65.8651852386728,
                                "count": 7,
                                "y": 65.8651852386728,
                            },
                        ],
                    }
                ],
                "chart": {"type": "pie"},
                "tooltip": {
                    "valueSuffix": " ha",
                    "valueDecimals": 2,
                    "pointFormat": "{point.percentage:.1f}% ({point.surface:,.1f} ha) - {point.count} friches sans projet",
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "plotOptions": {
                    "pie": {
                        "dataLabels": {
                            "enabled": True,
                            "overflow": "justify",
                            "format": "{point.name} - {point.percentage:.1f}%",
                            "style": {"textOverflow": "clip", "width": "100px"},
                        }
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
                    "filename": "Répartition par intersection ou proximité avec un zonage environnemental (en surface)",
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
                    "Nombre de friches sans projet",
                    "Surface totale des friches sans projet (ha)",
                    "Type de zonage environnemental",
                ],
                "rows": [
                    {
                        "name": "Natura 2000",
                        "data": ["Natura 2000", 0, 0.0],
                    },
                    {
                        "name": "ZNIEFF",
                        "data": ["ZNIEFF", 0, 0.0],
                    },
                    {"name": "hors zone", "data": ["hors zone", 22.7291170990075, 5]},
                    {"name": "proche d'une ZNIEFF", "data": ["proche d'une ZNIEFF", 65.8651852386728, 7]},
                    {"name": "proche d'une réserve naturelle", "data": ["proche d'une réserve naturelle", 0, 0.0]},
                    {
                        "name": "proche d'une zone Natura 2000",
                        "data": ["proche d'une zone Natura 2000", 28.6111778028694, 6],
                    },
                    {"name": "réserve naturelle", "data": ["réserve naturelle", 0, 0.0]},
                ],
            },
        }
    )
