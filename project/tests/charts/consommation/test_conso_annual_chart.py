# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_conso_annual_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/conso_annual/EPCI/200046977")
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "noData": {
                    "style": {
                        "position": "absolute",
                        "backgroundColor": "#ffffff",
                        "textAlign": "center",
                        "textAlignLast": "center",
                        "fontSize": "0.85em",
                        "padding": "15px",
                    }
                },
                "legend": {"enabled": False},
                "title": {
                    "text": "Consommation annuelle d'espaces NAF de Métropole de Lyon (2011-2023)",
                    "style": {"fontSize": "14px", "fontWeight": "600"},
                    "margin": 25,
                },
                "series": [
                    {
                        "name": "Consommation totale",
                        "data": [
                            {"name": "2011", "y": 80.3176},
                            {"name": "2012", "y": 107.927},
                            {"name": "2013", "y": 123.8875},
                            {"name": "2014", "y": 82.5823},
                            {"name": "2015", "y": 116.128},
                            {"name": "2016", "y": 73.6576},
                            {"name": "2017", "y": 65.4311},
                            {"name": "2018", "y": 68.8792},
                            {"name": "2019", "y": 44.2812},
                            {"name": "2020", "y": 64.6539},
                            {"name": "2021", "y": 81.1762},
                            {"name": "2022", "y": 32.31},
                            {"name": "2023", "y": 36.4082},
                        ],
                    }
                ],
                "chart": {"type": "column", "height": 280},
                "yAxis": {"title": {"text": ""}},
                "xAxis": {
                    "type": "category",
                    "plotBands": [
                        {
                            "color": "#f5f5f5",
                            "from": -0.5,
                            "to": 9.5,
                            "label": {
                                "text": "Période de référence de la loi Climat & Résilience",
                                "style": {"color": "#666666", "fontWeight": "600"},
                            },
                            "className": "plotband_blue",
                        }
                    ],
                },
                "tooltip": {
                    "valueSuffix": " ha",
                    "valueDecimals": 2,
                    "pointFormat": "Consommation: {point.y:,.1f} ha",
                    "headerFormat": "<b>{point.key}</b><br/>",
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
                    "filename": "Consommation annuelle d'espaces NAF de Métropole de Lyon (2011-2023)",
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
                "headers": ["Année", "Consommation totale (ha)"],
                "rows": [
                    {"name": "2012", "data": [107.927, 2012]},
                    {"name": "2015", "data": [116.128, 2015]},
                    {"name": "2013", "data": [123.8875, 2013]},
                    {"name": "2011", "data": [2011, 80.3176]},
                    {"name": "2014", "data": [2014, 82.5823]},
                    {"name": "2016", "data": [2016, 73.6576]},
                    {"name": "2017", "data": [2017, 65.4311]},
                    {"name": "2018", "data": [2018, 68.8792]},
                    {"name": "2019", "data": [2019, 44.2812]},
                    {"name": "2020", "data": [2020, 64.6539]},
                    {"name": "2021", "data": [2021, 81.1762]},
                    {"name": "2022", "data": [2022, 32.31]},
                    {"name": "2023", "data": [2023, 36.4082]},
                ],
            },
        }
    )
