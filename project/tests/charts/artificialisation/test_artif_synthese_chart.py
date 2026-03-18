# flake8: noqa: E501
from inline_snapshot import snapshot


def test_artif_synthese_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/artif_synthese/DEPART/92",
        {"departement": 92},
    )
    assert response.status_code == 200
    assert response.json() == snapshot(
        {
            "highcharts_options": {
                "chart": {"type": "column", "backgroundColor": "transparent"},
                "title": {
                    "text": "Evolution du stock de surfaces artificialisées de Hauts-de-Seine entre 2018 et 2021",
                    "style": {"fontSize": "14px", "fontWeight": "600"},
                },
                "xAxis": {
                    "categories": ["2018", "2021"],
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
                            {"y": 78.3714592559744, "surface": 13760.06605834},
                            {"y": 78.5474202155205, "surface": 13790.9603973},
                        ],
                        "color": "#818CF8",
                        "borderRadius": 3,
                        "zIndex": 1,
                    },
                    {
                        "name": "Flux",
                        "type": "line",
                        "data": [{"x": 0, "y": 78.3714592559744}, {"x": 1, "y": 78.5474202155205}],
                        "color": "#F97316",
                        "lineWidth": 2,
                        "marker": {"enabled": False},
                        "dataLabels": {"enabled": False},
                        "enableMouseTracking": False,
                        "showInLegend": True,
                        "zIndex": 2,
                    },
                    {
                        "name": "Flux label 1",
                        "type": "scatter",
                        "data": [{"x": 0.5, "y": 78.45943973574745, "name": "+30.9 ha"}],
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
                    "filename": "Evolution du stock de surfaces artificialisées de Hauts-de-Seine entre 2018 et 2021",
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
