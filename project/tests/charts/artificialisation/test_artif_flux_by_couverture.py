# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_flux_by_couverture(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/artif_flux_by_couverture/EPCI/200046977",
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
                "title": {"text": "Artificialisation par couverture entre 2017 et 2020 (69)"},
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
                        "Formations herbacées (CS2.2.1) <span style='color:#ccf24d'></span>",
                        "Peuplement de conifères (CS2.1.1.2) <span style='color:#00a600'></span>",
                        "Peuplement de feuillus (CS2.1.1.1) <span style='color:#80ff00'></span>",
                        "Peuplement mixte (CS2.1.1.3) <span style='color:#80be00'></span>",
                        "Zones à matériaux minéraux (CS1.1.2.1) <span style='color:#ff9'></span>",
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
                    {
                        "name": "Désartificialisation",
                        "data": [
                            -0.0,
                            -0.0,
                            -1.57790636,
                            -15.83704624,
                            -28.82938128,
                            -3.14653365,
                            -3.20811607,
                        ],
                        "color": "#00E272",
                    },
                    {
                        "name": "Artificialisation nette",
                        "data": [
                            0.25183531,
                            0.52597411,
                            29.31608758,
                            37.10178767,
                            37.28558574,
                            38.2684227,
                            6.48861259,
                        ],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Artificialisation",
                        "data": [
                            0.25183531,
                            0.52597411,
                            38.8634921,
                            41.47653877,
                            45.15313382,
                            65.93116895,
                            9.63514624,
                        ],
                        "color": "#FA4B42",
                    },
                ],
                "lang": {"noData": "Aucun changement du sol n'est à l'origine d'artificialisation sur cette période."},
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
                    "filename": "Artificialisation par couverture entre 2017 et 2020 (69)",
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
                    "Artificialisation (ha) - 2017-2020",
                    "Artificialisation nette (ha) - 2017-2020",
                    "Code",
                    "Couverture",
                    "Désartificialisation (ha) - 2017-2020",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 3.21, 38.27, 41.48]},
                    {"name": "", "data": ["CS1.1.1.2", "Zones non bâties", 1.58, 37.29, 38.86]},
                    {"name": "", "data": ["CS1.1.2.1", "Zones à matériaux minéraux", 28.83, 37.1, 65.93]},
                    {"name": "", "data": ["CS2.1.1.1", "Peuplement de feuillus", 3.15, 6.49, 9.64]},
                    {"name": "", "data": ["CS2.1.1.2", "Peuplement de conifères", 0.0, 0.25, 0.25]},
                    {"name": "", "data": ["CS2.1.1.3", "Peuplement mixte", 0.0, 0.53, 0.53]},
                    {"name": "", "data": ["CS2.2.1", "Formations herbacées", 15.84, 29.32, 45.15]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
