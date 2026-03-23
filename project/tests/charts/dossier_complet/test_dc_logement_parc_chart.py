# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_parc_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_logement_parc/EPCI/200046977")
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
                "title": {"text": "Parc de logements - Métropole de Lyon"},
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
                        "data": [586267.734803164, 625859.89792237, 668374.017018543],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Résidences secondaires",
                        "data": [10941.2424960025, 19178.8191120115, 26931.7622697791],
                        "color": "#8ecac7",
                    },
                    {
                        "name": "Logements vacants",
                        "data": [45994.9846354564, 51541.4815662277, 58064.7405069441],
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
                    "filename": "Parc de logements - Métropole de Lyon",
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
                "headers": ["Année", "Logements vacants", "Rés. principales", "Rés. secondaires", "Total"],
                "rows": [
                    {"name": "2011", "data": ["10,941", "2011", "45,995", "586,268", "643,204"]},
                    {"name": "2016", "data": ["19,179", "2016", "51,541", "625,860", "696,580"]},
                    {"name": "2022", "data": ["2022", "26,932", "58,065", "668,374", "753,371"]},
                ],
            },
        }
    )
