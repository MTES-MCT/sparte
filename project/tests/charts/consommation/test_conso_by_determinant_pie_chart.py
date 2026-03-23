# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_conso_by_determinant_pie_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/pie_determinant/EPCI/200046977",
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
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "chart": {"type": "pie"},
                "title": {"text": "Consommation d'espaces par destination à Métropole de Lyon (2011 - 2022)"},
                "tooltip": {"enabled": False},
                "plotOptions": {
                    "pie": {
                        "allowPointSelect": True,
                        "cursor": "pointer",
                        "dataLabels": {
                            "distance": 15,
                            "enabled": True,
                            "format": "{point.name}<br />{point.y:.2f} Ha",
                        },
                    }
                },
                "series": [
                    {
                        "name": "Destinations",
                        "data": [
                            {"name": "Activité", "y": 382.5182},
                            {"name": "Ferré", "y": 0.1863},
                            {"name": "Habitat", "y": 422.63},
                            {"name": "Inconnu", "y": 16.9856},
                            {"name": "Mixte", "y": 28.1324},
                            {"name": "Route", "y": 90.7791},
                        ],
                    }
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
                    "filename": "Consommation d'espaces par destination à Métropole de Lyon (2011 - 2022)",
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
                "headers": ["Consommation d'espaces NAF (ha) 2011-2022", "Destination"],
                "rows": [
                    {"name": "", "data": ["0.19", "Ferré"]},
                    {"name": "", "data": ["16.99", "Inconnu"]},
                    {"name": "", "data": ["28.13", "Mixte"]},
                    {"name": "", "data": ["382.52", "Activité"]},
                    {"name": "", "data": ["422.63", "Habitat"]},
                    {"name": "", "data": ["90.78", "Route"]},
                    {"name": "", "data": ["941.23", "Total"]},
                ],
                "boldFirstColumn": True,
                "boldLastRow": True,
            },
        }
    )
