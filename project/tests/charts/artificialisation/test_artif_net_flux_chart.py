# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_net_flux_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/artif_net_flux/EPCI/200046977",
        {"millesime_new_index": 2, "millesime_old_index": 1, "departement": 69},
    )
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}
                },
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Artificialisation nette entre 2017 et 2020 (69)"},
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
                            {"name": "Désartificialisation", "y": -52.5989836, "color": "#00E272"},
                            {"name": "Artificialisation nette", "y": 149.2383057, "color": "#6A6AF4"},
                            {"name": "Artificialisation", "y": 201.8372893, "color": "#FA4B42"},
                        ]
                    }
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
                    "filename": "Artificialisation nette entre 2017 et 2020 (69)",
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
                    "Désartificialisation (ha) - 2017-2020",
                ],
                "rows": [{"name": "", "data": ["-52.6", 149.24, 201.84]}],
            },
        }
    )
