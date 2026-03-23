# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_population_pyramid_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_population_pyramid/EPCI/200046977")
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
                "chart": {"type": "bar"},
                "title": {"text": "Pyramide des âges - Métropole de Lyon (2022)"},
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
                        "data": [180347.295418624, 407680.568864062, 98000.4877556149],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Femmes",
                        "data": [138765.178330431, 176601.632699359, 432217.836931908],
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
                    "filename": "Pyramide des âges - Métropole de Lyon (2022)",
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
                "headers": ["Femmes", "Hommes", "Tranche d'âge"],
                "rows": [
                    {"name": "", "data": ["0-19 ans", "176,602", "180,347"]},
                    {"name": "", "data": ["138,765", "65 ans et +", "98,000"]},
                    {"name": "", "data": ["20-64 ans", "407,681", "432,218"]},
                ],
            },
        }
    )
