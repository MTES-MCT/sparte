# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_population_pyramid_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_population_pyramid/DEPART/92")
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
                "chart": {"type": "bar"},
                "title": {"text": "Pyramide des âges - Hauts-de-Seine (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["0-19 ans", "20-64 ans", "65 ans et +"]},
                "yAxis": {"title": {"text": "Population"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"column": {"grouping": True}},
                "series": [
                    {
                        "name": "Hommes",
                        "data": [203456.908057992, 477854.548653432, 104279.662471444],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Femmes",
                        "data": [196234.427578277, 516345.55676729, 149263.896471565],
                        "color": "#FA4B42",
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
                    "filename": "Pyramide des âges - Hauts-de-Seine (2022)",
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
                "headers": ["Tranche d'âge", "Hommes", "Femmes"],
                "rows": [
                    {"name": "", "data": ["0-19 ans", "203,457", "196,234"]},
                    {"name": "", "data": ["20-64 ans", "477,855", "516,346"]},
                    {"name": "", "data": ["65 ans et +", "104,280", "149,264"]},
                ],
            },
        }
    )
