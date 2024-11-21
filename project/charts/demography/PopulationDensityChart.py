from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DENSITY_MAX
from public_data.domain.containers import PublicDataContainer


class PopulationDensityChart(ProjectChart):
    name = "population density"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "lineargauge", "inverted": True, "height": 130, "marginTop": 80},
            "title": {"text": f"Densité de population en {self.project.analyse_end_date}"},
            "xAxis": {"lineColor": "transparent", "labels": {"enabled": False}, "tickLength": 0},
            "yAxis": {
                "tickPositions": [0, 50, 100, 150, 200, DENSITY_MAX],
                "min": 0,
                "max": DENSITY_MAX,
                "gridLineWidth": 0,
                "title": None,
                "labels": {"format": "{value}"},
                "plotBands": [
                    {"from": 0, "to": 50, "color": "rgb(242, 181, 168)"},
                    {"from": 50, "to": 100, "color": "rgb(242, 159, 142)"},
                    {"from": 100, "to": 150, "color": "rgb(242, 133, 111)"},
                    {"from": 150, "to": 200, "color": "rgb(242, 77, 45)"},
                    {"from": 200, "to": DENSITY_MAX, "color": "rgb(185, 52, 27)"},
                ],
            },
            "legend": {"enabled": False},
            "tooltip": {"enabled": False},
            "series": [],
        }

    def add_series(self):
        annual_population = PublicDataContainer.population_annual_service().get_annual_population(
            land=self.project.land_proxy,
            year=int(self.project.analyse_end_date),
        )

        self.chart["series"] = [
            {
                "data": [annual_population.density],
                "color": "#000000",
                "dataLabels": {
                    "enabled": True,
                    "useHTML": True,
                    "align": "center",
                    "verticalAlign": "top",
                    "color": "#000000",
                    "format": "{point.y} hab/ha",
                    "style": {"transform": "translateY(-12px)", "textOutline": "none"},
                },
            }
        ]
