# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_logement_construction_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_logement_construction/DEPART/92")
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
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Résidences principales par époque de construction - Hauts-de-Seine (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {
                    "categories": ["Avant 1919", "1919-1945", "1946-1970", "1971-1990", "1991-2005", "2006-2019"]
                },
                "yAxis": {"title": {"text": "Nombre de résidences principales"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "series": [
                    {
                        "name": "Résidences principales",
                        "data": [
                            42673.9270205334,
                            96988.9985943795,
                            212328.186858859,
                            189152.95871354,
                            112326.015546028,
                            82017.8630502364,
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
                    "filename": "Résidences principales par époque de construction - Hauts-de-Seine (2022)",
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
                "headers": ["Période", "Résidences principales"],
                "rows": [
                    {"name": "", "data": ["Avant 1919", "42,674"]},
                    {"name": "", "data": ["1919-1945", "96,989"]},
                    {"name": "", "data": ["1946-1970", "212,328"]},
                    {"name": "", "data": ["1971-1990", "189,153"]},
                    {"name": "", "data": ["1991-2005", "112,326"]},
                    {"name": "", "data": ["2006-2019", "82,018"]},
                ],
            },
        }
    )
