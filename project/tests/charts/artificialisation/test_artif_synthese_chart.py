# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_artif_synthese_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/artif_synthese/EPCI/200046977",
        {"departement": 69},
    )
    assert response.status_code == 200
    assert normalize(response.json()) == snapshot(
        {
            "highcharts_options": {
                "chart": {"type": "column", "backgroundColor": "transparent"},
                "title": {
                    "text": "Evolution du stock de surfaces artificialisées de Métropole de Lyon entre 2017 et 2020",
                    "style": {"fontSize": "14px", "fontWeight": "600"},
                },
                "xAxis": {
                    "categories": ["2017", "2020"],
                    "title": {"text": None},
                    "labels": {"style": {"fontSize": "12px"}},
                    "lineColor": "#E5E7EB",
                },
                "yAxis": {
                    "title": {"text": "Part artificialisée (%)", "style": {"fontSize": "12px", "color": "#6B7280"}},
                    "labels": {"format": "{value}%", "style": {"fontSize": "11px", "color": "#6B7280"}},
                    "gridLineColor": "#F3F4F6",
                    "gridLineDashStyle": "Dash",
                },
                "tooltip": {
                    "backgroundColor": "rgba(255, 255, 255, 0.95)",
                    "borderColor": "#E5E7EB",
                    "borderRadius": 8,
                    "shadow": True,
                    "useHTML": True,
                    "headerFormat": '<div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #1F2937;">{point.key}</div>',
                    "pointFormat": """\

                    <div style="padding: 4px 0;">
                        <span style="color: #6B7280;">Part du territoire :</span>
                        <b style="color: #1F2937;">{point.y:.2f}%</b>
                    </div>
                    <div style="padding: 4px 0;">
                        <span style="color: #6B7280;">Surface :</span>
                        <b style="color: #1F2937;">{point.surface:,.1f} ha</b>
                    </div>
                \
""",
                },
                "plotOptions": {
                    "column": {
                        "borderRadius": 3,
                        "dataLabels": {
                            "enabled": True,
                            "format": "{point.y:.2f}%<br/>({point.surface:,.0f} ha)",
                            "style": {
                                "fontSize": "10px",
                                "fontWeight": "600",
                                "textOutline": "none",
                                "color": "#6B7280",
                                "textAlign": "center",
                            },
                        },
                    }
                },
                "legend": {"enabled": False},
                "credits": {"enabled": False},
                "series": [
                    {
                        "name": "Part artificialisée",
                        "type": "column",
                        "data": [
                            {"y": 56.6079072688744, "surface": 30424.22686295},
                            {"y": 56.8856776364604, "surface": 30573.51605393},
                        ],
                        "color": "#818CF8",
                        "borderRadius": 3,
                        "zIndex": 1,
                    },
                    {
                        "name": "Flux label 1",
                        "type": "scatter",
                        "data": [{"x": 0.5, "y": 56.7467924526674, "name": "+149.3 ha"}],
                        "color": "#F97316",
                        "marker": {"radius": 0},
                        "dataLabels": {
                            "enabled": True,
                            "format": "{point.name}",
                            "style": {
                                "fontSize": "11px",
                                "fontWeight": "bold",
                                "color": "#F97316",
                                "textOutline": "2px white",
                            },
                        },
                        "enableMouseTracking": False,
                        "showInLegend": False,
                        "zIndex": 3,
                    },
                    {
                        "name": "Flux",
                        "type": "line",
                        "data": [{"x": 0, "y": 56.6079072688744}, {"x": 1, "y": 56.8856776364604}],
                        "color": "#F97316",
                        "lineWidth": 2,
                        "marker": {"enabled": False},
                        "dataLabels": {"enabled": False},
                        "enableMouseTracking": False,
                        "showInLegend": True,
                        "zIndex": 2,
                    },
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
                    "filename": "Evolution du stock de surfaces artificialisées de Métropole de Lyon entre 2017 et 2020",
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
