# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_annual_conso_comparison_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/comparison_chart/EPCI/200046977",
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
                "legend": {"enabled": False},
                "chart": {"type": "column", "height": 500},
                "title": {
                    "text": "Consommation d'espaces NAF de Métropole de Lyon et des territoires de comparaison (2015 et 2020)"
                },
                "subtitle": {"text": "Cliquez sur un territoire pour voir le détail de sa consommation d'espaces."},
                "yAxis": {"title": {"text": "Consommation d'espaces (ha)"}},
                "xAxis": {"type": "category", "labels": {"rotation": -45, "align": "right"}},
                "series": [
                    {
                        "name": "Tous les territoires",
                        "data": [
                            {
                                "name": "Métropole de Lyon",
                                "y": 433.03100000000006,
                                "land_id": "200046977",
                                "land_type": "EPCI",
                            }
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
                    "filename": "Consommation d'espaces NAF de Métropole de Lyon et des territoires de comparaison (2015 et 2020)",
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
                "headers": ["Consommation totale (ha)", "Territoire"],
                "rows": [{"name": "Métropole de Lyon", "data": ["Métropole de Lyon", 433.03100000000006]}],
                "boldFirstColumn": True,
            },
        }
    )
