# flake8: noqa: E501
from inline_snapshot import snapshot


def test_population_conso_progression_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/population_conso_progression_chart/DEPART/92",
        {"start_date": 2011, "end_date": 2022},
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
                    "layout": "horizontal",
                    "align": "center",
                    "verticalAlign": "bottom",
                },
                "title": {
                    "text": "Évolution de la consommation d'espaces NAF et de la population - Hauts-de-Seine (2011 - 2022)"
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
                        "title": {"text": "Population totale (hab)", "style": {"color": "#fa4b42"}},
                        "labels": {"style": {"color": "#fa4b42"}},
                        "opposite": True,
                    },
                    {
                        "labels": {"style": {"color": "#6a6af4"}},
                        "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                    },
                ],
                "tooltip": {"shared": True},
                "series": [
                    {
                        "name": "Consommation totale ",
                        "type": "column",
                        "yAxis": 1,
                        "data": [1.5, 3.81, 3.32, 2.55, 23.83, 0.69, 1.15, 2.5, 1.01, 2.15, 0.38, 0.42],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#CFD1E5",
                        "id": "main",
                    },
                    {
                        "name": "Consommation à destination de l'habitat ",
                        "type": "column",
                        "yAxis": 1,
                        "data": [0.37, 0.73, 0.59, 0.39, 0.85, 0.22, 0.71, 1.39, 0.83, 1.5, 0.24, 0.32],
                        "tooltip": {"valueSuffix": " ha"},
                        "color": "#6a6af4",
                        "linkTo": "main",
                    },
                    {
                        "name": "Population",
                        "type": "spline",
                        "data": [1581628, None, None, None, None, 1603268, None, None, None, None, None, 1647435],
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
                    "filename": "Évolution de la consommation d'espaces NAF et de la population - Hauts-de-Seine (2011 - 2022)",
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
                "headers": ["Année", "Population", "Consommation totale (ha)", "Consommation habitat (ha)"],
                "rows": [
                    {"name": "", "data": ["2011", "1,581,628", "1.50", "0.37"]},
                    {"name": "", "data": ["2012", "-", "3.81", "0.73"]},
                    {"name": "", "data": ["2013", "-", "3.32", "0.59"]},
                    {"name": "", "data": ["2014", "-", "2.55", "0.39"]},
                    {"name": "", "data": ["2015", "-", "23.83", "0.85"]},
                    {"name": "", "data": ["2016", "1,603,268", "0.69", "0.22"]},
                    {"name": "", "data": ["2017", "-", "1.15", "0.71"]},
                    {"name": "", "data": ["2018", "-", "2.50", "1.39"]},
                    {"name": "", "data": ["2019", "-", "1.01", "0.83"]},
                    {"name": "", "data": ["2020", "-", "2.15", "1.50"]},
                    {"name": "", "data": ["2021", "-", "0.38", "0.24"]},
                    {"name": "", "data": ["2022", "1,647,435", "0.42", "0.32"]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
