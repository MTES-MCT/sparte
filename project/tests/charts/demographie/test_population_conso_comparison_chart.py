# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_population_conso_comparison_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/population_conso_comparison_chart/EPCI/200046977",
        {"start_date": 2015, "end_date": 2020},
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
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                    "bubbleLegend": {
                        "enabled": True,
                        "borderWidth": 1,
                        "legendIndex": 100,
                        "labels": {"format": "{value:.0f} hab"},
                        "color": "transparent",
                        "connectorDistance": 40,
                    },
                },
                "chart": {"type": "bubble"},
                "credits": {"enabled": False},
                "title": {
                    "text": "Consommation d'espaces au regard de l'évolution de la population de Métropole de Lyon et des territoires de comparaison (2015 - 2020)"
                },
                "xAxis": {
                    "gridLineWidth": 1,
                    "title": {"text": "Évolution démographique (%)"},
                    "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
                },
                "yAxis": {
                    "title": {"text": "Consommation d'espaces relative à la surface (%)"},
                    "maxPadding": 0.2,
                    "min": 0,
                },
                "tooltip": {
                    "pointFormat": "Consommation relative à la surface : <span class='fr-text--bold'>{point.y:.4f} %</span><br />Évolution démographique : <span class='fr-text--bold'>{point.x} %</span><br />Population totale (2020) : <span class='fr-text--bold'>{point.z} hab</span>"
                },
                "series": [
                    {
                        "name": "Métropole de Lyon",
                        "data": [{"x": 3.9, "y": 0.8057, "z": 1416545}],
                        "color": "#FA4B42",
                        "marker": {"lineWidth": 3},
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
                    "filename": "Consommation d'espaces au regard de l'évolution de la population de Métropole de Lyon et des territoires de comparaison (2015 - 2020)",
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
                    "Consommation relative à la surface (%)",
                    "Population 2020 (hab)",
                    "Territoire",
                    "Évolution démographique (%)",
                ],
                "rows": [{"name": "Métropole de Lyon", "data": ["+3.90 %", "0.8057 %", "Métropole de Lyon", 1416545]}],
            },
        }
    )
