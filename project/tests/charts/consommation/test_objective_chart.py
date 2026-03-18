# flake8: noqa: E501
from inline_snapshot import snapshot


def test_objective_chart(client, hauts_de_seine):
    response = client.get("/api/chart/objective_chart/DEPART/92")
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
                "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "bottom", "symbolRadius": 0},
                "chart": {"type": "column"},
                "title": {"text": ""},
                "yAxis": [
                    {
                        "title": {"text": "Consommation cumulée (en ha)"},
                        "labels": {"format": "{value} Ha"},
                        "opposite": True,
                    },
                    {"title": {"text": "Consommation annualisée"}, "labels": {"format": "{value} Ha"}, "min": 0},
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
                        "name": "Consommation annuelle réelle",
                        "yAxis": 1,
                        "data": [
                            {"name": "2021", "y": 0.3791},
                            {"name": "2022", "y": 0.4198},
                            {"name": "2023", "y": 1.168},
                        ],
                        "color": "#D9D9D9",
                        "zIndex": 3,
                    },
                    {
                        "name": "Consommation cumulée réelle",
                        "data": [
                            {"name": "2021", "y": 0.3791, "progression": 0.3791},
                            {"name": "2022", "y": 0.7988999999999999, "progression": 0.4198},
                            {"name": "2023", "y": 1.9668999999999999, "progression": 1.168},
                        ],
                        "type": "line",
                        "color": "#b5b5b5",
                        "zIndex": 6,
                    },
                    {
                        "name": "Consommation annualisée selon objectif national (50%)",
                        "yAxis": 1,
                        "data": [
                            {"name": "2021", "y": 2.1256549999999996},
                            {"name": "2022", "y": 2.1256549999999996},
                            {"name": "2023", "y": 2.1256549999999996},
                            {"name": "2024", "y": 2.1256549999999996},
                            {"name": "2025", "y": 2.1256549999999996},
                            {"name": "2026", "y": 2.1256549999999996},
                            {"name": "2027", "y": 2.1256549999999996},
                            {"name": "2028", "y": 2.1256549999999996},
                            {"name": "2029", "y": 2.1256549999999996},
                            {"name": "2030", "y": 2.1256549999999996},
                        ],
                        "color": "#bce3d5",
                        "zIndex": 2,
                    },
                    {
                        "name": "Consommation cumulée selon objectif national (50%)",
                        "data": [
                            {"name": "2021", "y": 2.1256549999999996, "progression": 2.1256549999999996},
                            {"name": "2022", "y": 4.251309999999999, "progression": 2.1256549999999996},
                            {"name": "2023", "y": 6.376964999999998, "progression": 2.1256549999999996},
                            {"name": "2024", "y": 8.502619999999999, "progression": 2.1256549999999996},
                            {"name": "2025", "y": 10.628274999999999, "progression": 2.1256549999999996},
                            {"name": "2026", "y": 12.753929999999999, "progression": 2.1256549999999996},
                            {"name": "2027", "y": 14.879584999999999, "progression": 2.1256549999999996},
                            {"name": "2028", "y": 17.005239999999997, "progression": 2.1256549999999996},
                            {"name": "2029", "y": 19.130894999999995, "progression": 2.1256549999999996},
                            {"name": "2030", "y": 21.256549999999994, "progression": 2.1256549999999996},
                        ],
                        "type": "line",
                        "dashStyle": "ShortDash",
                        "color": "#059669",
                        "zIndex": 5,
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
                    "Consommation annuelle réelle (ha)",
                    "Consommation cumulée réelle (ha)",
                    "Consommation annualisée selon objectif national (50%) (ha)",
                    "Consommation cumulée selon objectif national (50%) (ha)",
                ],
                "rows": [
                    {"name": "2021", "data": ["2021", 0.3791, 0.3791, 2.1256549999999996, 2.1256549999999996]},
                    {
                        "name": "2022",
                        "data": ["2022", 0.4198, 0.7988999999999999, 2.1256549999999996, 4.251309999999999],
                    },
                    {
                        "name": "2023",
                        "data": ["2023", 1.168, 1.9668999999999999, 2.1256549999999996, 6.376964999999998],
                    },
                    {"name": "2024", "data": ["2024", "-", "-", 2.1256549999999996, 8.502619999999999]},
                    {"name": "2025", "data": ["2025", "-", "-", 2.1256549999999996, 10.628274999999999]},
                    {"name": "2026", "data": ["2026", "-", "-", 2.1256549999999996, 12.753929999999999]},
                    {"name": "2027", "data": ["2027", "-", "-", 2.1256549999999996, 14.879584999999999]},
                    {"name": "2028", "data": ["2028", "-", "-", 2.1256549999999996, 17.005239999999997]},
                    {"name": "2029", "data": ["2029", "-", "-", 2.1256549999999996, 19.130894999999995]},
                    {"name": "2030", "data": ["2030", "-", "-", 2.1256549999999996, 21.256549999999994]},
                ],
            },
        }
    )
