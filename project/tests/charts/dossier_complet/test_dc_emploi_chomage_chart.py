# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_emploi_chomage_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_emploi_chomage/DEPART/92")
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
                "title": {"text": "Activité et chômage (15-64 ans) - Hauts-de-Seine"},
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
                        "data": [738164.009926114, 737414.18072852, 779972.605250844],
                        "color": "#00E272",
                    },
                    {
                        "name": "Chômeurs",
                        "data": [84407.5185229055, 92262.3400487511, 86532.8391511702],
                        "color": "#FA4B42",
                    },
                    {
                        "name": "Inactifs",
                        "data": [235091.432821525, 227370.248038266, 224810.473937565],
                        "color": "#CFD1E5",
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
                    "filename": "Activité et chômage (15-64 ans) - Hauts-de-Seine",
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
                "headers": ["Année", "Actifs occupés", "Chômeurs", "Inactifs", "Pop. 15-64 ans"],
                "rows": [
                    {"name": "2011", "data": ["2011", "738,164", "84,408", "235,091", "1,057,663"]},
                    {"name": "2016", "data": ["2016", "737,414", "92,262", "227,370", "1,057,047"]},
                    {"name": "2022", "data": ["2022", "779,973", "86,533", "224,810", "1,091,316"]},
                ],
            },
        }
    )
