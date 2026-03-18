# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_creations_entreprises_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_creations_entreprises/DEPART/92")
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
                "chart": {"type": "line"},
                "title": {"text": "Créations d'entreprises - Hauts-de-Seine (2012-2024)"},
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
                            17010.0,
                            17293.0,
                            18486.0,
                            19038.0,
                            22340.0,
                            25407.0,
                            29795.0,
                            32526.0,
                            32710.0,
                            35308.0,
                            36273.0,
                            36903.0,
                            37236.0,
                        ],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Créations individuelles",
                        "data": [
                            10894.0,
                            10785.0,
                            11481.0,
                            11640.0,
                            13826.0,
                            16616.0,
                            20803.0,
                            22841.0,
                            23270.0,
                            24291.0,
                            24436.0,
                            25499.0,
                            25854.0,
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
                    "filename": "Créations d'entreprises - Hauts-de-Seine (2012-2024)",
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
                "headers": ["Année", "Total créations", "Créations individuelles"],
                "rows": [
                    {"name": "2012", "data": ["2012", "17,010", "10,894"]},
                    {"name": "2013", "data": ["2013", "17,293", "10,785"]},
                    {"name": "2014", "data": ["2014", "18,486", "11,481"]},
                    {"name": "2015", "data": ["2015", "19,038", "11,640"]},
                    {"name": "2016", "data": ["2016", "22,340", "13,826"]},
                    {"name": "2017", "data": ["2017", "25,407", "16,616"]},
                    {"name": "2018", "data": ["2018", "29,795", "20,803"]},
                    {"name": "2019", "data": ["2019", "32,526", "22,841"]},
                    {"name": "2020", "data": ["2020", "32,710", "23,270"]},
                    {"name": "2021", "data": ["2021", "35,308", "24,291"]},
                    {"name": "2022", "data": ["2022", "36,273", "24,436"]},
                    {"name": "2023", "data": ["2023", "36,903", "25,499"]},
                    {"name": "2024", "data": ["2024", "37,236", "25,854"]},
                ],
            },
        }
    )
