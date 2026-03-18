# flake8: noqa: E501
from inline_snapshot import snapshot


def test_annual_conso_proportional_comparison_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/surface_proportional_chart/DEPART/92",
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
                "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "bottom"},
                "title": {
                    "text": "Consommation d'espaces NAF relative à la surface de Hauts-de-Seine et des territoires de comparaison (2015 - 2020)"
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
                        "data": [{"name": "Hauts-de-Seine", "value": 17557.496299, "colorValue": 0.178461094146918}],
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
                    "filename": "Consommation d'espaces NAF relative à la surface de Hauts-de-Seine et des territoires de comparaison (2015 - 2020)",
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
                "headers": ["Territoire", "Surface (ha)", "Consommation totale (ha)", "Proportion (%)"],
                "rows": [
                    {"name": "Hauts-de-Seine", "data": ["Hauts-de-Seine", 17557.496299, 31.3333, 0.178461094146918]}
                ],
                "boldFirstColumn": True,
            },
        }
    )
