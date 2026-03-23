# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_friche_zonage_type_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/friche_zonage_type/EPCI/200046977")
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
                "title": {"text": "Répartition par intersection avec un zonage d'urbanisme (en surface)"},
                "series": [
                    {
                        "name": "Type de zonage",
                        "data": [
                            {"name": "U", "surface": 78.4643344229196, "count": 11, "y": 78.4643344229196},
                            {"name": "A", "surface": 14.9872991399979, "count": 2, "y": 14.9872991399979},
                            {"name": "AU", "surface": 13.2869179276105, "count": 2, "y": 13.2869179276105},
                            {"name": "N", "surface": 10.4669286500217, "count": 3, "y": 10.4669286500217},
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
                    "filename": "Répartition par intersection avec un zonage d'urbanisme (en surface)",
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
                    "Type de zonage",
                ],
                "rows": [
                    {"name": "A", "data": ["A", 14.9872991399979, 2]},
                    {"name": "AU", "data": ["AU", 13.2869179276105, 2]},
                    {"name": "N", "data": ["N", 10.4669286500217, 3]},
                    {"name": "U", "data": ["U", 11, 78.4643344229196]},
                    {"name": "ZC", "data": ["ZC", 0, 0.0]},
                    {"name": "ZCa", "data": ["ZCa", 0, 0.0]},
                    {"name": "ZnC", "data": ["ZnC", 0, 0.0]},
                ],
            },
        }
    )
