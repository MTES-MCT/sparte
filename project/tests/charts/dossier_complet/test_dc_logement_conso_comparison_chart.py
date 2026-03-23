# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_logement_conso_comparison_chart(client, metropole_de_lyon):
    response = client.get(
        "/api/chart/dc_logement_conso_comparison_chart/EPCI/200046977",
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
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "title": {
                    "text": "Consommation habitat relative à la surface (%) au regard de évolution du parc de logements de Métropole de Lyon et des territoires de comparaison (2015 - 2020)"
                },
                "xAxis": {
                    "gridLineWidth": 1,
                    "title": {"text": "Évolution du parc de logements (%)"},
                    "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
                },
                "yAxis": {
                    "title": {"text": "Consommation habitat relative à la surface (%)"},
                    "maxPadding": 0.2,
                    "min": 0,
                },
                "tooltip": {
                    "pointFormat": "Consommation habitat relative à la surface (%) : <span class='fr-text--bold'>{point.y:.4f} %</span><br />Évolution du parc de logements : <span class='fr-text--bold'>{point.x} %</span><br />Population : <span class='fr-text--bold'>{point.z} hab</span>"
                },
                "series": [
                    {
                        "name": "Métropole de Lyon",
                        "data": [{"x": 8.3, "y": 0.2774, "z": 1433613.0}],
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
                    "filename": "Consommation habitat relative à la surface (%) au regard de évolution du parc de logements de Métropole de Lyon et des territoires de comparaison (2015 - 2020)",
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
                    "Consommation habitat relative à la surface (%)",
                    "Population (hab)",
                    "Territoire",
                    "Évolution du parc de logements",
                ],
                "rows": [
                    {"name": "Métropole de Lyon", "data": ["+8.30%", "0.2774 %", "1,433,613", "Métropole de Lyon"]}
                ],
            },
        }
    )
