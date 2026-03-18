# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_logement_parc_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_logement_parc/DEPART/92")
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
                "title": {"text": "Parc de logements - Hauts-de-Seine"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["2011", "2016", "2022"]},
                "yAxis": {"title": {"text": "Nombre de logements"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"column": {"grouping": True}},
                "series": [
                    {
                        "name": "Résidences principales",
                        "data": [695436.720460573, 709070.037695418, 746653.126341685],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Résidences secondaires",
                        "data": [20003.1364108669, 26519.4767348543, 33246.2150631888],
                        "color": "#8ecac7",
                    },
                    {
                        "name": "Logements vacants",
                        "data": [46960.0587746351, 54219.433076146, 55350.1310051538],
                        "color": "#D6AE73",
                    },
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
                    "filename": "Parc de logements - Hauts-de-Seine",
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
                "headers": ["Année", "Rés. principales", "Rés. secondaires", "Logements vacants", "Total"],
                "rows": [
                    {"name": "2011", "data": ["2011", "695,437", "20,003", "46,960", "762,400"]},
                    {"name": "2016", "data": ["2016", "709,070", "26,519", "54,219", "789,809"]},
                    {"name": "2022", "data": ["2022", "746,653", "33,246", "55,350", "835,249"]},
                ],
            },
        }
    )
