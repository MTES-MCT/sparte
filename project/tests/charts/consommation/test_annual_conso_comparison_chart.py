# flake8: noqa: E501
from inline_snapshot import snapshot


def test_annual_conso_comparison_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/comparison_chart/DEPART/92",
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
                "legend": {"enabled": False},
                "chart": {"type": "column", "height": 500},
                "title": {
                    "text": "Consommation d'espaces NAF de Hauts-de-Seine et des territoires de comparaison (2015 et 2020)"
                },
                "subtitle": {"text": "Cliquez sur un territoire pour voir le détail de sa consommation d'espaces."},
                "yAxis": {"title": {"text": "Consommation d'espaces (ha)"}},
                "xAxis": {"type": "category", "labels": {"rotation": -45, "align": "right"}},
                "series": [
                    {
                        "name": "Tous les territoires",
                        "data": [
                            {"name": "Hauts-de-Seine", "y": 31.333299999999998, "land_id": "92", "land_type": "DEPART"}
                        ],
                        "color": "#FA4B42",
                        "grouping": False,
                        "tooltip": {
                            "headerFormat": "<b>{point.key}</b><br/>",
                            "pointFormat": "Consommation d'espaces NAF entre 2015 et 2020 : <b>{point.y:.2f} ha</b>",
                        },
                    }
                ],
                "plotOptions": {"series": {"cursor": "pointer"}},
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
                    "filename": "Consommation d'espaces NAF de Hauts-de-Seine et des territoires de comparaison (2015 et 2020)",
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
                "headers": ["Territoire", "Consommation totale (ha)"],
                "rows": [{"name": "Hauts-de-Seine", "data": ["Hauts-de-Seine", 31.333299999999998]}],
                "boldFirstColumn": True,
            },
        }
    )
