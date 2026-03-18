# flake8: noqa: E501
from inline_snapshot import snapshot


def test_conso_by_determinant_pie_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/pie_determinant/DEPART/92",
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
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "chart": {"type": "pie"},
                "title": {"text": "Consommation d'espaces par destination à Hauts-de-Seine (2011 - 2022)"},
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
                            {"name": "Habitat", "y": 8.1495},
                            {"name": "Activité", "y": 22.2289},
                            {"name": "Mixte", "y": 0.678},
                            {"name": "Route", "y": 11.3952},
                            {"name": "Ferré", "y": 0.6211},
                            {"name": "Inconnu", "y": 0.2393},
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
                    "filename": "Consommation d'espaces par destination à Hauts-de-Seine (2011 - 2022)",
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
                "headers": ["Destination", "Consommation d'espaces NAF (ha) 2011-2022"],
                "rows": [
                    {"name": "", "data": ["Habitat", "8.15"]},
                    {"name": "", "data": ["Activité", "22.23"]},
                    {"name": "", "data": ["Mixte", "0.68"]},
                    {"name": "", "data": ["Route", "11.40"]},
                    {"name": "", "data": ["Ferré", "0.62"]},
                    {"name": "", "data": ["Inconnu", "0.24"]},
                    {"name": "", "data": ["Total", "43.31"]},
                ],
                "boldFirstColumn": True,
                "boldLastRow": True,
            },
        }
    )
