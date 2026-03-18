# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_revenus_pauvrete_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_revenus_pauvrete/DEPART/92")
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
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Revenus et pauvreté - Hauts-de-Seine"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["Médiane niveau de vie", "1er décile (D1)", "9e décile (D9)"]},
                "yAxis": {"title": {"text": "Euros (€)"}},
                "tooltip": {
                    "headerFormat": "<b>{point.key}</b><br/>",
                    "pointFormat": "{series.name}: {point.y:,.0f} €",
                },
                "series": [
                    {"name": "Montant", "data": [31355.0, 13828.8571428571, 62703.4285714286], "color": "#6A6AF4"}
                ],
                "subtitle": {
                    "text": "Taux de pauvreté : 11.5% | Part des ménages imposés : 70.8% | Rapport interdécile (D9/D1) : 4.5"
                },
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
                    "filename": "Revenus et pauvreté - Hauts-de-Seine",
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
                "headers": ["Indicateur", "Valeur"],
                "rows": [
                    {"name": "", "data": ["Médiane du niveau de vie (€)", "31,355"]},
                    {"name": "", "data": ["1er décile D1 (€)", "13,829"]},
                    {"name": "", "data": ["9e décile D9 (€)", "62,703"]},
                    {"name": "", "data": ["Rapport interdécile D9/D1", "4.5"]},
                    {"name": "", "data": ["Taux de pauvreté", "11.5%"]},
                    {"name": "", "data": ["Part des ménages imposés", "70.8%"]},
                    {"name": "", "data": ["Nb ménages fiscaux", "695,869"]},
                ],
            },
        }
    )
