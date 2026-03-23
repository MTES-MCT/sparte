# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_csp_repartition_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_csp_repartition/EPCI/200046977")
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
                "chart": {"type": "pie"},
                "title": {"text": "Répartition par CSP - Métropole de Lyon (2022)"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "tooltip": {"pointFormat": "{series.name}: <b>{point.y:,.0f}</b> ({point.percentage:.1f}%)"},
                "plotOptions": {
                    "pie": {
                        "allowPointSelect": True,
                        "cursor": "pointer",
                        "dataLabels": {"enabled": True, "format": "<b>{point.name}</b>: {point.percentage:.1f} %"},
                    }
                },
                "series": [
                    {
                        "name": "Population",
                        "colorByPoint": True,
                        "data": [
                            {"name": "Agriculteurs", "y": 371.76343817796},
                            {"name": "Artisans, commerçants", "y": 37161.2053492197},
                            {"name": "Autres inactifs", "y": 230699.190925404},
                            {"name": "Cadres", "y": 203428.539364356},
                            {"name": "Employés", "y": 170631.972202037},
                            {"name": "Ouvriers", "y": 101288.848906104},
                            {"name": "Prof. intermédiaires", "y": 187301.415217184},
                            {"name": "Retraités", "y": 246489.54450758},
                        ],
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
                    "filename": "Répartition par CSP - Métropole de Lyon (2022)",
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
                "headers": ["CSP", "Part", "Population"],
                "rows": [
                    {"name": "", "data": ["0.0%", "372", "Agriculteurs"]},
                    {"name": "", "data": ["101,289", "8.6%", "Ouvriers"]},
                    {"name": "", "data": ["14.5%", "170,632", "Employés"]},
                    {"name": "", "data": ["15.9%", "187,301", "Prof. intermédiaires"]},
                    {"name": "", "data": ["17.3%", "203,429", "Cadres"]},
                    {"name": "", "data": ["19.6%", "230,699", "Autres inactifs"]},
                    {"name": "", "data": ["20.9%", "246,490", "Retraités"]},
                    {"name": "", "data": ["3.2%", "37,161", "Artisans, commerçants"]},
                ],
            },
        }
    )
