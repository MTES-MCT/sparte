# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_net_flux_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/imper_net_flux/DEPART/92",
        {"millesime_new_index": 2, "millesime_old_index": 1, "departement": 92},
    )
    assert response.status_code == 200
    assert response.json() == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}
                },
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Imperméabilisation nette (92)"},
                "yAxis": {"title": {"text": "Surface (en ha)"}},
                "tooltip": {
                    "pointFormat": "{point.y}",
                    "valueSuffix": " Ha",
                    "valueDecimals": 2,
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "xAxis": {"type": "category"},
                "plotOptions": {
                    "column": {
                        "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                        "pointPadding": 0.2,
                        "borderWidth": 0,
                    }
                },
                "series": [
                    {
                        "data": [
                            {"name": "Imperméabilisation", "y": 185.95673412, "color": "#FA4B42"},
                            {"name": "Désimperméabilisation", "y": -97.36836597, "color": "#00E272"},
                            {"name": "Imperméabilisation nette", "y": 88.58836815, "color": "#6A6AF4"},
                        ]
                    }
                ],
                "lang": {
                    "noData": "Aucun changement du sol n'est à l'origine d'imperméabilisation sur cette période."
                },
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
                    "filename": "Imperméabilisation nette (92)",
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
                    "Imperméabilisation (ha) - 2018-2021",
                    "Désimperméabilisation (ha) - 2018-2021",
                    "Imperméabilisation nette (ha) - 2018-2021",
                ],
                "rows": [{"name": "", "data": [185.96, 97.37, 88.59]}],
            },
        }
    )
