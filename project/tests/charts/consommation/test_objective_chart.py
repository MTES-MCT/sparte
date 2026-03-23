# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_objective_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/objective_chart/EPCI/200046977")
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
                "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "bottom", "symbolRadius": 0},
                "chart": {"type": "column"},
                "title": {"text": ""},
                "yAxis": [
                    {"title": {"text": "Consommation annualisée"}, "labels": {"format": "{value} Ha"}, "min": 0},
                    {
                        "title": {"text": "Consommation cumulée (en ha)"},
                        "labels": {"format": "{value} Ha"},
                        "opposite": True,
                    },
                ],
                "xAxis": {
                    "type": "category",
                    "categories": ["2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
                },
                "plotOptions": {"column": {"borderRadius": 0}, "line": {"marker": {"enabled": False}}},
                "tooltip": {
                    "headerFormat": "<b>{series.name}</b><br/>",
                    "pointFormat": "{point.name}: {point.y}",
                    "valueSuffix": " Ha",
                    "valueDecimals": 2,
                },
                "series": [
                    {
                        "name": "Consommation cumulée selon objectif national (50%)",
                        "type": "line",
                        "dashStyle": "ShortDash",
                        "data": [
                            {"name": "2021", "y": 41.38727, "progression": 41.38727},
                            {"name": "2022", "y": 82.77454, "progression": 41.38727},
                            {"name": "2023", "y": 124.16181, "progression": 41.38727},
                            {"name": "2024", "y": 165.54908, "progression": 41.38727},
                            {"name": "2025", "y": 206.93635, "progression": 41.38727},
                            {"name": "2026", "y": 248.32362, "progression": 41.38727},
                            {"name": "2027", "y": 289.71089, "progression": 41.38727},
                            {"name": "2028", "y": 331.09816, "progression": 41.38727},
                            {"name": "2029", "y": 372.48543, "progression": 41.38727},
                            {"name": "2030", "y": 413.8727, "progression": 41.38727},
                        ],
                        "color": "#059669",
                        "zIndex": 5,
                    },
                    {
                        "name": "Consommation annuelle réelle",
                        "yAxis": 1,
                        "data": [
                            {"name": "2021", "y": 81.1762},
                            {"name": "2022", "y": 32.31},
                            {"name": "2023", "y": 36.4082},
                        ],
                        "color": "#D9D9D9",
                        "zIndex": 3,
                    },
                    {
                        "name": "Consommation cumulée réelle",
                        "type": "line",
                        "data": [
                            {"name": "2021", "y": 81.1762, "progression": 81.1762},
                            {"name": "2022", "y": 113.4862, "progression": 32.31},
                            {"name": "2023", "y": 149.8944, "progression": 36.4082},
                        ],
                        "color": "#b5b5b5",
                        "zIndex": 6,
                    },
                    {
                        "name": "Consommation annualisée selon objectif national (50%)",
                        "yAxis": 1,
                        "data": [
                            {"name": "2021", "y": 41.38727},
                            {"name": "2022", "y": 41.38727},
                            {"name": "2023", "y": 41.38727},
                            {"name": "2024", "y": 41.38727},
                            {"name": "2025", "y": 41.38727},
                            {"name": "2026", "y": 41.38727},
                            {"name": "2027", "y": 41.38727},
                            {"name": "2028", "y": 41.38727},
                            {"name": "2029", "y": 41.38727},
                            {"name": "2030", "y": 41.38727},
                        ],
                        "color": "#bce3d5",
                        "zIndex": 2,
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
                    "filename": "",
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
                    "Consommation annualisée selon objectif national (50%) (ha)",
                    "Consommation annuelle réelle (ha)",
                    "Consommation cumulée réelle (ha)",
                    "Consommation cumulée selon objectif national (50%) (ha)",
                ],
                "rows": [
                    {"name": "2024", "data": ["-", "-", "2024", 165.54908, 41.38727]},
                    {
                        "name": "2025",
                        "data": ["-", "-", "2025", 206.93635, 41.38727],
                    },
                    {
                        "name": "2026",
                        "data": ["-", "-", "2026", 248.32362, 41.38727],
                    },
                    {"name": "2027", "data": ["-", "-", "2027", 289.71089, 41.38727]},
                    {"name": "2028", "data": ["-", "-", "2028", 331.09816, 41.38727]},
                    {"name": "2029", "data": ["-", "-", "2029", 372.48543, 41.38727]},
                    {"name": "2030", "data": ["-", "-", "2030", 41.38727, 413.8727]},
                    {"name": "2021", "data": ["2021", 41.38727, 41.38727, 81.1762, 81.1762]},
                    {"name": "2022", "data": ["2022", 113.4862, 32.31, 41.38727, 82.77454]},
                    {"name": "2023", "data": ["2023", 124.16181, 149.8944, 36.4082, 41.38727]},
                ],
            },
        }
    )
