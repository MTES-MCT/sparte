# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_friche_pollution_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/friche_pollution/EPCI/200046977")
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
                "title": {"text": "Répartition par niveau de pollution (en surface)"},
                "series": [
                    {
                        "name": "Type de pollution",
                        "data": [
                            {"name": "inconnu", "surface": 114.996055871236, "count": 16, "y": 114.996055871236},
                            {
                                "name": "pollution supposée",
                                "surface": 2.2094242693138,
                                "count": 2,
                                "y": 2.2094242693138,
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
                    "Type de pollution",
                ],
                "rows": [
                    {"name": "inconnu", "data": ["inconnu", 114.996055871236, 16]},
                    {"name": "pollution avérée", "data": ["pollution avérée", 0, 0.0]},
                    {"name": "pollution inexistante", "data": ["pollution inexistante", 0, 0.0]},
                    {"name": "pollution peu probable", "data": ["pollution peu probable", 0, 0.0]},
                    {"name": "pollution probable", "data": ["pollution probable", 0, 0.0]},
                    {"name": "pollution supposée", "data": ["pollution supposée", 2, 2.2094242693138]},
                    {"name": "pollution traitée", "data": ["pollution traitée", 0, 0.0]},
                ],
            },
        }
    )
