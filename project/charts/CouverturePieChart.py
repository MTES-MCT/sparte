from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS
from public_data.models import CouvertureSol, UsageSol


class CouverturePieChart(ProjectChart):
    """
    Graphique représentant tous les types de couverture du sol
    sur le territoire, qu'ils soient artificialisés ou non.
    """

    _level = 2
    _sol = "couverture"
    name = "Sol usage and couverture pie chart"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {
                "text": f"Répartition de la couverture des sols en {self.project.last_year_ocsge}",
            },
            "tooltip": {
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.y} - {point.percent}",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "plotOptions": {
                "pie": {
                    "innerSize": "60%",
                }
            },
            "series": [],
        }

    def get_series_item_name(self, item: CouvertureSol | UsageSol) -> str:
        return f"{item.code_prefix} {item.label}"

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
                        "name": self.get_series_item_name(item),
                        "y": item.surface,
                        "color": item.map_color,
                        "percent": f"{int(100 * item.surface / surface_total)}%",
                    }
                )
            self.chart["series"].append(series_to_append)


class CouverturePieChartExport(CouverturePieChart):
    def get_series_item_name(self, item: CouvertureSol | UsageSol) -> str:
        surface_str = f"{item.surface:.2f}".replace(".", ",")
        return f"{item.code_prefix} {item.label} - {surface_str} ha"

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
