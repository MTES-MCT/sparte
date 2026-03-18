# flake8: noqa: E501
from inline_snapshot import snapshot


def test_logement_vacant_taux_progression_chart(client, hauts_de_seine):
    response = client.get(
        "/api/chart/logement_vacant_taux_progression_chart/DEPART/92",
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
                    "itemWidth": 200,
                    "itemStyle": {"textOverflow": None},
                    "layout": "vertical",
                    "align": "right",
                    "verticalAlign": "middle",
                },
                "chart": {"type": "column"},
                "title": {"text": "Évolution du taux de vacance des logements sur le territoire"},
                "credits": {"enabled": False},
                "xAxis": {"categories": ["2015", "2016", "2017", "2018", "2019", "2020"]},
                "yAxis": {"title": {"text": "Taux de vacance (%)"}, "labels": {"format": "{value} %"}},
                "tooltip": {
                    "shared": True,
                    "useHTML": True,
                    "formatter": """\
function() {
                    var s = '<b>' + this.x + '</b><br/>';
                    var xIndex = this.point ? this.point.index : this.points[0].point.index;
                    var chart = this.point ? this.series.chart : this.points[0].series.chart;
                    chart.series.forEach(function(series) {
                        var value = series.options.data[xIndex];
                        if (value === null || value === undefined) {
                            s += '<span style="color:' + series.color + '">●
                            </span> ' + series.name + ': <b>Indisponible</b><br/>';
                        } else {
                            s += '<span style="color:' + series.color + '">●
                            </span> ' + series.name + ': <b>' + value + ' %</b><br/>';
                        }
                    });
                    return s;
                }\
""",
                },
                "plotOptions": {"column": {"grouping": True, "borderWidth": 0}},
                "series": [
                    {
                        "name": "Taux de vacance de plus de 2 ans dans le parc privé",
                        "type": "column",
                        "data": [1.15],
                        "color": "#E2D6BD",
                    },
                    {
                        "name": "Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux",
                        "type": "column",
                        "data": [0.82],
                        "color": "#C09F6D",
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
                    "filename": "Évolution du taux de vacance des logements sur le territoire",
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
                "headers": ["Année", "2015", "2016", "2017", "2018", "2019", "2020"],
                "rows": [
                    {"name": "", "data": ["Taux de vacance de plus de 2 ans dans le parc privé (%)", 1.15]},
                    {
                        "name": "",
                        "data": ["Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux (%)", 0.82],
                    },
                ],
                "boldFirstColumn": True,
            },
        }
    )
