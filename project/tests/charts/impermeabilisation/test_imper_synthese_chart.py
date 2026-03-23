# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_imper_synthese_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/imper_synthese/EPCI/200046977",
        {"departement": 69},
    )
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "chart": {"type": "bar"},
                "title": {
                    "text": "Evolution du stock de surfaces imperméabilisées de Métropole de Lyon entre 2017 et 2020"
                },
                "xAxis": {"categories": ["2017", "2020"], "title": {"text": None}},
                "yAxis": {
                    "min": 0,
                    "title": {"text": "%", "align": "high"},
                    "labels": {"overflow": "justify"},
                    "gridLineWidth": 0,
                },
                "tooltip": {
                    "valueSuffix": " %",
                    "valueDecimals": 2,
                    "pointFormat": """\

                    Part imperméabilisée : <b>{point.y:.2f}%</b> {point.flux_percent_str} <br/>
                    Surface imperméabilisée : <b>{point.stock:,.2f} ha</b> {point.flux_stock_str}
                \
""",
                },
                "plotOptions": {"bar": {"dataLabels": {"enabled": True, "format": "{point.y:.2f}%"}}},
                "legend": {"enabled": False},
                "credits": {"enabled": False},
                "series": [
                    {
                        "name": "Stock d'imperméabilisation",
                        "data": [
                            {
                                "y": 32.2450591918116,
                                "flux_percent_str": "",
                                "flux_stock_str": "",
                                "stock": 17330.28199402,
                            },
                            {
                                "y": 32.8670150780001,
                                "flux_percent_str": '<span style="color: var(--text-default-error)">(+0.62%)</span>',
                                "flux_stock_str": "<span style='color: var(--text-default-error)'>(+334.27 ha)</span>",
                                "stock": 17664.5555592,
                            },
                        ],
                        "color": "#f4cfc4",
                    }
                ],
                "navigation": {"buttonOptions": {"enabled": False}},
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
                    "filename": "Evolution du stock de surfaces imperméabilisées de Métropole de Lyon entre 2017 et 2020",
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
            "data_table": {"headers": [], "rows": []},
        }
    )
