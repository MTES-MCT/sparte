from project.charts.base_project_chart import ProjectChart


class PopConsoProgressionChart(ProjectChart):
    name = "pop density"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": "Évolutions comparées de la consommation d'espaces NAF et de la population du territoire"
            },
            "credits": {"enabled": False},
            "xAxis": [
                {
                    "categories": [
                        "2011",
                        "2012",
                        "2013",
                        "2014",
                        "2015",
                        "2016",
                        "2017",
                        "2018",
                        "2019",
                        "2020",
                        "2021",
                        "2022",
                    ]
                }
            ],
            "yAxis": [
                {
                    "title": {"text": "Population (hab)", "style": {"color": "#fa4b42"}},
                    "labels": {"style": {"color": "#fa4b42"}},
                    "opposite": True,
                },
                {
                    "labels": {"style": {"color": "#6a6af4"}},
                    "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                },
            ],
            "tooltip": {"shared": True},
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = [
            {
                "name": "Consommation totale",
                "type": "column",
                "stacking": "normal",
                "yAxis": 1,
                "data": [45.7, 37.0, 28.9, 17.1, 39.2, 18.9, 90.2, 78.5, 74.6, 18.7, 17.1, 16.0],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#CFD1E5",
            },
            {
                "name": "Consommation à destination de l'habitat",
                "type": "column",
                "stacking": "normal",
                "yAxis": 1,
                "data": [10.0, 18.0, 16.0, 5.0, 17.0, 14.0, 70.0, 15.0, 12.0, 3.0, 2.0, 10.0],
                "tooltip": {"valueSuffix": " ha"},
                "color": "#6a6af4",
            },
            {
                "name": "Population",
                "type": "spline",
                "data": [1100, 1034, 1028, 1012, 1134, 1020, 1010, 1012, 999, 939, 949, 930],
                "tooltip": {"valueSuffix": " hab"},
                "color": "#fa4b42",
            },
        ]
