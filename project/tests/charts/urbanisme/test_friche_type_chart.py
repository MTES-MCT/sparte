# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_friche_type_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/friche_type/EPCI/200046977")
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
                "title": {"text": "Répartition par type (en surface)"},
                "series": [
                    {
                        "name": "Répartition par type (en surface)",
                        "data": [
                            {
                                "name": "friche commerciale",
                                "surface": 0.114305634074937,
                                "count": 1,
                                "y": 0.114305634074937,
                            },
                            {
                                "name": "friche enseignement",
                                "surface": 17.8093818028322,
                                "count": 1,
                                "y": 17.8093818028322,
                            },
                            {
                                "name": "friche industrielle",
                                "surface": 68.4649378636326,
                                "count": 7,
                                "y": 68.4649378636326,
                            },
                            {
                                "name": "inconnu",
                                "surface": 30.8168548400099,
                                "count": 9,
                                "y": 30.8168548400099,
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
                    "filename": "Répartition par type (en surface)",
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
                    "Répartition par type (en surface)",
                    "Surface totale des friches sans projet (ha)",
                ],
                "rows": [
                    {"name": "autre", "data": ["autre", 0, 0.0]},
                    {"name": "friche aéroportuaire", "data": ["friche aéroportuaire", 0, 0.0]},
                    {"name": "friche agro-industrielle", "data": ["friche agro-industrielle", 0, 0.0]},
                    {"name": "friche carrière ou mine", "data": ["friche carrière ou mine", 0, 0.0]},
                    {"name": "friche commerciale", "data": ["friche commerciale", 0.114305634074937, 1]},
                    {"name": "friche cultuelle", "data": ["friche cultuelle", 0, 0.0]},
                    {"name": "friche d'équipement public", "data": ["friche d'équipement public", 0, 0.0]},
                    {"name": "friche d'habitat", "data": ["friche d'habitat", 0, 0.0]},
                    {"name": "friche enseignement", "data": ["friche enseignement", 1, 17.8093818028322]},
                    {"name": "friche ferroviaire", "data": ["friche ferroviaire", 0, 0.0]},
                    {
                        "name": "friche hospitalière",
                        "data": ["friche hospitalière", 0, 0.0],
                    },
                    {"name": "friche industrielle", "data": ["friche industrielle", 68.4649378636326, 7]},
                    {"name": "friche logistique", "data": ["friche logistique", 0, 0.0]},
                    {
                        "name": "friche loisir tourisme hôtellerie",
                        "data": ["friche loisir tourisme hôtellerie", 0, 0.0],
                    },
                    {"name": "friche militaire", "data": ["friche militaire", 0, 0.0]},
                    {"name": "friche portuaire", "data": ["friche portuaire", 0, 0.0]},
                    {"name": "friche touristique", "data": ["friche touristique", 0, 0.0]},
                    {"name": "inconnu", "data": ["inconnu", 30.8168548400099, 9]},
                    {"name": "mixte", "data": ["mixte", 0, 0.0]},
                ],
            },
        }
    )
