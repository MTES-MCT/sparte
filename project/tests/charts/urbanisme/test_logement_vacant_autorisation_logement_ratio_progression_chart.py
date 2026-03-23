# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_logement_vacant_autorisation_logement_ratio_progression_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/logement_vacant_autorisation_ratio_progression_chart/EPCI/200046977",
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
                "chart": {"type": "column"},
                "title": {
                    "text": "Évolution du nombre de logements vacants et du nombre d'autorisations de construction de logements"
                },
                "xAxis": {"categories": ["2015", "2016", "2017", "2018", "2019", "2020"]},
                "yAxis": {"title": {"text": ""}},
                "tooltip": {
                    "headerFormat": "<b>{point.key}</b><br/>",
                    "pointFormat": '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b>',
                },
                "plotOptions": {"column": {"grouping": True}},
                "series": [
                    {"name": "Nombre de logements en vacance structurelle", "data": [8797], "color": "#D6AE73"},
                    {
                        "name": "Nombre d'autorisations de construction de logements",
                        "data": [7787, 8358],
                        "color": "#FF8E6E",
                    },
                ],
                "navigation": {"buttonOptions": {"enabled": False}},
                "credits": {"enabled": False},
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
                    "filename": "Évolution du nombre de logements vacants et du nombre d'autorisations de construction de logements",
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
                "headers": ["2015", "2016", "2017", "2018", "2019", "2020", "Année"],
                "rows": [
                    {"name": "", "data": ["Nombre d'autorisations de construction de logements", 7787, 8358]},
                    {"name": "", "data": ["Nombre de logements en vacance structurelle", 8797]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
