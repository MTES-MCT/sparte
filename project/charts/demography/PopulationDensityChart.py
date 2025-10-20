import math

from project.charts.base_project_chart import DiagnosticChart
from public_data.domain.containers import PublicDataContainer


class PopulationDensityChart(DiagnosticChart):
    required_params = ["start_date", "end_date"]
    name = "population density"

    @property
    def data(self):
        """Get population progression data for the land."""
        progression_population = PublicDataContainer.population_progression_service().get_by_land(
            land=self.land,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )
        return progression_population.population

    @property
    def density_data(self):
        """Calculate density metrics."""
        # On récupére la dernière année de données sur la période
        last_year_data = self.data[-1]
        land_area = self.land.surface
        density_ha = math.ceil(last_year_data.population / land_area) if land_area else 0
        density_km2 = density_ha * 100
        return {"density_ha": density_ha, "density_km2": density_km2}

    @property
    def series(self):
        """Generate series data from density calculations."""
        density = self.density_data
        return [
            {
                "data": [density["density_ha"]],
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

    @property
    def param(self):
        density = self.density_data
        return super().param | {
            "chart": {
                "type": "lineargauge",
                "inverted": True,
                "height": 130,
                "marginTop": 80,
                "marginLeft": 50,
                "marginRight": 50,
            },
            "title": {"text": f"Densité de population ({self.params['end_date']})"},
            "subtitle": {"text": f"{density['density_ha']} hab/ha (soit {density['density_km2']} hab/km²)"},
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
            "series": self.series,
        }

    @property
    def data_table(self):
        return {
            "headers": [],
            "rows": [],
        }
