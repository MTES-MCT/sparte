from project.charts.base_project_chart import ProjectChart
from project.charts.constants import CEREMA_CREDITS


class ConsoByDeterminantPieChart(ProjectChart):
    name = "determinant overview"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {
                "text": "Sur la période",
            },
            "tooltip": {"enabled": True, "pointFormat": "{point.y:.1f} Ha"},
            "plotOptions": {
                "pie": {
                    "allowPointSelect": True,
                    "cursor": "pointer",
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.name} : {point.y:.1f} Ha",
                    },
                }
            },
            "series": [],
        }

    def __init__(self, *args, **kwargs):
        if "series" in kwargs:
            self.series = kwargs.pop("series")
        super().__init__(*args, **kwargs)

    def get_series(self):
        if not self.series:
            self.series = self.project.get_determinants(group_name=self.group_name)
        return {"Destinations": {n: sum(v.values()) for n, v in self.series.items()}}

    def add_series(self):
        super().add_series(sliced=True)


class ConsoByDeterminantPieChartExport(ConsoByDeterminantPieChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Destinations de la consommation d'espace de {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
