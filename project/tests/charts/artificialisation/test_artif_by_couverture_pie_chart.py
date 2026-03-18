# flake8: noqa: E501
from inline_snapshot import snapshot


def test_artif_by_couverture_pie_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/pie_artif_by_couverture/DEPART/92",
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
                "title": {"text": "Surfaces artificialisées par couverture  en 2018"},
                "series": [
                    {
                        "name": "Surface artificielle",
                        "data": [
                            {
                                "name": "Zones bâties",
                                "y": 5907.11390932,
                                "color": "#ff377a",
                                "code": "CS1.1.1.1",
                                "long_name": "Zones bâties",
                                "surface": 5907.11390932,
                            },
                            {
                                "name": "Zones non bâties",
                                "y": 4003.29074388,
                                "color": "#ff9191",
                                "code": "CS1.1.1.2",
                                "long_name": "Zones non bâties (Routes; places; parking…)",
                                "surface": 4003.29074388,
                            },
                            {
                                "name": "Zones à matériaux minéraux",
                                "y": 767.1015467,
                                "color": "#ff9",
                                "code": "CS1.1.2.1",
                                "long_name": "Zones à matériaux minéraux",
                                "surface": 767.1015467,
                            },
                            {
                                "name": "Surfaces d'eau",
                                "y": 1.46481961,
                                "color": "#00ccf2",
                                "code": "CS1.2.2",
                                "long_name": "Surfaces d'eau (Eau continentale et maritime)",
                                "surface": 1.46481961,
                            },
                            {
                                "name": "Peuplement de feuillus",
                                "y": 471.62628587,
                                "color": "#80ff00",
                                "code": "CS2.1.1.1",
                                "long_name": "Peuplement de feuillus",
                                "surface": 471.62628587,
                            },
                            {
                                "name": "Peuplement de conifères",
                                "y": 0.30666101,
                                "color": "#00a600",
                                "code": "CS2.1.1.2",
                                "long_name": "Peuplement de conifères",
                                "surface": 0.30666101,
                            },
                            {
                                "name": "Peuplement mixte",
                                "y": 5.28885157,
                                "color": "#80be00",
                                "code": "CS2.1.1.3",
                                "long_name": "Peuplement mixte",
                                "surface": 5.28885157,
                            },
                            {
                                "name": "Formations herbacées",
                                "y": 2603.87324038,
                                "color": "#ccf24d",
                                "code": "CS2.2.1",
                                "long_name": "Formations herbacées (Pelouses et prairies; terres arables; roselières; …)",
                                "surface": 2603.87324038,
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
                    "filename": "Surfaces artificialisées par couverture  en 2018",
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
                    "Surface (ha)",
                    "Pourcentage de la surface artificielle (%)",
                    "Pourcentage du territoire (%)",
                ],
                "rows": [
                    {"name": "", "data": ["CS1.1.1.1", "Zones bâties", 5907.11, 42.93, 33.64]},
                    {
                        "name": "",
                        "data": ["CS1.1.1.2", "Zones non bâties (Routes; places; parking…)", 4003.29, 29.09, 22.8],
                    },
                    {"name": "", "data": ["CS1.1.2.1", "Zones à matériaux minéraux", 767.1, 5.57, 4.37]},
                    {
                        "name": "",
                        "data": ["CS1.2.2", "Surfaces d'eau (Eau continentale et maritime)", 1.46, 0.01, 0.01],
                    },
                    {"name": "", "data": ["CS2.1.1.1", "Peuplement de feuillus", 471.63, 3.43, 2.69]},
                    {"name": "", "data": ["CS2.1.1.2", "Peuplement de conifères", 0.31, 0.0, 0.0]},
                    {"name": "", "data": ["CS2.1.1.3", "Peuplement mixte", 5.29, 0.04, 0.03]},
                    {
                        "name": "",
                        "data": [
                            "CS2.2.1",
                            "Formations herbacées (Pelouses et prairies; terres arables; roselières; …)",
                            2603.87,
                            18.92,
                            14.83,
                        ],
                    },
                ],
                "boldFirstColumn": True,
            },
        }
    )
