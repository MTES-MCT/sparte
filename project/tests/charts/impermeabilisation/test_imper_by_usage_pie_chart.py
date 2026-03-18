# flake8: noqa: E501
from inline_snapshot import snapshot


def test_imper_by_usage_pie_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/pie_imper_by_usage/DEPART/92",
        {"index": 1},
    )
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
                "legend": {
                    "itemWidth": 200,
                    "itemStyle": {"textOverflow": None},
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "title": {"text": "Surfaces imperméables par usage  en 2018"},
                "series": [
                    {
                        "name": "Surface imperméable",
                        "data": [
                            {
                                "name": "Agriculture",
                                "y": 0.34121078,
                                "color": "#FFFFA8",
                                "code": "US1.1",
                                "long_name": "Agriculture",
                                "surface": 0.34121078,
                            },
                            {
                                "name": "Secondaire",
                                "y": 242.18413022,
                                "color": "#E6004D",
                                "code": "US2",
                                "long_name": "Secondaire",
                                "surface": 242.18413022,
                            },
                            {
                                "name": "Production secondaire; tertiai...",
                                "y": 0.14711339,
                                "color": "#E6004D",
                                "code": "US235",
                                "long_name": "Production secondaire; tertiaire et usage résidentiel",
                                "surface": 0.14711339,
                            },
                            {
                                "name": "Tertiaire",
                                "y": 2533.33148162,
                                "color": "#FF8C00",
                                "code": "US3",
                                "long_name": "Tertiaire",
                                "surface": 2533.33148162,
                            },
                            {
                                "name": "Transport routier",
                                "y": 2425.06444464,
                                "color": "#CC0000",
                                "code": "US4.1.1",
                                "long_name": "Transport routier",
                                "surface": 2425.06444464,
                            },
                            {
                                "name": "Transport ferré",
                                "y": 30.00574915,
                                "color": "#5A5A5A",
                                "code": "US4.1.2",
                                "long_name": "Transport ferré",
                                "surface": 30.00574915,
                            },
                            {
                                "name": "Services de logistique et de s...",
                                "y": 25.99343807,
                                "color": "#FF0000",
                                "code": "US4.2",
                                "long_name": "Services de logistique et de stockage",
                                "surface": 25.99343807,
                            },
                            {
                                "name": "Réseaux d’utilité publique",
                                "y": 17.22000934,
                                "color": "#FF4B00",
                                "code": "US4.3",
                                "long_name": "Réseaux d’utilité publique",
                                "surface": 17.22000934,
                            },
                            {
                                "name": "Résidentiel",
                                "y": 4600.33185307,
                                "color": "#BE0961",
                                "code": "US5",
                                "long_name": "Résidentiel",
                                "surface": 4600.33185307,
                            },
                            {
                                "name": "Zones en transition",
                                "y": 36.17731305,
                                "color": "#FF4DFF",
                                "code": "US6.1",
                                "long_name": "Zones en transition",
                                "surface": 36.17731305,
                            },
                            {
                                "name": "Zones abandonnées",
                                "y": 1.93162914,
                                "color": "#404040",
                                "code": "US6.2",
                                "long_name": "Zones abandonnées",
                                "surface": 1.93162914,
                            },
                        ],
                    }
                ],
                "chart": {"type": "pie"},
                "tooltip": {
                    "valueSuffix": " Ha",
                    "valueDecimals": 2,
                    "pointFormat": "{point.code} - {point.long_name} - {point.percentage:.1f}% ({point.surface:,.1f} ha)",
                    "headerFormat": "<b>{point.key}</b><br/>",
                },
                "plotOptions": {
                    "pie": {
                        "innerSize": "60%",
                        "dataLabels": {
                            "enabled": True,
                            "overflow": "justify",
                            "format": "{point.name} - {point.percentage:.2f}%",
                            "style": {"textOverflow": "clip", "width": "100px"},
                        },
                    }
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
                    "filename": "Surfaces imperméables par usage  en 2018",
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
                    "Surface (ha)",
                    "Pourcentage de la surface imperméable (%)",
                    "Pourcentage du territoire (%)",
                ],
                "rows": [
                    {"name": "", "data": ["US1.1", "Agriculture", 0.34, 0.0, 0.0]},
                    {"name": "", "data": ["US2", "Secondaire", 242.18, 2.44, 1.38]},
                    {
                        "name": "",
                        "data": ["US235", "Production secondaire; tertiaire et usage résidentiel", 0.15, 0.0, 0.0],
                    },
                    {"name": "", "data": ["US3", "Tertiaire", 2533.33, 25.56, 14.43]},
                    {"name": "", "data": ["US4.1.1", "Transport routier", 2425.06, 24.46, 13.81]},
                    {"name": "", "data": ["US4.1.2", "Transport ferré", 30.01, 0.3, 0.17]},
                    {"name": "", "data": ["US4.2", "Services de logistique et de stockage", 25.99, 0.26, 0.15]},
                    {"name": "", "data": ["US4.3", "Réseaux d’utilité publique", 17.22, 0.17, 0.1]},
                    {"name": "", "data": ["US5", "Résidentiel", 4600.33, 46.41, 26.2]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 36.18, 0.36, 0.21]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", 1.93, 0.02, 0.01]},
                ],
            },
        }
    )
