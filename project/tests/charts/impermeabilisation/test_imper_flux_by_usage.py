# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_flux_by_usage(client, hauts_de_seine):
    response = client.get(
        "/api/chart/imper_flux_by_usage/DEPART/92",
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
                "title": {"text": "Imperméabilisation par usage (92)"},
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
                        "Zones en transition (US6.1) <span style='color:#FF4DFF'></span>",
                        "Tertiaire (US3) <span style='color:#FF8C00'></span>",
                        "Agriculture (US1.1) <span style='color:#FFFFA8'></span>",
                        "Réseaux d’utilité publique (US4.3) <span style='color:#FF4B00'></span>",
                        "Résidentiel (US5) <span style='color:#BE0961'></span>",
                        "Transport ferré (US4.1.2) <span style='color:#5A5A5A'></span>",
                        "Zones abandonnées (US6.2) <span style='color:#404040'></span>",
                        "Production secondaire; tertiai... (US235) <span style='color:#E6004D'></span>",
                        "Secondaire (US2) <span style='color:#E6004D'></span>",
                        "Transport routier (US4.1.1) <span style='color:#CC0000'></span>",
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
                        "name": "Imperméabilisation",
                        "data": [
                            24.19606638,
                            72.03758879,
                            0.0,
                            0.20049566,
                            55.98263348,
                            2.6572322,
                            0.0,
                            0.34596793,
                            9.86241771,
                            20.67433197,
                        ],
                        "color": "#FA4B42",
                    },
                    {
                        "name": "Désimperméabilisation",
                        "data": [
                            -1.72621528,
                            -65.21389342,
                            -0.08276796,
                            -0.0,
                            -18.8119893,
                            -0.51409285,
                            -1.02215544,
                            -0.0,
                            -3.96803665,
                            -6.02921507,
                        ],
                        "color": "#00E272",
                    },
                    {
                        "name": "Imperméabilisation nette",
                        "data": [
                            22.4698511,
                            6.82369537,
                            -0.08276796,
                            0.20049566,
                            37.17064418,
                            2.14313935,
                            -1.02215544,
                            0.34596793,
                            5.89438106,
                            14.6451169,
                        ],
                        "color": "#6A6AF4",
                    },
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
                    "filename": "Imperméabilisation par usage (92)",
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
                    "Imperméabilisation (ha) - 2018-2021",
                    "Désimperméabilisation (ha) - 2018-2021",
                    "Imperméabilisation nette (ha) - 2018-2021",
                ],
                "rows": [
                    {"name": "", "data": ["US6.1", "Zones en transition", 24.2, 1.73, 22.47]},
                    {"name": "", "data": ["US3", "Tertiaire", 72.04, 65.21, 6.82]},
                    {"name": "", "data": ["US1.1", "Agriculture", 0.0, 0.08, -0.08]},
                    {"name": "", "data": ["US4.3", "Réseaux d’utilité publique", 0.2, 0.0, 0.2]},
                    {"name": "", "data": ["US5", "Résidentiel", 55.98, 18.81, 37.17]},
                    {"name": "", "data": ["US4.1.2", "Transport ferré", 2.66, 0.51, 2.14]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", 0.0, 1.02, -1.02]},
                    {"name": "", "data": ["US235", "Production secondaire; tertiai...", 0.35, 0.0, 0.35]},
                    {"name": "", "data": ["US2", "Secondaire", 9.86, 3.97, 5.89]},
                    {"name": "", "data": ["US4.1.1", "Transport routier", 20.67, 6.03, 14.65]},
                ],
            },
        }
    )
