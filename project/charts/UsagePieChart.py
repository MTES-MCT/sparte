from .constants import OCSGE_CREDITS
from .CouverturePieChart import CouverturePieChart


class UsagePieChart(CouverturePieChart):
    _level = 1
    _sol = "usage"


class UsagePieChartExport(UsagePieChart):
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
                    f"Répartition de l'usage du sol de {self.project.territory_name}"
                    f" en {self.project.last_year_ocsge} (en ha)"
                )
            },
        }
