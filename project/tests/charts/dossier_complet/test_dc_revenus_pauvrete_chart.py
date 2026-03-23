# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_revenus_pauvrete_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_revenus_pauvrete/EPCI/200046977")
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
                "legend": {"enabled": False},
                "chart": {"type": "column"},
                "title": {"text": "Revenus et pauvreté - Métropole de Lyon"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {"categories": ["1er décile (D1)", "9e décile (D9)", "Médiane niveau de vie"]},
                "yAxis": {"title": {"text": "Euros (€)"}},
                "tooltip": {
                    "headerFormat": "<b>{point.key}</b><br/>",
                    "pointFormat": "{series.name}: {point.y:,.0f} €",
                },
                "series": [
                    {
                        "name": "Montant",
                        "data": [14387.1698113208, 27952.5862068966, 49928.8679245283],
                        "color": "#6A6AF4",
                    }
                ],
                "subtitle": {
                    "text": "Taux de pauvreté : 13.4% | Part des ménages imposés : 63.4% | Rapport interdécile (D9/D1) : 3.5"
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
                    "filename": "Revenus et pauvreté - Métropole de Lyon",
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
                "headers": ["Indicateur", "Valeur"],
                "rows": [
                    {"name": "", "data": ["13.4%", "Taux de pauvreté"]},
                    {"name": "", "data": ["14,387", "1er décile D1 (€)"]},
                    {"name": "", "data": ["27,953", "Médiane du niveau de vie (€)"]},
                    {"name": "", "data": ["3.5", "Rapport interdécile D9/D1"]},
                    {"name": "", "data": ["49,929", "9e décile D9 (€)"]},
                    {"name": "", "data": ["597,348", "Nb ménages fiscaux"]},
                    {"name": "", "data": ["63.4%", "Part des ménages imposés"]},
                ],
            },
        }
    )
