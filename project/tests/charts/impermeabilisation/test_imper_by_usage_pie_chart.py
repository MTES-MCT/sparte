# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_imper_by_usage_pie_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/pie_imper_by_usage/EPCI/200046977",
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
                "title": {"text": "Surfaces imperméables par usage  en 2017"},
                "series": [
                    {
                        "name": "Surface imperméable",
                        "data": [
                            {
                                "name": "Agriculture",
                                "y": 76.47574272,
                                "color": "#FFFFA8",
                                "code": "US1.1",
                                "long_name": "Agriculture",
                                "surface": 76.47574272,
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
                                "y": 1619.52855688,
                                "color": "#E6004D",
                                "code": "US2",
                                "long_name": "Secondaire",
                                "surface": 1619.52855688,
                            },
                            {
                                "name": "Production secondaire; tertiai...",
                                "y": 0.02280635,
                                "color": "#E6004D",
                                "code": "US235",
                                "long_name": "Production secondaire; tertiaire et usage résidentiel",
                                "surface": 0.02280635,
                            },
                            {
                                "name": "Tertiaire",
                                "y": 4778.99437603,
                                "color": "#FF8C00",
                                "code": "US3",
                                "long_name": "Tertiaire",
                                "surface": 4778.99437603,
                            },
                            {
                                "name": "Transport routier",
                                "y": 4594.51748153,
                                "color": "#CC0000",
                                "code": "US4.1.1",
                                "long_name": "Transport routier",
                                "surface": 4594.51748153,
                            },
                            {
                                "name": "Transport ferré",
                                "y": 84.71687316,
                                "color": "#5A5A5A",
                                "code": "US4.1.2",
                                "long_name": "Transport ferré",
                                "surface": 84.71687316,
                            },
                            {
                                "name": "Transport aérien",
                                "y": 47.91848957,
                                "color": "#E6CCE6",
                                "code": "US4.1.3",
                                "long_name": "Transport aérien",
                                "surface": 47.91848957,
                            },
                            {
                                "name": "Réseaux d’utilité publique",
                                "y": 38.14328598,
                                "color": "#FF4B00",
                                "code": "US4.3",
                                "long_name": "Réseaux d’utilité publique",
                                "surface": 38.14328598,
                            },
                            {
                                "name": "Résidentiel",
                                "y": 6065.90985201,
                                "color": "#BE0961",
                                "code": "US5",
                                "long_name": "Résidentiel",
                                "surface": 6065.90985201,
                            },
                            {
                                "name": "Zones en transition",
                                "y": 21.41256679,
                                "color": "#FF4DFF",
                                "code": "US6.1",
                                "long_name": "Zones en transition",
                                "surface": 21.41256679,
                            },
                            {
                                "name": "Zones abandonnées",
                                "y": 0.71755822,
                                "color": "#404040",
                                "code": "US6.2",
                                "long_name": "Zones abandonnées",
                                "surface": 0.71755822,
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
                    "filename": "Surfaces imperméables par usage  en 2017",
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
                    "Pourcentage de la surface imperméable (%)",
                    "Pourcentage du territoire (%)",
                    "Surface (ha)",
                    "Usage",
                ],
                "rows": [
                    {"name": "", "data": ["Activités d’extraction", "US1.3", 0.0, 0.01, 1.92]},
                    {"name": "", "data": ["Agriculture", "US1.1", 0.14, 0.44, 76.48]},
                    {
                        "name": "",
                        "data": ["Production secondaire; tertiaire et usage résidentiel", "US235", 0.0, 0.0, 0.02],
                    },
                    {
                        "name": "",
                        "data": ["Réseaux d’utilité publique", "US4.3", 0.07, 0.22, 38.14],
                    },
                    {"name": "", "data": ["Résidentiel", "US5", 11.29, 35.0, 6065.91]},
                    {"name": "", "data": ["Secondaire", "US2", 1619.53, 3.01, 9.35]},
                    {"name": "", "data": ["Tertiaire", "US3", 27.58, 4778.99, 8.89]},
                    {"name": "", "data": ["Transport aérien", "US4.1.3", 0.09, 0.28, 47.92]},
                    {"name": "", "data": ["Transport ferré", "US4.1.2", 0.16, 0.49, 84.72]},
                    {"name": "", "data": ["Transport routier", "US4.1.1", 26.51, 4594.52, 8.55]},
                    {"name": "", "data": ["US6.1", "Zones en transition", 0.04, 0.12, 21.41]},
                    {"name": "", "data": ["US6.2", "Zones abandonnées", 0.0, 0.0, 0.72]},
                ],
            },
        }
    )
