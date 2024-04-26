from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS


class CouverturePieChart(ProjectChart):
    _level = 2
    _sol = "couverture"
    name = "Sol usage and couverture pie chart"

    @property
    def param(self):
        return {
            "chart": {"type": "pie"},
            "title": {
                "text": f"Répartition de la couverture des sols en {self.project.last_year_ocsge}",
                "floating": True,
            },
            "yAxis": {
                "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
            },
            "tooltip": {
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.y} - {point.percent}",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {"type": "category"},
            "plotOptions": {
                "pie": {
                    "innerSize": "60%",
                }
            },
            "series": [],
        }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_base_sol(
                millesime=self.project.last_year_ocsge,
                sol=self._sol,
            )
        return self.series

    def add_series(self):
        series = [_ for _ in self.get_series() if _.level == self._level]
        surface_total = sum(_.surface for _ in series)
        if surface_total:
            series_to_append = {
                "name": self.project.last_year_ocsge,
                "data": [],
            }
            for item in series:
                series_to_append["data"].append(
                    {
                        "name": f"{item.code_prefix} {item.label}",
                        "y": item.surface,
                        "color": item.map_color,
                        "percent": f"{int(100 * item.surface / surface_total)}%",
                    }
                )
            self.chart["series"].append(series_to_append)


class CouverturePieChartExport(CouverturePieChart):
    def add_series(self):
        series = [_ for _ in self.get_series() if _.level == self._level]
        surface_total = sum(_.surface for _ in series)
        if surface_total:
            series_to_append = {
                "name": self.project.last_year_ocsge,
                "data": [],
            }
            for item in series:
                surface_str = f"{item.surface:.2f}".replace(".", ",")
                series_to_append["data"].append(
                    {
                        "name": f"{item.code_prefix} {item.label} - {surface_str} ha",
                        "y": item.surface,
                        "color": item.map_color,
                        "percent": f"{int(100 * item.surface / surface_total)}%",
                    }
                )
            self.chart["series"].append(series_to_append)

    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Répartition de la couverture du sol de {self.project.territory_name}"
                    f" en {self.project.last_year_ocsge} (en ha)"
                )
            },
        }
