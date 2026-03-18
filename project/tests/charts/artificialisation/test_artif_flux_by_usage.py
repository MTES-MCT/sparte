# flake8: noqa: E501
from inline_snapshot import snapshot


def test_artif_flux_by_usage(client, hauts_de_seine):
    response = client.get(
        "/api/chart/artif_flux_by_usage/DEPART/92",
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
                "title": {"text": "Artificialisation par usage entre 2018 et 2021 (92 - Hauts-de-Seine)"},
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
                        "Résidentiel (US5) <span style='color:#BE0961'></span>",
                        "Sans usage (US6.3) <span style='color:#F0F028'></span>",
                        "Secondaire (US2) <span style='color:#E6004D'></span>",
                        "Tertiaire (US3) <span style='color:#FF8C00'></span>",
                        "Zones en transition (US6.1) <span style='color:#FF4DFF'></span>",
                        "Transport ferré (US4.1.2) <span style='color:#5A5A5A'></span>",
                        "Agriculture (US1.1) <span style='color:#FFFFA8'></span>",
                        "Transport routier (US4.1.1) <span style='color:#CC0000'></span>",
                        "Réseaux d’utilité publique (US4.3) <span style='color:#FF4B00'></span>",
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
                        "name": "Artificialisation",
                        "data": [
                            9.86953945,
                            0.39285379,
                            1.49353874,
                            7.17288667,
                            20.6876205,
                            1.27567697,
                            0.0,
                            1.22677873,
                            0.0,
                        ],
                        "color": "#FA4B42",
                    },
                    {
                        "name": "Désartificialisation",
                        "data": [
                            -1.94361567,
                            -0.0,
                            -0.40279062,
                            -5.5723064,
                            -1.23951572,
                            -0.0,
                            -0.07255515,
                            -0.06405532,
                            -1.95758058,
                        ],
                        "color": "#00E272",
                    },
                    {
                        "name": "Artificialisation nette",
                        "data": [
                            7.92592378,
                            0.39285379,
                            1.09074812,
                            1.60058027,
                            19.44810478,
                            1.27567697,
                            -0.07255515,
                            1.16272341,
                            -1.95758058,
                        ],
                        "color": "#6A6AF4",
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
                    "filename": "Artificialisation par usage entre 2018 et 2021 (92 - Hauts-de-Seine)",
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
                    "Usage",
                    "Artificialisation (ha) - 2018-2021",
                    "Désartificialisation (ha) - 2018-2021",
                    "Artificialisation nette (ha) - 2018-2021",
                ],
                "rows": [
                    {"name": "", "data": ["US5", "Résidentiel", 9.87, 1.94, 7.93]},
                    {"name": "", "data": ["US6.3", "Sans usage", 0.39, 0.0, 0.39]},
                    {"name": "", "data": ["US2", "Secondaire", 1.49, 0.4, 1.09]},
                    {"name": "", "data": ["US3", "Tertiaire", 7.17, 5.57, 1.6]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 20.69, 1.24, 19.45]},
                    {"name": "", "data": ["US4.1.2", "Transport ferré", 1.28, 0.0, 1.28]},
                    {"name": "", "data": ["US1.1", "Agriculture", 0.0, 0.07, -0.07]},
                    {"name": "", "data": ["US4.1.1", "Transport routier", 1.23, 0.06, 1.16]},
                    {"name": "", "data": ["US4.3", "Réseaux d’utilité publique", 0.0, 1.96, -1.96]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
