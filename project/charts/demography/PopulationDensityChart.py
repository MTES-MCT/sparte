import math

from project.charts.base_project_chart import ProjectChart
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
            "title": {"text": f"Densité de population ({self.project.analyse_end_date})"},
            "xAxis": {"lineColor": "transparent", "labels": {"enabled": False}, "tickLength": 0},
            "yAxis": {
                "tickPositions": [0, 50, 100, 150, 200, 250, 300],
                "min": 0,
                "max": 300,
                "gridLineWidth": 0,
                "title": None,
                "labels": {"format": "{value}"},
                "plotBands": [
                    {"from": 0, "to": 50, "color": "rgb(242, 181, 168)"},
                    {"from": 50, "to": 100, "color": "rgb(242, 159, 142)"},
                    {"from": 100, "to": 150, "color": "rgb(242, 133, 111)"},
                    {"from": 150, "to": 200, "color": "rgb(242, 77, 45)"},
                    {"from": 200, "to": 250, "color": "rgb(185, 52, 27)"},
                    {"from": 250, "to": 300, "color": "rgb(165, 24, 0)"},
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

        # On récupére la dernière année de données sur la période
        last_year_data = progression_population.population[-1]
        density_ha = math.ceil(last_year_data.population / self.project.land_proxy.area)
        density_km2 = density_ha * 100

        self.chart["subtitle"] = {"text": f"{density_ha} hab/ha (soit {density_km2} hab/km²)"}

        self.chart["series"] = [
            {
                "data": [density_ha],
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
