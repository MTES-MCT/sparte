# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_equipements_bpe_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_equipements_bpe/DEPART/92")
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
                "chart": {"type": "bar"},
                "title": {"text": "Équipements et services - Hauts-de-Seine"},
                "credits": {
                    "enabled": True,
                    "text": "Graphique : MonDiagnosticArtificialisation | Données : INSEE",
                    "style": {"cursor": "initial", "color": "#161616", "font-size": "10px"},
                    "position": {"y": -3, "align": "right", "verticalAlign": "bottom"},
                    "href": "https://mondiagartif.beta.gouv.fr/",
                },
                "xAxis": {
                    "categories": [
                        "Médecins généralistes",
                        "Chirurgiens-dentistes",
                        "Infirmiers",
                        "Masseurs-kinésithérapeutes",
                        "Psychologues",
                        "Écoles maternelles",
                        "Écoles primaires",
                        "Écoles élémentaires",
                        "Collèges",
                        "Lycées gén. et techno.",
                        "Lycées professionnels",
                        "Boulangeries",
                        "Supérettes",
                        "Supermarchés",
                        "Hypermarchés",
                        "Épiceries",
                        "Coiffure",
                        "Stations-service",
                        "Bornes recharge élec.",
                    ]
                },
                "yAxis": {"title": {"text": "Nombre"}},
                "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "pointFormat": "{series.name}: {point.y:,.0f}"},
                "plotOptions": {"bar": {"dataLabels": {"enabled": True, "format": "{point.y:,.0f}"}}},
                "series": [
                    {
                        "name": "Équipements",
                        "data": [
                            1151.0,
                            1163.0,
                            841.0,
                            1860.0,
                            1289.0,
                            286.0,
                            164.0,
                            241.0,
                            152.0,
                            76.0,
                            16.0,
                            931.0,
                            151.0,
                            310.0,
                            25.0,
                            645.0,
                            1428.0,
                            80.0,
                            340.0,
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
                    "filename": "Équipements et services - Hauts-de-Seine",
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
                "headers": ["Équipement", "Catégorie", "Nombre"],
                "rows": [
                    {"name": "", "data": ["Médecins généralistes", "Santé", "1,151"]},
                    {"name": "", "data": ["Chirurgiens-dentistes", "Santé", "1,163"]},
                    {"name": "", "data": ["Infirmiers", "Santé", "841"]},
                    {"name": "", "data": ["Masseurs-kinésithérapeutes", "Santé", "1,860"]},
                    {"name": "", "data": ["Psychologues", "Santé", "1,289"]},
                    {"name": "", "data": ["Écoles maternelles", "Enseignement", "286"]},
                    {"name": "", "data": ["Écoles primaires", "Enseignement", "164"]},
                    {"name": "", "data": ["Écoles élémentaires", "Enseignement", "241"]},
                    {"name": "", "data": ["Collèges", "Enseignement", "152"]},
                    {"name": "", "data": ["Lycées gén. et techno.", "Enseignement", "76"]},
                    {"name": "", "data": ["Lycées professionnels", "Enseignement", "16"]},
                    {"name": "", "data": ["Boulangeries", "Commerces", "931"]},
                    {"name": "", "data": ["Supérettes", "Commerces", "151"]},
                    {"name": "", "data": ["Supermarchés", "Commerces", "310"]},
                    {"name": "", "data": ["Hypermarchés", "Commerces", "25"]},
                    {"name": "", "data": ["Épiceries", "Commerces", "645"]},
                    {"name": "", "data": ["Coiffure", "Commerces", "1,428"]},
                    {"name": "", "data": ["Stations-service", "Services", "80"]},
                    {"name": "", "data": ["Bornes recharge élec.", "Services", "340"]},
                ],
            },
        }
    )
