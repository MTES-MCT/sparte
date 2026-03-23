# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_friche_surface_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/friche_surface/EPCI/200046977")
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
                "title": {"text": "Répartition par catégorie de taille (en nombre)"},
                "series": [
                    {
                        "name": "Répartition par catégorie de taille (en nombre)",
                        "data": [
                            {"name": "[0.08 - 0.33] ha", "surface": 0.114305634074937, "y": 1, "count": 1},
                            {"name": "> 1.74 ha", "surface": 114.881750237161, "y": 15, "count": 15},
                            {"name": "[0.33 - 1.74] ha", "surface": 2.2094242693138, "y": 2, "count": 2},
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
                    "Répartition par catégorie de taille (en nombre)",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {"name": "< 0.08 ha", "data": ["< 0.08 ha", 0, 0.0]},
                    {"name": "> 1.74 ha", "data": ["> 1.74 ha", 114.881750237161, 15]},
                    {"name": "[0.08 - 0.33] ha", "data": ["[0.08 - 0.33] ha", 0.114305634074937, 1]},
                    {"name": "[0.33 - 1.74] ha", "data": ["[0.33 - 1.74] ha", 2, 2.2094242693138]},
                ],
            },
        }
    )
