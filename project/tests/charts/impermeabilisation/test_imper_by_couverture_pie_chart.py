# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_by_couverture_pie_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/pie_imper_by_couverture/DEPART/92",
        {"index": 1},
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
                "title": {"text": "Surfaces imperméables par couverture  en 2018"},
                "series": [
                    {
                        "name": "Surface imperméable",
                        "data": [
                            {
                                "name": "Zones bâties",
                                "y": 5907.11390932,
                                "color": "#ff377a",
                                "code": "CS1.1.1.1",
                                "long_name": "Zones bâties",
                                "surface": 5907.11390932,
                            },
                            {
                                "name": "Zones non bâties",
                                "y": 4005.61446315,
                                "color": "#ff9191",
                                "code": "CS1.1.1.2",
                                "long_name": "Zones non bâties (Routes; places; parking…)",
                                "surface": 4005.61446315,
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
                    "filename": "Surfaces imperméables par couverture  en 2018",
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
                    "Code",
                    "Couverture",
                    "Surface (ha)",
                    "Pourcentage de la surface imperméable (%)",
                    "Pourcentage du territoire (%)",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 5907.11, 59.59, 33.64]},
                    {
                        "name": "",
                        "data": ["CS1.1.1.2", "Zones non bâties (Routes; places; parking…)", 4005.61, 40.41, 22.81],
                    },
                ],
            },
        }
    )
