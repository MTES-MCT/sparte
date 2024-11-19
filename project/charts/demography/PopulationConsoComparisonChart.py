from project.charts.base_project_chart import ProjectChart


class PopulationConsoComparisonChart(ProjectChart):
    name = "population conso comparison"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bubble"},
            "legend": {
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
                "bubbleLegend": {"enabled": True, "borderWidth": 1, "labels": {"format": "{value} ha"}},
            },
            "credits": {"enabled": False},
            "title": {
                "text": (
                    "Consommation foncière au regard de l'évolution de la population "
                    "pour les territoires similaires"
                )
            },
            "xAxis": {
                "gridLineWidth": 1,
                "title": {"text": "Taux d'évolution démographique (%)"},
                "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
            },
            "yAxis": {"title": {"text": "Taux de consommation d'espaces NAF (%)"}, "maxPadding": 0.2, "min": 0},
            "tooltip": {
                "useHTML": True,
                "headerFormat": "<table>",
                "pointFormat": (
                    "<tr><th colspan='2'><h3>{series.name}</h3></th></tr>"
                    "<tr><th>Taux de consommation:</th><td>{point.y} %</td></tr>"
                    "<tr><th>Évolution démographique:</th><td>{point.x} %</td></tr>"
                    "<tr><th>Consommation d'espaces NAF:</th><td>{point.z} ha</td></tr>"
                ),
                "footerFormat": "</table>",
            },
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = [
            {"name": "Nice", "data": [{"x": 2, "y": 1, "z": 13.8}]},
            {"name": "Aspremont", "data": [{"x": 2.1, "y": 2.9, "z": 14.7}]},
            {"name": "Cantaron", "data": [{"x": 4.8, "y": 1.5, "z": 15.8}]},
            {"name": "Colomars", "data": [{"x": -1.4, "y": 2.5, "z": 12}]},
            {"name": "Falicon", "data": [{"x": 1.2, "y": 4.1, "z": 11.8}]},
            {"name": "Gattières", "data": [{"x": -3.4, "y": 3.1, "z": 16.6}]},
            {"name": "La Gaude", "data": [{"x": 2.2, "y": 5.5, "z": 14.5}]},
            {"name": "La Trinité", "data": [{"x": 4.5, "y": 2.1, "z": 10}]},
            {"name": "Saint-André-de-la-Roche", "data": [{"x": 1, "y": 1.2, "z": 24.7}]},
            {"name": "Èze", "data": [{"x": 6.2, "y": 4.6, "z": 10.4}]},
        ]
