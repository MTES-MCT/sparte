from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    IMPERMEABLE_OCSGE_CREDITS,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.impermeabilisation.get_communes_imper_us_cs_repartition import (
    get_communes_imper_us_cs_repartition,
)


class ImperByCouverturePieChart(ProjectChart):
    _sol = "couverture"
    name = "Imperméabilisation usage and couverture pie chart"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {"text": f"Surfaces imperméables par type de {self._sol} en {self.project.last_year_ocsge}"},
            "tooltip": {
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.y} - {point.percent}",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "plotOptions": {
                "pie": {
                    "innerSize": "60%",
                    "dataLabels": {
                        "enabled": True,
                        "overflow": "justify",
                        "style": {
                            "textOverflow": "clip",
                            "width": "100px",
                        },
                    },
                }
            },
            "series": [],
        }

    def get_series(self):
        if not self.series:
            self.series = get_communes_imper_us_cs_repartition(
                communes=self.project.cities.all(),
                year=self.project.last_year_ocsge,
            )[self._sol]
        return self.series

    def add_series(self):
        surface_total = sum(_["surface"] for _ in self.get_series())
        self.chart["series"].append(
            {
                "name": "Sol imperméable",
                "data": [
                    {
                        "name": f"{item['code_prefix']} {item['label_short']}",
                        "y": item["surface"],
                        "percent": f"{int(100 * item['surface'] / surface_total)}%",
                    }
                    for item in self.get_series()
                ],
            }
        )


class ImperByCouverturePieChartExport(ImperByCouverturePieChart):
    @property
    def param(self):
        return super().param | {
            "credits": IMPERMEABLE_OCSGE_CREDITS,
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
                    f"Surfaces imperméables par type de {self._sol} à {self.project.territory_name} "
                    f"en {self.project.last_year_ocsge}"
                )
            },
        }
