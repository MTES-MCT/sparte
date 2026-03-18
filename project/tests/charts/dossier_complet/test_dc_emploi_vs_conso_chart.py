# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_emploi_vs_conso_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/dc_emploi_vs_conso/DEPART/92",
        {"start_date": 2015, "end_date": 2020},
    )
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
                "chart": {"zoomType": "xy"},
                "title": {"text": "Créations d'entreprises et consommation d'espaces - Hauts-de-Seine (2015 - 2020)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": [{"categories": ["2015", "2016", "2017", "2018", "2019", "2020"]}],
                "yAxis": [
                    {
                        "title": {"text": "Créations d'entreprises", "style": {"color": "#FA4B42"}},
                        "labels": {"style": {"color": "#FA4B42"}},
                        "opposite": True,
                    },
                    {
                        "title": {"text": "Consommation d'espaces (ha)", "style": {"color": "#8ecac7"}},
                        "labels": {"style": {"color": "#8ecac7"}},
                    },
                ],
                "tooltip": {"shared": True},
                "plotOptions": {"column": {"stacking": "normal"}},
                "series": [
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [23.83, 0.69, 1.15, 2.5, 1.01, 2.15],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "stack": "conso",
                    },
                    {
                        "name": "Consommation activité",
                        "type": "column",
                        "yAxis": 1,
                        "data": [16.62, 0.3, 0.26, 0.26, 0.0, 0.54],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#8ecac7",
                        "stack": "conso",
                    },
                    {
                        "name": "Créations d'entreprises",
                        "type": "column",
                        "data": [19038.0, 22340.0, 25407.0, 29795.0, 32526.0, 32710.0],
                        "tooltip": {"valueSuffix": " créations"},
                        "color": "#FA4B42",
                        "stack": "entreprises",
                    },
                    {
                        "name": "Créations individuelles",
                        "type": "column",
                        "data": [11640.0, 13826.0, 16616.0, 20803.0, 22841.0, 23270.0],
                        "tooltip": {"valueSuffix": " créations"},
                        "color": "#FFB347",
                        "stack": "entreprises",
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
                    "filename": "Créations d'entreprises et consommation d'espaces - Hauts-de-Seine (2015 - 2020)",
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
                "headers": [
                    "Année",
                    "Conso. totale (ha)",
                    "Conso. activité (ha)",
                    "Créations entreprises",
                    "Créations individuelles",
                ],
                "rows": [
                    {"name": "2015", "data": ["2015", "23.83", "16.62", "19,038", "11,640"]},
                    {"name": "2016", "data": ["2016", "0.69", "0.30", "22,340", "13,826"]},
                    {"name": "2017", "data": ["2017", "1.15", "0.26", "25,407", "16,616"]},
                    {"name": "2018", "data": ["2018", "2.50", "0.26", "29,795", "20,803"]},
                    {"name": "2019", "data": ["2019", "1.01", "0.00", "32,526", "22,841"]},
                    {"name": "2020", "data": ["2020", "2.15", "0.54", "32,710", "23,270"]},
                ],
            },
        }
    )
