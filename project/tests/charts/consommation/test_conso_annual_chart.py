# flake8: noqa: E501
from inline_snapshot import snapshot


def test_conso_annual_chart(client, hauts_de_seine):
    response = client.get("/api/chart/conso_annual/DEPART/92")
    assert response.status_code == 200
    assert response.json() == snapshot(
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
                    "text": "Consommation annuelle d'espaces NAF de Hauts-de-Seine (2011-2023)",
                    "style": {"fontSize": "14px", "fontWeight": "600"},
                    "margin": 25,
                },
                "series": [
                    {
                        "name": "Consommation totale",
                        "data": [
                            {"name": "2011", "y": 1.5031},
                            {"name": "2012", "y": 3.8072},
                            {"name": "2013", "y": 3.3231},
                            {"name": "2014", "y": 2.5464},
                            {"name": "2015", "y": 23.8342},
                            {"name": "2016", "y": 0.6894},
                            {"name": "2017", "y": 1.1492},
                            {"name": "2018", "y": 2.5004},
                            {"name": "2019", "y": 1.0057},
                            {"name": "2020", "y": 2.1544},
                            {"name": "2021", "y": 0.3791},
                            {"name": "2022", "y": 0.4198},
                            {"name": "2023", "y": 1.168},
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
                    "filename": "Consommation annuelle d'espaces NAF de Hauts-de-Seine (2011-2023)",
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
                "headers": ["Année", "Consommation totale (ha)"],
                "rows": [
                    {"name": "2011", "data": [2011, 1.5031]},
                    {"name": "2012", "data": [2012, 3.8072]},
                    {"name": "2013", "data": [2013, 3.3231]},
                    {"name": "2014", "data": [2014, 2.5464]},
                    {"name": "2015", "data": [2015, 23.8342]},
                    {"name": "2016", "data": [2016, 0.6894]},
                    {"name": "2017", "data": [2017, 1.1492]},
                    {"name": "2018", "data": [2018, 2.5004]},
                    {"name": "2019", "data": [2019, 1.0057]},
                    {"name": "2020", "data": [2020, 2.1544]},
                    {"name": "2021", "data": [2021, 0.3791]},
                    {"name": "2022", "data": [2022, 0.4198]},
                    {"name": "2023", "data": [2023, 1.168]},
                ],
            },
        }
    )
