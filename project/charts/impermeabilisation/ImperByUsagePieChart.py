from .ImperByCouverturePieChart import (
    ImperByCouverturePieChart,
    ImperByCouverturePieChartExport,
)


class ImperByUsagePieChart(ImperByCouverturePieChart):
    _sol = "usage"

    @property
    def param(self):
        return super().param | {
            "title": {"text": f"Surfaces imperméables par type d'{self._sol} en {self.project.last_year_ocsge}"}
        }


class ImperByUsagePieChartExport(ImperByCouverturePieChartExport):
    _sol = "usage"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Surfaces imperméables par type d'{self._sol} à {self.project.territory_name} "
                    f"en {self.project.last_year_ocsge}"
                )
            }
        }
