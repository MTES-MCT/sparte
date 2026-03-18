# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_menages_conso_comparison_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/dc_menages_conso_comparison_chart/DEPART/92",
        {"start_date": 2015, "end_date": 2020},
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
                    "text": "Consommation habitat relative à la surface (%) au regard de évolution du nombre de ménages de Hauts-de-Seine et des territoires de comparaison (2015 - 2020)"
                },
                "xAxis": {
                    "gridLineWidth": 1,
                    "title": {"text": "Évolution du nombre de ménages (%)"},
                    "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
                },
                "yAxis": {
                    "title": {"text": "Consommation habitat relative à la surface (%)"},
                    "maxPadding": 0.2,
                    "min": 0,
                },
                "tooltip": {
                    "pointFormat": "Consommation habitat relative à la surface (%) : <span class='fr-text--bold'>{point.y:.4f} %</span><br />Évolution du nombre de ménages : <span class='fr-text--bold'>{point.x} %</span><br />Population : <span class='fr-text--bold'>{point.z} hab</span>"
                },
                "series": [
                    {
                        "name": "Hauts-de-Seine",
                        "data": [{"x": 1.96, "y": 0.0228, "z": 1647435.0}],
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
                    "filename": "Consommation habitat relative à la surface (%) au regard de évolution du nombre de ménages de Hauts-de-Seine et des territoires de comparaison (2015 - 2020)",
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
                    "Territoire",
                    "Consommation habitat relative à la surface (%)",
                    "Évolution du nombre de ménages",
                    "Population (hab)",
                ],
                "rows": [{"name": "Hauts-de-Seine", "data": ["Hauts-de-Seine", "0.0228 %", "+1.96%", "1,647,435"]}],
            },
        }
    )
