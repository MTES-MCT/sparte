# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_by_usage_pie_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/pie_artif_by_usage/EPCI/200046977",
        {"index": 1},
    )
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
                "legend": {
                    "itemWidth": 200,
                    "itemStyle": {"textOverflow": None},
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "title": {"text": "Surfaces artificialisées par usage  en 2017"},
                "series": [
                    {
                        "name": "Surface artificielle",
                        "data": [
                            {
                                "name": "Agriculture",
                                "y": 115.32360222,
                                "color": "#FFFFA8",
                                "code": "US1.1",
                                "long_name": "Agriculture",
                                "surface": 115.32360222,
                            },
                            {
                                "name": "Activités d’extraction",
                                "y": 1.92440478,
                                "color": "#A600CC",
                                "code": "US1.3",
                                "long_name": "Activités d’extraction",
                                "surface": 1.92440478,
                            },
                            {
                                "name": "Secondaire",
                                "y": 2196.69815188,
                                "color": "#E6004D",
                                "code": "US2",
                                "long_name": "Secondaire",
                                "surface": 2196.69815188,
                            },
                            {
                                "name": "Production secondaire; tertiai...",
                                "y": 2.3768257,
                                "color": "#E6004D",
                                "code": "US235",
                                "long_name": "Production secondaire; tertiaire et usage résidentiel",
                                "surface": 2.3768257,
                            },
                            {
                                "name": "Tertiaire",
                                "y": 8191.80306991,
                                "color": "#FF8C00",
                                "code": "US3",
                                "long_name": "Tertiaire",
                                "surface": 8191.80306991,
                            },
                            {
                                "name": "Transport routier",
                                "y": 4899.05863916,
                                "color": "#CC0000",
                                "code": "US4.1.1",
                                "long_name": "Transport routier",
                                "surface": 4899.05863916,
                            },
                            {
                                "name": "Transport ferré",
                                "y": 763.33048052,
                                "color": "#5A5A5A",
                                "code": "US4.1.2",
                                "long_name": "Transport ferré",
                                "surface": 763.33048052,
                            },
                            {
                                "name": "Transport aérien",
                                "y": 151.1996428,
                                "color": "#E6CCE6",
                                "code": "US4.1.3",
                                "long_name": "Transport aérien",
                                "surface": 151.1996428,
                            },
                            {
                                "name": "Réseaux d’utilité publique",
                                "y": 108.14894464,
                                "color": "#FF4B00",
                                "code": "US4.3",
                                "long_name": "Réseaux d’utilité publique",
                                "surface": 108.14894464,
                            },
                            {
                                "name": "Résidentiel",
                                "y": 13738.80668665,
                                "color": "#BE0961",
                                "code": "US5",
                                "long_name": "Résidentiel",
                                "surface": 13738.80668665,
                            },
                            {
                                "name": "Zones en transition",
                                "y": 238.3538103,
                                "color": "#FF4DFF",
                                "code": "US6.1",
                                "long_name": "Zones en transition",
                                "surface": 238.3538103,
                            },
                            {
                                "name": "Zones abandonnées",
                                "y": 0.71755822,
                                "color": "#404040",
                                "code": "US6.2",
                                "long_name": "Zones abandonnées",
                                "surface": 0.71755822,
                            },
                            {
                                "name": "Sans usage",
                                "y": 16.48504617,
                                "color": "#F0F028",
                                "code": "US6.3",
                                "long_name": "Sans usage",
                                "surface": 16.48504617,
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
                    "filename": "Surfaces artificialisées par usage  en 2017",
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
                    "Pourcentage de la surface artificielle (%)",
                    "Pourcentage du territoire (%)",
                    "Surface (ha)",
                    "Usage",
                ],
                "rows": [
                    {"name": "", "data": ["Activités d’extraction", "US1.3", 0.0, 0.01, 1.92]},
                    {"name": "", "data": ["Agriculture", "US1.1", 0.21, 0.38, 115.32]},
                    {
                        "name": "",
                        "data": ["Production secondaire; tertiaire et usage résidentiel", "US235", 0.0, 0.01, 2.38],
                    },
                    {
                        "name": "",
                        "data": ["Réseaux d’utilité publique", "US4.3", 0.2, 0.36, 108.15],
                    },
                    {"name": "", "data": ["Résidentiel", "US5", 13738.81, 25.56, 45.16]},
                    {"name": "", "data": ["Sans usage", "US6.3", 0.03, 0.05, 16.49]},
                    {"name": "", "data": ["Secondaire", "US2", 2196.7, 4.09, 7.22]},
                    {"name": "", "data": ["Tertiaire", "US3", 15.24, 26.93, 8191.8]},
                    {"name": "", "data": ["Transport aérien", "US4.1.3", 0.28, 0.5, 151.2]},
                    {"name": "", "data": ["Transport ferré", "US4.1.2", 1.42, 2.51, 763.33]},
                    {"name": "", "data": ["Transport routier", "US4.1.1", 16.1, 4899.06, 9.12]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 0.44, 0.78, 238.35]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", 0.0, 0.0, 0.72]},
                ],
                "boldFirstColumn": True,
            },
        }
    )
