# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_annual_conso_proportional_comparison_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/surface_proportional_chart/EPCI/200046977",
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
                "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "bottom"},
                "title": {
                    "text": "Consommation d'espaces NAF relative à la surface de Métropole de Lyon et des territoires de comparaison (2015 - 2020)"
                },
                "subtitle": {"text": "La taille des zones est proportionnelle à la surface des territoires."},
                "tooltip": {
                    "pointFormat": "Surface du territoire : <b>{point.value:.2f} ha</b><br />Consommation d'espaces relative à la surface du territoire : <b>{point.colorValue:.2f} %</b>",
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "colorAxis": {"minColor": "#FFFFFF", "maxColor": "#6a6af4"},
                "chart": {"height": "500"},
                "series": [
                    {
                        "type": "treemap",
                        "layoutAlgorithm": "squarified",
                        "clip": False,
                        "dataLabels": {
                            "enabled": True,
                            "format": "{point.name}<br />{point.colorValue:.2f} %",
                            "style": {"fontWeight": "bold", "textOutline": "none"},
                        },
                        "data": [
                            {"name": "Métropole de Lyon", "value": 53745.5425060001, "colorValue": 0.805705887054088}
                        ],
                        "states": {"hover": {"enabled": False}},
                        "borderWidth": 1,
                        "borderColor": "#A1A1F8",
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
                    "filename": "Consommation d'espaces NAF relative à la surface de Métropole de Lyon et des territoires de comparaison (2015 - 2020)",
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
                "headers": ["Consommation totale (ha)", "Proportion (%)", "Surface (ha)", "Territoire"],
                "rows": [
                    {
                        "name": "Métropole de Lyon",
                        "data": ["Métropole de Lyon", 0.805705887054088, 433.031, 53745.5425060001],
                    }
                ],
                "boldFirstColumn": True,
            },
        }
    )
