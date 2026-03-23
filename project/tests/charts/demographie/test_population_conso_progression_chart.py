# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_population_conso_progression_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/population_conso_progression_chart/EPCI/200046977",
        {"start_date": 2011, "end_date": 2022},
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
                    "layout": "horizontal",
                    "align": "center",
                    "verticalAlign": "bottom",
                },
                "title": {
                    "text": "Évolution de la consommation d'espaces NAF et de la population - Métropole de Lyon (2011 - 2022)"
                },
                "credits": {"enabled": False},
                "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
                "xAxis": [
                    {
                        "categories": [
                            "2011",
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
                        ]
                    }
                ],
                "yAxis": [
                    {
                        "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                        "labels": {"style": {"color": "#6a6af4"}},
                    },
                    {
                        "labels": {"style": {"color": "#fa4b42"}},
                        "title": {"text": "Population totale (hab)", "style": {"color": "#fa4b42"}},
                        "opposite": True,
                    },
                ],
                "tooltip": {"shared": True},
                "series": [
                    {
                        "name": "Consommation à destination de l'habitat ",
                        "type": "column",
                        "yAxis": 1,
                        "data": [
                            20.58,
                            23.2,
                            27.76,
                            27.76,
                            28.46,
                            33.44,
                            35.37,
                            36.23,
                            38.29,
                            40.12,
                            55.24,
                            56.17,
                        ],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6a6af4",
                        "linkTo": "main",
                    },
                    {
                        "name": "Consommation totale ",
                        "type": "column",
                        "yAxis": 1,
                        "data": [
                            107.93,
                            116.13,
                            123.89,
                            32.31,
                            44.28,
                            64.65,
                            65.43,
                            68.88,
                            73.66,
                            80.32,
                            81.18,
                            82.58,
                        ],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "id": "main",
                    },
                    {
                        "name": "Population",
                        "type": "spline",
                        "data": [1310082, 1381249, 1433613, None, None, None, None, None, None, None, None, None],
                        "tooltip": {"valueSuffix": " hab"},
                        "color": "#fa4b42",
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
                    "filename": "Évolution de la consommation d'espaces NAF et de la population - Métropole de Lyon (2011 - 2022)",
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
                "headers": ["Année", "Consommation habitat (ha)", "Consommation totale (ha)", "Population"],
                "rows": [
                    {"name": "", "data": ["-", "107.93", "2012", "56.17"]},
                    {"name": "", "data": ["-", "116.13", "2015", "36.23"]},
                    {"name": "", "data": ["-", "123.89", "2013", "55.24"]},
                    {"name": "", "data": ["-", "2014", "35.37", "82.58"]},
                    {"name": "", "data": ["-", "2017", "23.20", "65.43"]},
                    {"name": "", "data": ["-", "2018", "33.44", "68.88"]},
                    {"name": "", "data": ["-", "2019", "27.76", "44.28"]},
                    {"name": "", "data": ["-", "2020", "27.76", "64.65"]},
                    {"name": "", "data": ["-", "2021", "38.29", "81.18"]},
                    {"name": "", "data": ["1,310,082", "2011", "40.12", "80.32"]},
                    {"name": "", "data": ["1,381,249", "2016", "28.46", "73.66"]},
                    {"name": "", "data": ["1,433,613", "20.58", "2022", "32.31"]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
