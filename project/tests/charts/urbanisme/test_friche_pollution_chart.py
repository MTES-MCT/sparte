# flake8: noqa: E501
from inline_snapshot import snapshot


def test_friche_pollution_chart(client, hauts_de_seine):
    response = client.get("/api/chart/friche_pollution/DEPART/92")
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
                "title": {"text": "Répartition par niveau de pollution (en surface)"},
                "series": [
                    {
                        "name": "Type de pollution",
                        "data": [
                            {"name": "inconnu", "surface": 14.1047700234389, "count": 7, "y": 14.1047700234389},
                            {
                                "name": "pollution supposée",
                                "surface": 0.185209781815681,
                                "count": 1,
                                "y": 0.185209781815681,
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
                    "filename": "Répartition par niveau de pollution (en surface)",
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
                    "Type de pollution",
                    "Nombre de friches sans projet",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {"name": "inconnu", "data": ["inconnu", 7, 14.1047700234389]},
                    {"name": "pollution supposée", "data": ["pollution supposée", 1, 0.185209781815681]},
                    {"name": "pollution inexistante", "data": ["pollution inexistante", 0, 0.0]},
                    {"name": "pollution probable", "data": ["pollution probable", 0, 0.0]},
                    {"name": "pollution traitée", "data": ["pollution traitée", 0, 0.0]},
                    {"name": "pollution peu probable", "data": ["pollution peu probable", 0, 0.0]},
                    {"name": "pollution avérée", "data": ["pollution avérée", 0, 0.0]},
                ],
            },
        }
    )
