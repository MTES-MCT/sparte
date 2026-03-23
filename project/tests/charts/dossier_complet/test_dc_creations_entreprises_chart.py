# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_creations_entreprises_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_creations_entreprises/EPCI/200046977")
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
                "chart": {"type": "line"},
                "title": {"text": "Créations d'entreprises - Métropole de Lyon (2012-2024)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {
                    "categories": [
                        "2012",
                        "2013",
                        "2014",
                        "2015",
                        "2016",
                        "2017",
                        "2018",
                        "2019",
                        "2020",
                        "2021",
                        "2022",
                        "2023",
                        "2024",
                    ]
                },
                "yAxis": {"title": {"text": "Nombre de créations"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "series": [
                    {
                        "name": "Total créations",
                        "data": [
                            14812.0,
                            14892.0,
                            15293.0,
                            15777.0,
                            17863.0,
                            20949.0,
                            24735.0,
                            29960.0,
                            30326.0,
                            30539.0,
                            31826.0,
                            32334.0,
                            33071.0,
                        ],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Créations individuelles",
                        "data": [
                            10269.0,
                            10389.0,
                            11888.0,
                            14588.0,
                            18361.0,
                            22621.0,
                            22883.0,
                            23017.0,
                            23235.0,
                            23588.0,
                            24367.0,
                            9976.0,
                            9995.0,
                        ],
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
                    "filename": "Créations d'entreprises - Métropole de Lyon (2012-2024)",
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
                "headers": ["Année", "Créations individuelles", "Total créations"],
                "rows": [
                    {"name": "2014", "data": ["10,269", "15,293", "2014"]},
                    {"name": "2015", "data": ["10,389", "15,777", "2015"]},
                    {"name": "2016", "data": ["11,888", "17,863", "2016"]},
                    {"name": "2017", "data": ["14,588", "20,949", "2017"]},
                    {"name": "2012", "data": ["14,812", "2012", "9,976"]},
                    {"name": "2013", "data": ["14,892", "2013", "9,995"]},
                    {"name": "2018", "data": ["18,361", "2018", "24,735"]},
                    {"name": "2019", "data": ["2019", "23,235", "30,326"]},
                    {"name": "2020", "data": ["2020", "22,883", "29,960"]},
                    {"name": "2021", "data": ["2021", "23,588", "32,334"]},
                    {"name": "2022", "data": ["2022", "23,017", "31,826"]},
                    {"name": "2023", "data": ["2023", "22,621", "30,539"]},
                    {"name": "2024", "data": ["2024", "24,367", "33,071"]},
                ],
            },
        }
    )
