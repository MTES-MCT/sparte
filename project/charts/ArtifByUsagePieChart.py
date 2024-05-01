from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from public_data.models import UsageSol

from .ArtifByCouverturePieChart import ArtifByCouverturePieChart


class ArtifByUsagePieChart(ArtifByCouverturePieChart):
    _sol = "usage"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": f"Surfaces artificialisées par type d'usage en {self.project.last_year_ocsge}",
            }
        }

    def get_series(self):
        if not self.series:
            data = {}
            for row in list(super().get_series()):
                code = row["code_prefix"].split(".")[0]
                if code not in data:
                    data[code] = 0
                data[code] += row["surface"]
            usage_list = {u.code_prefix: u for u in UsageSol.objects.all() if u.code_prefix in data}
            self.series = [
                {
                    "code_prefix": code,
                    "label": usage_list[code].label,
                    "label_short": usage_list[code].label_short,
                    "map_color": usage_list[code].map_color,
                    "surface": value,
                }
                for code, value in data.items()
            ]
        return self.series


class ArtifByUsagePieChartExport(ArtifByUsagePieChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "plotOptions": {
                **super().param["plotOptions"],
                "pie": {
                    **super().param["plotOptions"]["pie"],
                    "dataLabels": {
                        **super().param["plotOptions"]["pie"]["dataLabels"],
                        "format": "<b>{key}</b><br/>{point.y:,.1f} ha",
                    },
                },
            },
            "title": {
                "text": (
                    f"Surfaces artificialisées par type d'usage à {self.project.territory_name} "
                    f"en {self.project.last_year_ocsge} "
                )
            },
        }
