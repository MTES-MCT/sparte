# flake8: noqa: E501
from inline_snapshot import snapshot


def test_artif_by_usage_pie_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/pie_artif_by_usage/DEPART/92",
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
                "title": {"text": "Surfaces artificialisées par usage  en 2018"},
                "series": [
                    {
                        "name": "Surface artificielle",
                        "data": [
                            {
                                "name": "Zones en transition",
                                "y": 215.94796653,
                                "color": "#FF4DFF",
                                "code": "US6.1",
                                "long_name": "Zones en transition",
                                "surface": 215.94796653,
                            },
                            {
                                "name": "Agriculture",
                                "y": 0.44861731,
                                "color": "#FFFFA8",
                                "code": "US1.1",
                                "long_name": "Agriculture",
                                "surface": 0.44861731,
                            },
                            {
                                "name": "Secondaire",
                                "y": 333.79568172,
                                "color": "#E6004D",
                                "code": "US2",
                                "long_name": "Secondaire",
                                "surface": 333.79568172,
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
                                "y": 4007.424014,
                                "color": "#FF8C00",
                                "code": "US3",
                                "long_name": "Tertiaire",
                                "surface": 4007.424014,
                            },
                            {
                                "name": "Transport routier",
                                "y": 2468.71251587,
                                "color": "#CC0000",
                                "code": "US4.1.1",
                                "long_name": "Transport routier",
                                "surface": 2468.71251587,
                            },
                            {
                                "name": "Transport ferré",
                                "y": 312.09480338,
                                "color": "#5A5A5A",
                                "code": "US4.1.2",
                                "long_name": "Transport ferré",
                                "surface": 312.09480338,
                            },
                            {
                                "name": "Services de logistique et de s...",
                                "y": 27.79698999,
                                "color": "#FF0000",
                                "code": "US4.2",
                                "long_name": "Services de logistique et de stockage",
                                "surface": 27.79698999,
                            },
                            {
                                "name": "Réseaux d’utilité publique",
                                "y": 28.178969,
                                "color": "#FF4B00",
                                "code": "US4.3",
                                "long_name": "Réseaux d’utilité publique",
                                "surface": 28.178969,
                            },
                            {
                                "name": "Résidentiel",
                                "y": 6356.56341648,
                                "color": "#BE0961",
                                "code": "US5",
                                "long_name": "Résidentiel",
                                "surface": 6356.56341648,
                            },
                            {
                                "name": "Zones abandonnées",
                                "y": 1.93162914,
                                "color": "#404040",
                                "code": "US6.2",
                                "long_name": "Zones abandonnées",
                                "surface": 1.93162914,
                            },
                            {
                                "name": "Sans usage",
                                "y": 7.02434153,
                                "color": "#F0F028",
                                "code": "US6.3",
                                "long_name": "Sans usage",
                                "surface": 7.02434153,
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
                    "filename": "Surfaces artificialisées par usage  en 2018",
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
                    "Pourcentage de la surface artificielle (%)",
                    "Pourcentage du territoire (%)",
                ],
                "rows": [
                    {"name": "", "data": ["US6.1", "Zones en transition", 215.95, 1.57, 1.23]},
                    {"name": "", "data": ["US1.1", "Agriculture", 0.45, 0.0, 0.0]},
                    {"name": "", "data": ["US2", "Secondaire", 333.8, 2.43, 1.9]},
                    {
                        "name": "",
                        "data": ["US235", "Production secondaire; tertiaire et usage résidentiel", 0.15, 0.0, 0.0],
                    },
                    {"name": "", "data": ["US3", "Tertiaire", 4007.42, 29.12, 22.82]},
                    {"name": "", "data": ["US4.1.1", "Transport routier", 2468.71, 17.94, 14.06]},
                    {"name": "", "data": ["US4.1.2", "Transport ferré", 312.09, 2.27, 1.78]},
                    {"name": "", "data": ["US4.2", "Services de logistique et de stockage", 27.8, 0.2, 0.16]},
                    {"name": "", "data": ["US4.3", "Réseaux d’utilité publique", 28.18, 0.2, 0.16]},
                    {"name": "", "data": ["US5", "Résidentiel", 6356.56, 46.2, 36.2]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", 1.93, 0.01, 0.01]},
                    {"name": "", "data": ["US6.3", "Sans usage", 7.02, 0.05, 0.04]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
