# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_emploi_vs_conso_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_emploi_vs_conso/EPCI/200046977",
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
                "title": {
                    "text": "Créations d'entreprises et consommation d'espaces - Métropole de Lyon (2015 - 2020)"
                },
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
                        "title": {"text": "Consommation d'espaces (ha)", "style": {"color": "#8ecac7"}},
                        "labels": {"style": {"color": "#8ecac7"}},
                    },
                    {
                        "title": {"text": "Créations d'entreprises", "style": {"color": "#FA4B42"}},
                        "labels": {"style": {"color": "#FA4B42"}},
                        "opposite": True,
                    },
                ],
                "tooltip": {"shared": True},
                "plotOptions": {"column": {"stacking": "normal"}},
                "series": [
                    {
                        "name": "Consommation activité",
                        "type": "column",
                        "yAxis": 1,
                        "data": [24.53, 29.25, 31.76, 33.95, 62.44, 9.74],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#8ecac7",
                        "stack": "conso",
                    },
                    {
                        "name": "Consommation totale",
                        "type": "column",
                        "yAxis": 1,
                        "data": [116.13, 44.28, 64.65, 65.43, 68.88, 73.66],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "stack": "conso",
                    },
                    {
                        "name": "Créations d'entreprises",
                        "type": "column",
                        "data": [15777.0, 17863.0, 20949.0, 24735.0, 29960.0, 30326.0],
                        "tooltip": {"valueSuffix": " créations"},
                        "color": "#FA4B42",
                        "stack": "entreprises",
                    },
                    {
                        "name": "Créations individuelles",
                        "type": "column",
                        "data": [10389.0, 11888.0, 14588.0, 18361.0, 22883.0, 23235.0],
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
                    "filename": "Créations d'entreprises et consommation d'espaces - Métropole de Lyon (2015 - 2020)",
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
                "headers": [
                    "Année",
                    "Conso. activité (ha)",
                    "Conso. totale (ha)",
                    "Créations entreprises",
                    "Créations individuelles",
                ],
                "rows": [
                    {"name": "2015", "data": ["10,389", "116.13", "15,777", "2015", "62.44"]},
                    {"name": "2016", "data": ["11,888", "17,863", "2016", "31.76", "73.66"]},
                    {"name": "2017", "data": ["14,588", "20,949", "2017", "33.95", "65.43"]},
                    {"name": "2018", "data": ["18,361", "2018", "24,735", "24.53", "68.88"]},
                    {"name": "2019", "data": ["2019", "23,235", "30,326", "44.28", "9.74"]},
                    {"name": "2020", "data": ["2020", "22,883", "29,960", "29.25", "64.65"]},
                ],
            },
        }
    )
