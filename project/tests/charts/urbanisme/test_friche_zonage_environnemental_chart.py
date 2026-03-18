# flake8: noqa: E501
from inline_snapshot import snapshot


def test_friche_zonage_environnemental_chart(client, hauts_de_seine):
    response = client.get("/api/chart/friche_zonage_environnemental/DEPART/92")
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
                "title": {
                    "text": "Répartition par intersection ou proximité avec un zonage environnemental (en surface)"
                },
                "series": [
                    {
                        "name": "Type de zonage environnemental",
                        "data": [
                            {
                                "name": "proche d'une zone Natura 2000",
                                "surface": 11.143952529589,
                                "count": 5,
                                "y": 11.143952529589,
                            },
                            {
                                "name": "proche d'une ZNIEFF",
                                "surface": 3.14602727566559,
                                "count": 3,
                                "y": 3.14602727566559,
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
                    "Type de zonage environnemental",
                    "Nombre de friches sans projet",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {
                        "name": "proche d'une zone Natura 2000",
                        "data": ["proche d'une zone Natura 2000", 5, 11.143952529589],
                    },
                    {"name": "proche d'une ZNIEFF", "data": ["proche d'une ZNIEFF", 3, 3.14602727566559]},
                    {"name": "hors zone", "data": ["hors zone", 0, 0.0]},
                    {"name": "Natura 2000", "data": ["Natura 2000", 0, 0.0]},
                    {"name": "proche d'une réserve naturelle", "data": ["proche d'une réserve naturelle", 0, 0.0]},
                    {"name": "ZNIEFF", "data": ["ZNIEFF", 0, 0.0]},
                    {"name": "réserve naturelle", "data": ["réserve naturelle", 0, 0.0]},
                ],
            },
        }
    )
