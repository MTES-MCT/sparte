import math

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DENSITY_MAX
from public_data.domain.containers import PublicDataContainer


class PopulationDensityChart(ProjectChart):
    name = "population density"

    @property
    def param(self):
        return super().param | {
            "chart": {
                "type": "lineargauge",
                "inverted": True,
                "height": 130,
                "marginTop": 80,
                "marginLeft": 50,
                "marginRight": 50,
            },
            "title": {"text": "Densité de population"},
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
        progression_population = PublicDataContainer.population_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=int(self.project.analyse_start_date),
            end_date=int(self.project.analyse_end_date),
        )

        # On récupére la dernier année de pop sur la période disponible
        last_year_data_available = progression_population.population[-1]
        density = math.ceil(last_year_data_available.population / self.project.land_proxy.area)

        self.chart["series"] = [
            {
                "data": [density],
                "color": "#000000",
                "dataLabels": {
                    "enabled": True,
                    "align": "center",
                    "color": "#000000",
                    "format": "{point.y} hab/ha",
                    "crop": False,
                    "overflow": "allow",
                    "y": -20,
                },
            }
        ]
