# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_imper_flux_by_couverture(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/imper_flux_by_couverture/EPCI/200046977",
        {"millesime_new_index": 2, "departement": 69},
    )
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}
                },
                "legend": {"align": "center", "verticalAlign": "top", "layout": "horizontal"},
                "chart": {"type": "column"},
                "title": {"text": "Imperméabilisation par couverture (69)"},
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
                    {"name": "Désimperméabilisation", "data": [-62.12979277, -87.46569817], "color": "#00E272"},
                    {"name": "Imperméabilisation nette", "data": [138.93275487, 190.63652663], "color": "#6A6AF4"},
                    {"name": "Imperméabilisation", "data": [226.39845304, 252.7663194], "color": "#FA4B42"},
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
                    "filename": "Imperméabilisation par couverture (69)",
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
                    "Code",
                    "Couverture",
                    "Désimperméabilisation (ha) - 2017-2020",
                    "Imperméabilisation (ha) - 2017-2020",
                    "Imperméabilisation nette (ha) - 2017-2020",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 190.64, 252.77, 62.13]},
                    {"name": "", "data": ["CS1.1.1.2", "Zones non bâties", 138.93, 226.4, 87.47]},
                ],
            },
        }
    )
