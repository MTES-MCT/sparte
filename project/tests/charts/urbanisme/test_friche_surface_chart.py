# flake8: noqa: E501
from inline_snapshot import snapshot


def test_friche_surface_chart(client, hauts_de_seine):
    response = client.get("/api/chart/friche_surface/DEPART/92")
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
                "title": {"text": "Répartition par catégorie de taille (en nombre)"},
                "series": [
                    {
                        "name": "Répartition par catégorie de taille (en nombre)",
                        "data": [
                            {"name": "[0.33 - 1.74] ha", "surface": 5.72723656014793, "y": 4, "count": 4},
                            {"name": "> 1.74 ha", "surface": 8.37753346329095, "y": 3, "count": 3},
                            {"name": "[0.08 - 0.33] ha", "surface": 0.185209781815681, "y": 1, "count": 1},
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
                    "filename": "Répartition par catégorie de taille (en nombre)",
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
                    "Répartition par catégorie de taille (en nombre)",
                    "Nombre de friches sans projet",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {"name": "[0.33 - 1.74] ha", "data": ["[0.33 - 1.74] ha", 4, 5.72723656014793]},
                    {"name": "> 1.74 ha", "data": ["> 1.74 ha", 3, 8.37753346329095]},
                    {"name": "[0.08 - 0.33] ha", "data": ["[0.08 - 0.33] ha", 1, 0.185209781815681]},
                    {"name": "< 0.08 ha", "data": ["< 0.08 ha", 0, 0.0]},
                ],
            },
        }
    )
