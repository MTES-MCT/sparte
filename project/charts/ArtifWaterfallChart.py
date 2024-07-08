from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS


class ArtifWaterfallChart(ProjectChart):
    name = "Evolution de l'artificialisation"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "waterfall"},
            "title": {"text": "Progression de l'artificialisation nette"},
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
            },
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {"type": "category"},
            "legend": {"enabled": False},
            "plotOptions": {
                "column": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                    "pointPadding": 0.2,
                    "borderWidth": 0,
                }
            },
            "series": [],
        }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_artif_progession_time_scoped()
        return self.series

    def add_series(self):
        series = self.get_series()
        self.chart["series"] = [
            {
                "data": [
                    {
                        "name": "Artificialisation",
                        "y": series["new_artif"],
                        "color": "#ff0000",
                    },
                    {
                        "name": "Désartificialisation",
                        "y": series["new_natural"] * -1,
                        "color": "#00ff00",
                    },
                    {
                        "name": "Artificialisation nette",
                        "isSum": True,
                        "color": "#0000ff",
                    },
                ],
            },
        ]


class ArtifWaterfallChartExport(ArtifWaterfallChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Progression de l'artificialisation nette pour {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
