# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_logement_vs_conso_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/dc_logement_vs_conso/DEPART/92",
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
                "title": {"text": "Logements et consommation d'espaces - Hauts-de-Seine (2015 - 2020)"},
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
                        "title": {"text": "Logements", "style": {"color": "#FA4B42"}},
                        "labels": {"style": {"color": "#FA4B42"}},
                        "opposite": True,
                    },
                    {
                        "title": {"text": "Consommation d'espaces (ha)", "style": {"color": "#6A6AF4"}},
                        "labels": {"style": {"color": "#6A6AF4"}},
                    },
                ],
                "tooltip": {"shared": True},
                "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
                "series": [
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [23.83, 0.69, 1.15, 2.5, 1.01, 2.15],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "id": "main",
                    },
                    {
                        "name": "Consommation habitat",
                        "type": "column",
                        "yAxis": 1,
                        "data": [0.85, 0.22, 0.71, 1.39, 0.83, 1.5],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6A6AF4",
                        "linkedTo": "main",
                    },
                    {
                        "name": "Logements",
                        "type": "spline",
                        "data": [None, 789808.947506419, None, None, None, None],
                        "tooltip": {"valueSuffix": " logements"},
                        "color": "#FA4B42",
                        "connectNulls": True,
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
                    "filename": "Logements et consommation d'espaces - Hauts-de-Seine (2015 - 2020)",
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
                "headers": ["Année", "Consommation totale (ha)", "Consommation habitat (ha)", "Logements"],
                "rows": [
                    {"name": "2015", "data": ["2015", "23.83", "0.85", "-"]},
                    {"name": "2016", "data": ["2016", "0.69", "0.22", "789,809"]},
                    {"name": "2017", "data": ["2017", "1.15", "0.71", "-"]},
                    {"name": "2018", "data": ["2018", "2.50", "1.39", "-"]},
                    {"name": "2019", "data": ["2019", "1.01", "0.83", "-"]},
                    {"name": "2020", "data": ["2020", "2.15", "1.50", "-"]},
                ],
            },
        }
    )
