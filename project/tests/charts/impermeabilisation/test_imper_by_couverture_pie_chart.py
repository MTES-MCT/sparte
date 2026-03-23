# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_imper_by_couverture_pie_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/pie_imper_by_couverture/EPCI/200046977",
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
                "title": {"text": "Surfaces imperméables par couverture  en 2017"},
                "series": [
                    {
                        "name": "Surface imperméable",
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
                                "y": 9003.86523415,
                                "color": "#ff9191",
                                "code": "CS1.1.1.2",
                                "long_name": "Zones non bâties (Routes; places; parking…)",
                                "surface": 9003.86523415,
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
                    "filename": "Surfaces imperméables par couverture  en 2017",
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
                    "Pourcentage de la surface imperméable (%)",
                    "Pourcentage du territoire (%)",
                    "Surface (ha)",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 15.49, 48.05, 8326.42]},
                    {
                        "name": "",
                        "data": ["CS1.1.1.2", "Zones non bâties (Routes; places; parking…)", 16.75, 51.95, 9003.87],
                    },
                ],
            },
        }
    )
