# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_imper_flux_by_usage(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/imper_flux_by_usage/EPCI/200046977",
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
                "title": {"text": "Imperméabilisation par usage (69)"},
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
                        "Secondaire (US2) <span style='color:#E6004D'></span>",
                        "Tertiaire (US3) <span style='color:#FF8C00'></span>",
                        "Transport aérien (US4.1.3) <span style='color:#E6CCE6'></span>",
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
                        "name": "Désimperméabilisation",
                        "data": [
                            -0.00135086,
                            -0.07531611,
                            -0.07615984,
                            -0.11189388,
                            -0.4728776,
                            -0.63318584,
                            -1.41255497,
                            -1.64902152,
                            -12.07219485,
                            -23.63809655,
                            -35.81067686,
                            -73.64216206,
                        ],
                        "color": "#00E272",
                    },
                    {
                        "name": "Imperméabilisation nette",
                        "data": [
                            -0.07531611,
                            -0.07615984,
                            -0.11094548,
                            0.01857173,
                            0.28703372,
                            0.63811662,
                            157.37028092,
                            19.94629107,
                            2.56073323,
                            25.90464317,
                            31.70975887,
                            91.3962736,
                        ],
                        "color": "#6A6AF4",
                    },
                    {
                        "name": "Imperméabilisation",
                        "data": [
                            0.0,
                            0.0,
                            0.0009484,
                            0.01992259,
                            0.75991132,
                            1.27130246,
                            165.03843566,
                            181.00837747,
                            21.35884604,
                            37.97683802,
                            4.20975475,
                            67.52043573,
                        ],
                        "color": "#FA4B42",
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
                    "filename": "Imperméabilisation par usage (69)",
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
                    "Désimperméabilisation (ha) - 2017-2020",
                    "Imperméabilisation (ha) - 2017-2020",
                    "Imperméabilisation nette (ha) - 2017-2020",
                    "Usage",
                ],
                "rows": [
                    {"name": "", "data": ["Activités d’extraction", "US1.3", -0.08, 0.0, 0.08]},
                    {"name": "", "data": ["Agriculture", "US1.1", 1.65, 2.56, 4.21]},
                    {"name": "", "data": ["Production secondaire; tertiai...", "US235", 0.0, 0.02, 0.02]},
                    {"name": "", "data": ["Réseaux d’utilité publique", "US4.3", 0.29, 0.47, 0.76]},
                    {"name": "", "data": ["Résidentiel", "US5", 157.37, 181.01, 23.64]},
                    {"name": "", "data": ["Secondaire", "US2", 31.71, 35.81, 67.52]},
                    {"name": "", "data": ["Tertiaire", "US3", 165.04, 73.64, 91.4]},
                    {"name": "", "data": ["Transport aérien", "US4.1.3", -0.11, 0.0, 0.11]},
                    {"name": "", "data": ["Transport ferré", "US4.1.2", 0.63, 0.64, 1.27]},
                    {"name": "", "data": ["Transport routier", "US4.1.1", 12.07, 25.9, 37.98]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 1.41, 19.95, 21.36]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", -0.08, 0.0, 0.08]},
                ],
            },
        }
    )
