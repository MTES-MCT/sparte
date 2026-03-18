# flake8: noqa: E501
from inline_snapshot import snapshot


def test_friche_zonage_type_chart(client, hauts_de_seine):
    response = client.get("/api/chart/friche_zonage_type/DEPART/92")
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
                "title": {"text": "Répartition par intersection avec un zonage d'urbanisme (en surface)"},
                "series": [
                    {
                        "name": "Type de zonage",
                        "data": [{"name": "U", "surface": 14.2899798052546, "count": 8, "y": 14.2899798052546}],
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
                    "Type de zonage",
                    "Nombre de friches sans projet",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {"name": "U", "data": ["U", 8, 14.2899798052546]},
                    {"name": "AU", "data": ["AU", 0, 0.0]},
                    {"name": "N", "data": ["N", 0, 0.0]},
                    {"name": "A", "data": ["A", 0, 0.0]},
                    {"name": "ZC", "data": ["ZC", 0, 0.0]},
                    {"name": "ZCa", "data": ["ZCa", 0, 0.0]},
                    {"name": "ZnC", "data": ["ZnC", 0, 0.0]},
                ],
            },
        }
    )
