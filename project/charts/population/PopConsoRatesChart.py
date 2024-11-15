from project.charts.base_project_chart import ProjectChart


class PopConsoRatesChart(ProjectChart):
    name = "pop conso rates"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar"},
            "title": {"text": "Evolutions comparées de la population et de la consommation d'espaces NAF"},
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
            "legend": {"enabled": False},
            "xAxis": {"type": "category"},
            "yAxis": {
                "min": 0,
                "title": {
                    "text": "",
                },
                "tickInterval": 0.5,
                "labels": {
                    "enabled": False,
                },
            },
            "tooltip": {
                "enabled": False,
            },
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = [
            {
                "id": "rates",
                "data": [
                    {
                        "name": "Taux de consommation d'espaces NAF (%)",
                        "tooltipLabel": "Taux de consommation d'espaces NAF",
                        "y": 2.0,
                        "color": "#6a6af4",
                    },
                    {
                        "name": "Taux d'évolution démographique (%)",
                        "tooltipLabel": "Taux d'évolution démographique",
                        "y": 1.6,
                        "color": "#fa4b42",
                    },
                ],
                "dataLabels": {
                    "enabled": True,
                    "inside": True,
                    "align": "right",
                    "x": -10,
                    "style": {
                        "color": "white",
                        "fontSize": "16px",
                        "textOutline": "none",
                    },
                },
            }
        ]
