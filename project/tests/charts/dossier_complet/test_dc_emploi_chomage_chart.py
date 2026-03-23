# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_emploi_chomage_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_emploi_chomage/EPCI/200046977")
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
                "title": {"text": "Activité et chômage (15-64 ans) - Métropole de Lyon"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["2011", "2016", "2022"]},
                "yAxis": {"title": {"text": "Population 15-64 ans"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"column": {"stacking": "normal"}},
                "series": [
                    {
                        "name": "Actifs occupés",
                        "data": [548650.30141093, 566227.637306366, 615601.737984702],
                        "color": "#00E272",
                    },
                    {
                        "name": "Inactifs",
                        "data": [240970.790347776, 241894.451833476, 244313.375136028],
                        "color": "#CFD1E5",
                    },
                    {
                        "name": "Chômeurs",
                        "data": [81363.9553999053, 82930.756244411, 92484.845700357],
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
                    "filename": "Activité et chômage (15-64 ans) - Métropole de Lyon",
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
                "headers": ["Actifs occupés", "Année", "Chômeurs", "Inactifs", "Pop. 15-64 ans"],
                "rows": [
                    {"name": "2011", "data": ["2011", "240,971", "548,650", "81,364", "870,985"]},
                    {"name": "2016", "data": ["2016", "244,313", "566,228", "903,026", "92,485"]},
                    {"name": "2022", "data": ["2022", "241,894", "615,602", "82,931", "940,427"]},
                ],
            },
        }
    )
