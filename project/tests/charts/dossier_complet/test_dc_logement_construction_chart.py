# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_construction_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_logement_construction/EPCI/200046977")
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
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Résidences principales par époque de construction - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {
                    "categories": ["1919-1945", "1946-1970", "1971-1990", "1991-2005", "2006-2019", "Avant 1919"]
                },
                "yAxis": {"title": {"text": "Nombre de résidences principales"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "series": [
                    {
                        "name": "Résidences principales",
                        "data": [
                            107222.394993517,
                            112026.345460754,
                            158184.663948298,
                            182731.960091985,
                            43171.8233155696,
                            55786.5928635026,
                        ],
                        "color": "#6A6AF4",
                    }
                ],
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
                    "filename": "Résidences principales par époque de construction - Métropole de Lyon (2022)",
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
                "headers": ["Période", "Résidences principales"],
                "rows": [
                    {"name": "", "data": ["107,222", "1991-2005"]},
                    {"name": "", "data": ["112,026", "2006-2019"]},
                    {"name": "", "data": ["158,185", "1946-1970"]},
                    {"name": "", "data": ["182,732", "1971-1990"]},
                    {"name": "", "data": ["1919-1945", "43,172"]},
                    {"name": "", "data": ["55,787", "Avant 1919"]},
                ],
            },
        }
    )
