# flake8: noqa: E501
from inline_snapshot import snapshot

from project.tests.charts.helpers import normalize


def test_dc_equipements_bpe_chart(client, metropole_de_lyon):
    response = client.get("/api/chart/dc_equipements_bpe/EPCI/200046977")
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
                "chart": {"type": "bar"},
                "title": {"text": "Équipements et services - Métropole de Lyon"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {
                    "categories": [
                        "Bornes recharge élec.",
                        "Boulangeries",
                        "Chirurgiens-dentistes",
                        "Coiffure",
                        "Collèges",
                        "Hypermarchés",
                        "Infirmiers",
                        "Lycées gén. et techno.",
                        "Lycées professionnels",
                        "Médecins généralistes",
                        "Masseurs-kinésithérapeutes",
                        "Psychologues",
                        "Stations-service",
                        "Supérettes",
                        "Supermarchés",
                        "Écoles élémentaires",
                        "Écoles maternelles",
                        "Écoles primaires",
                        "Épiceries",
                    ]
                },
                "yAxis": {"title": {"text": "Nombre"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"bar": {"dataLabels": {"enabled": True, "format": "{point.y:,.0f}"}}},
                "series": [
                    {
                        "name": "Équipements",
                        "data": [
                            1033.0,
                            113.0,
                            133.0,
                            137.0,
                            1490.0,
                            1569.0,
                            1768.0,
                            1900.0,
                            195.0,
                            197.0,
                            208.0,
                            2403.0,
                            262.0,
                            27.0,
                            358.0,
                            45.0,
                            673.0,
                            73.0,
                            974.0,
                        ],
                        "color": "#6A6AF4",
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
                    "filename": "Équipements et services - Métropole de Lyon",
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
                "headers": ["Catégorie", "Nombre", "Équipement"],
                "rows": [
                    {"name": "", "data": ["1,033", "Chirurgiens-dentistes", "Santé"]},
                    {"name": "", "data": ["1,490", "Médecins généralistes", "Santé"]},
                    {"name": "", "data": ["1,569", "Psychologues", "Santé"]},
                    {"name": "", "data": ["1,768", "Coiffure", "Commerces"]},
                    {"name": "", "data": ["1,900", "Infirmiers", "Santé"]},
                    {"name": "", "data": ["113", "Services", "Stations-service"]},
                    {"name": "", "data": ["133", "Commerces", "Supérettes"]},
                    {"name": "", "data": ["137", "Collèges", "Enseignement"]},
                    {"name": "", "data": ["195", "Commerces", "Supermarchés"]},
                    {"name": "", "data": ["197", "Enseignement", "Écoles élémentaires"]},
                    {"name": "", "data": ["2,403", "Masseurs-kinésithérapeutes", "Santé"]},
                    {"name": "", "data": ["208", "Enseignement", "Écoles maternelles"]},
                    {"name": "", "data": ["262", "Enseignement", "Écoles primaires"]},
                    {"name": "", "data": ["27", "Commerces", "Hypermarchés"]},
                    {"name": "", "data": ["358", "Bornes recharge élec.", "Services"]},
                    {"name": "", "data": ["45", "Enseignement", "Lycées professionnels"]},
                    {"name": "", "data": ["673", "Commerces", "Épiceries"]},
                    {"name": "", "data": ["73", "Enseignement", "Lycées gén. et techno."]},
                    {"name": "", "data": ["974", "Boulangeries", "Commerces"]},
                ],
            },
        }
    )
