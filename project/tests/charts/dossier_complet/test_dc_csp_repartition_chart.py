# flake8: noqa: E501
from inline_snapshot import snapshot


def test_dc_csp_repartition_chart(client, hauts_de_seine):
    response = client.get("/api/chart/dc_csp_repartition/DEPART/92")
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
                    "itemWidth": 200,
                    "itemStyle": {"textOverflow": None},
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "chart": {"type": "pie"},
                "title": {"text": "Répartition par CSP - Hauts-de-Seine (2022)"},
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
                            {"name": "Agriculteurs", "y": 136.501304348257},
                            {"name": "Artisans, commerçants", "y": 42727.1388062364},
                            {"name": "Cadres", "y": 390141.753243534},
                            {"name": "Prof. intermédiaires", "y": 199478.419112833},
                            {"name": "Employés", "y": 176759.191274675},
                            {"name": "Ouvriers", "y": 66514.4633218416},
                            {"name": "Retraités", "y": 251981.659211449},
                            {"name": "Autres inactifs", "y": 217303.065788486},
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
                    "filename": "Répartition par CSP - Hauts-de-Seine (2022)",
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
                "headers": ["CSP", "Population", "Part"],
                "rows": [
                    {"name": "", "data": ["Agriculteurs", "137", "0.0%"]},
                    {"name": "", "data": ["Artisans, commerçants", "42,727", "3.2%"]},
                    {"name": "", "data": ["Cadres", "390,142", "29.0%"]},
                    {"name": "", "data": ["Prof. intermédiaires", "199,478", "14.8%"]},
                    {"name": "", "data": ["Employés", "176,759", "13.1%"]},
                    {"name": "", "data": ["Ouvriers", "66,514", "4.9%"]},
                    {"name": "", "data": ["Retraités", "251,982", "18.7%"]},
                    {"name": "", "data": ["Autres inactifs", "217,303", "16.2%"]},
                ],
            },
        }
    )
