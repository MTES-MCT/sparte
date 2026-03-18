# flake8: noqa: E501
from inline_snapshot import snapshot


def test_artif_flux_by_couverture(client, hauts_de_seine):
    response = client.get(
        "/api/chart/artif_flux_by_couverture/DEPART/92",
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
                "title": {"text": "Artificialisation par couverture entre 2018 et 2021 (92 - Hauts-de-Seine)"},
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
                        "Zones bâties (CS1.1.1.1) <span style='color:#ff377a'></span>",
                        "Zones à matériaux minéraux (CS1.1.2.1) <span style='color:#ff9'></span>",
                        "Zones non bâties (CS1.1.1.2) <span style='color:#ff9191'></span>",
                        "Peuplement de feuillus (CS2.1.1.1) <span style='color:#80ff00'></span>",
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
                        "data": [4.24324096, 11.32845325, 18.40819264, 4.25002557, 3.88898243],
                        "color": "#FA4B42",
                    },
                    {
                        "name": "Désartificialisation",
                        "data": [-4.57084037, -0.47567023, -4.95487081, -0.30115082, -0.94988723],
                        "color": "#00E272",
                    },
                    {
                        "name": "Artificialisation nette",
                        "data": [-0.32759941, 10.85278302, 13.45332183, 3.94887475, 2.9390952],
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
                    "filename": "Artificialisation par couverture entre 2018 et 2021 (92 - Hauts-de-Seine)",
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
                    "Artificialisation (ha) - 2018-2021",
                    "Désartificialisation (ha) - 2018-2021",
                    "Artificialisation nette (ha) - 2018-2021",
                ],
                "rows": [
                    {"name": "", "data": ["CS2.2.1", "Formations herbacées", 4.24, 4.57, -0.33]},
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 11.33, 0.48, 10.85]},
                    {"name": "", "data": ["CS1.1.2.1", "Zones à matériaux minéraux", 18.41, 4.95, 13.45]},
                    {"name": "", "data": ["CS1.1.1.2", "Zones non bâties", 4.25, 0.3, 3.95]},
                    {"name": "", "data": ["CS2.1.1.1", "Peuplement de feuillus", 3.89, 0.95, 2.94]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
