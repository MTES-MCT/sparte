# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_vs_conso_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_logement_vs_conso/EPCI/200046977",
        {"start_date": 2015, "end_date": 2020},
    )
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
                "chart": {"zoomType": "xy"},
                "title": {"text": "Logements et consommation d'espaces - Métropole de Lyon (2015 - 2020)"},
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
                        "title": {"text": "Consommation d'espaces (ha)", "style": {"color": "#6A6AF4"}},
                        "labels": {"style": {"color": "#6A6AF4"}},
                    },
                    {
                        "title": {"text": "Logements", "style": {"color": "#FA4B42"}},
                        "labels": {"style": {"color": "#FA4B42"}},
                        "opposite": True,
                    },
                ],
                "tooltip": {"shared": True},
                "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
                "series": [
                    {
                        "name": "Consommation habitat",
                        "type": "column",
                        "yAxis": 1,
                        "data": [23.2, 27.76, 27.76, 28.46, 33.44, 36.23],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6A6AF4",
                        "linkedTo": "main",
                    },
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [116.13, 44.28, 64.65, 65.43, 68.88, 73.66],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "id": "main",
                    },
                    {
                        "name": "Logements",
                        "type": "spline",
                        "data": [696580.19860061, None, None, None, None, None],
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
                    "filename": "Logements et consommation d'espaces - Métropole de Lyon (2015 - 2020)",
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
                "headers": ["Année", "Consommation habitat (ha)", "Consommation totale (ha)", "Logements"],
                "rows": [
                    {"name": "2015", "data": ["-", "116.13", "2015", "36.23"]},
                    {"name": "2017", "data": ["-", "2017", "23.20", "65.43"]},
                    {"name": "2018", "data": ["-", "2018", "33.44", "68.88"]},
                    {"name": "2019", "data": ["-", "2019", "27.76", "44.28"]},
                    {"name": "2020", "data": ["-", "2020", "27.76", "64.65"]},
                    {"name": "2016", "data": ["2016", "28.46", "696,580", "73.66"]},
                ],
            },
        }
    )
