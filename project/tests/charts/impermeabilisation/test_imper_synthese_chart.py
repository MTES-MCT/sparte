# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_synthese_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/imper_synthese/DEPART/92",
        {"departement": 92},
    )
    assert response.status_code == 200
    assert response.json() == snapshot(
        {
            "highcharts_options": {
                "chart": {"type": "bar"},
                "title": {
                    "text": "Evolution du stock de surfaces imperméabilisées de Hauts-de-Seine entre 2018 et 2021"
                },
                "xAxis": {"categories": ["2018", "2021"], "title": {"text": None}},
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
                                "y": 56.4586670198221,
                                "flux_percent_str": "",
                                "flux_stock_str": "",
                                "stock": 9912.72837247,
                            },
                            {
                                "y": 56.9633811661952,
                                "flux_percent_str": '<span style="color: var(--text-default-error)">(+0.5%)</span>',
                                "flux_stock_str": "<span style='color: var(--text-default-error)'>(+88.62 ha)</span>",
                                "stock": 10001.34354004,
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
                    "filename": "Evolution du stock de surfaces imperméabilisées de Hauts-de-Seine entre 2018 et 2021",
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
            "data_table": {"headers": [], "rows": []},
        }
    )
