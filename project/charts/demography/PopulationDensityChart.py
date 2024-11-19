from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class PopulationDensityChart(ProjectChart):
    name = "population density"

    color_scale = [
        "rgb(242, 181, 168)",
        "rgb(242, 159, 142)",
        "rgb(242, 133, 111)",
        "rgb(242, 77, 45)",
        "rgb(185, 52, 27)",
    ]

    @classmethod
    def get_plot_bands(self, max_density):
        step = max_density / len(self.color_scale)
        return [{"from": step * i, "to": step * (i + 1), "color": color} for i, color in enumerate(self.color_scale)]

    @classmethod
    def get_tick_positions(self, max_density):
        return [max_density * i / len(self.color_scale) for i in range(len(self.color_scale) + 1)]

    def get_annual_population(self):
        return PublicDataContainer.population_annual_service().get_annual_population(
            land=self.project.land_proxy,
            year=int(self.project.analyse_end_date),
        )

    @property
    def param(self):
        annual_population = self.get_annual_population()

        return super().param | {
            "chart": {"type": "lineargauge", "inverted": True, "height": 130, "marginTop": 80},
            "title": {"text": f"Densité de population en {self.project.analyse_end_date}"},
            "xAxis": {"lineColor": "transparent", "labels": {"enabled": False}, "tickLength": 0},
            "yAxis": {
                "tickPositions": self.get_tick_positions(annual_population.max_density),
                "min": 0,
                "max": annual_population.max_density,
                "gridLineWidth": 0,
                "title": None,
                "labels": {"format": "{value}"},
                "plotBands": self.get_plot_bands(annual_population.max_density),
            },
            "legend": {"enabled": False},
            "tooltip": {"enabled": False},
            "series": [],
        }

    def add_series(self):
        annual_population = self.get_annual_population()

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
