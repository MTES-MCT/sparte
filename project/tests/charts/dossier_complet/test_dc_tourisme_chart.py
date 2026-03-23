# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_tourisme_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_tourisme/EPCI/200046977")
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
                "chart": {"type": "column"},
                "title": {"text": "Hébergements touristiques - Métropole de Lyon"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["1★", "2★", "3★", "4★", "5★", "Non classé"]},
                "yAxis": {"title": {"text": "Nombre d'établissements"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "series": [
                    {"name": "Hôtels", "data": [0, 0, 0, 0, 0, 0], "color": "#6A6AF4"},
                    {"name": "Campings", "data": [0, 0, 0, 0, 0, 0], "color": "#8ecac7"},
                ],
                "subtitle": {"text": "Total : 0 hôtels (0 chambres), 0 campings (0 emplacements)"},
                "navigation": {"buttonOptions": {"enabled": False}},
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
                    "filename": "Hébergements touristiques - Métropole de Lyon",
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
                "headers": ["Chambres/Emplacements", "Total", "Type"],
                "rows": [
                    {"name": "", "data": ["-", "-", "Auberges de jeunesse"]},
                    {"name": "", "data": ["-", "-", "Campings"]},
                    {"name": "", "data": ["-", "-", "Hôtels"]},
                    {"name": "", "data": ["-", "-", "Résidences de tourisme"]},
                    {"name": "", "data": ["-", "-", "Villages vacances"]},
                ],
            },
        }
    )
