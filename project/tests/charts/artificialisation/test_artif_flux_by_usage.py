# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_flux_by_usage(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/artif_flux_by_usage/EPCI/200046977",
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
                "title": {"text": "Artificialisation par usage entre 2017 et 2020 (69)"},
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
                        "Activités d’extraction (US1.3) <span style='color:#A600CC'></span>",
                        "Agriculture (US1.1) <span style='color:#FFFFA8'></span>",
                        "Production secondaire; tertiai... (US235) <span style='color:#E6004D'></span>",
                        "Réseaux d’utilité publique (US4.3) <span style='color:#FF4B00'></span>",
                        "Résidentiel (US5) <span style='color:#BE0961'></span>",
                        "Sans usage (US6.3) <span style='color:#F0F028'></span>",
                        "Secondaire (US2) <span style='color:#E6004D'></span>",
                        "Tertiaire (US3) <span style='color:#FF8C00'></span>",
                        "Transport ferré (US4.1.2) <span style='color:#5A5A5A'></span>",
                        "Transport routier (US4.1.1) <span style='color:#CC0000'></span>",
                        "Zones abandonnées (US6.2) <span style='color:#404040'></span>",
                        "Zones en transition (US6.1) <span style='color:#FF4DFF'></span>",
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
                            -0.02064755,
                            -0.02751636,
                            -0.07531662,
                            -0.24088102,
                            -0.54454499,
                            -0.71985053,
                            -13.24029678,
                            -15.80666646,
                            -5.23268486,
                            -5.26667495,
                            -5.50820408,
                            -5.9156994,
                        ],
                        "color": "#00E272",
                    },
                    {
                        "name": "Artificialisation nette",
                        "data": [
                            -0.02751636,
                            -0.07531662,
                            -0.24088102,
                            -0.54454499,
                            -4.9808393,
                            1.86965455,
                            12.1391495,
                            21.60787383,
                            32.36814663,
                            39.76099857,
                            39.77688411,
                            7.5846968,
                        ],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Artificialisation",
                        "data": [
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.52736478,
                            1.8903021,
                            12.85900003,
                            13.5003962,
                            37.41454029,
                            44.99368343,
                            45.04355906,
                            45.60844341,
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
                    "filename": "Artificialisation par usage entre 2017 et 2020 (69)",
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
                    "Désartificialisation (ha) - 2017-2020",
                    "Usage",
                ],
                "rows": [
                    {"name": "", "data": ["Activités d’extraction", "US1.3", -0.08, 0.0, 0.08]},
                    {"name": "", "data": ["Agriculture", "US1.1", 13.5, 5.92, 7.58]},
                    {"name": "", "data": ["Production secondaire; tertiai...", "US235", -0.54, 0.0, 0.54]},
                    {"name": "", "data": ["Réseaux d’utilité publique", "US4.3", 0.02, 1.87, 1.89]},
                    {"name": "", "data": ["Résidentiel", "US5", 39.76, 44.99, 5.23]},
                    {"name": "", "data": ["Sans usage", "US6.3", -0.24, 0.0, 0.24]},
                    {"name": "", "data": ["Secondaire", "US2", 39.78, 45.04, 5.27]},
                    {"name": "", "data": ["Tertiaire", "US3", 13.24, 32.37, 45.61]},
                    {"name": "", "data": ["Transport ferré", "US4.1.2", -4.98, 0.53, 5.51]},
                    {"name": "", "data": ["Transport routier", "US4.1.1", 0.72, 12.14, 12.86]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 15.81, 21.61, 37.41]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", -0.03, 0.0, 0.03]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
