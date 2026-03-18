# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_population_evolution_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_population_evolution/DEPART/92")
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
                "title": {"text": "Évolution de la population - Hauts-de-Seine"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["2011", "2016", "2022"]},
                "yAxis": {"title": {"text": "Population"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"column": {"dataLabels": {"enabled": True, "format": "{point.y:,.0f}"}}},
                "series": [
                    {"name": "Population totale", "data": [1581628.0, 1603268.0, 1647435.0], "color": "#6A6AF4"}
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
                    "filename": "Évolution de la population - Hauts-de-Seine",
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
                "headers": ["Année", "Population totale"],
                "rows": [
                    {"name": "2011", "data": ["2011", "1,581,628"]},
                    {"name": "2016", "data": ["2016", "1,603,268"]},
                    {"name": "2022", "data": ["2022", "1,647,435"]},
                ],
            },
        }
    )
