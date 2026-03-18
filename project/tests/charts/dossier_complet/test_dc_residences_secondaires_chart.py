# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_residences_secondaires_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_residences_secondaires/DEPART/92")
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
                "chart": {"type": "column"},
                "title": {"text": "Résidences secondaires - Hauts-de-Seine"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["2011", "2016", "2022"]},
                "yAxis": {"title": {"text": "Nombre de résidences secondaires"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "series": [
                    {
                        "name": "Résidences secondaires",
                        "data": [20003.1364108669, 26519.4767348543, 33246.2150631888],
                        "color": "#f4a582",
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
                    "filename": "Résidences secondaires - Hauts-de-Seine",
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
                "headers": ["Année", "Rés. secondaires"],
                "rows": [
                    {"name": "2011", "data": ["2011", "20,003"]},
                    {"name": "2016", "data": ["2016", "26,519"]},
                    {"name": "2022", "data": ["2022", "33,246"]},
                ],
            },
        }
    )
