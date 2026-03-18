# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_flux_by_couverture(client, hauts_de_seine):
    response = client.get(
        "/api/chart/imper_flux_by_couverture/DEPART/92",
        {"millesime_new_index": 2, "departement": 92},
    )
    assert response.status_code == 200
    assert response.json() == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}
                },
                "legend": {"align": "center", "verticalAlign": "top", "layout": "horizontal"},
                "chart": {"type": "column"},
                "title": {"text": "Imperméabilisation par couverture (92)"},
                "tooltip": {
                    "pointFormat": "{point.y}",
                    "valueSuffix": " Ha",
                    "valueDecimals": 2,
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "xAxis": {
                    "minPadding": 0.2,
                    "maxPadding": 0.2,
                    "startOnTick": True,
                    "endOnTick": True,
                    "categories": [
                        "Zones bâties (CS1.1.1.1) <span style='color:#ff377a'></span>",
                        "Zones non bâties (CS1.1.1.2) <span style='color:#ff9191'></span>",
                    ],
                    "crop": False,
                    "overflow": "allow",
                },
                "yAxis": {
                    "title": {"text": "Surface (en ha)"},
                    "plotLines": [{"value": 0, "color": "black", "width": 2}],
                },
                "plotOptions": {
                    "column": {
                        "dataLabels": {"enabled": True, "format": "{point.y:,.2f}", "allowOverlap": True},
                        "groupPadding": 0.2,
                        "borderWidth": 0,
                    }
                },
                "series": [
                    {"name": "Imperméabilisation", "data": [110.48981547, 75.46691865], "color": "#FA4B42"},
                    {"name": "Désimperméabilisation", "data": [-52.26506804, -45.10329793], "color": "#00E272"},
                    {"name": "Imperméabilisation nette", "data": [58.22474743, 30.36362072], "color": "#6A6AF4"},
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
                    "filename": "Imperméabilisation par couverture (92)",
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
                    "Code",
                    "Couverture",
                    "Imperméabilisation (ha) - 2018-2021",
                    "Désimperméabilisation (ha) - 2018-2021",
                    "Imperméabilisation nette (ha) - 2018-2021",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 110.49, 52.27, 58.22]},
                    {"name": "", "data": ["CS1.1.1.2", "Zones non bâties", 75.47, 45.1, 30.36]},
                ],
            },
        }
    )
