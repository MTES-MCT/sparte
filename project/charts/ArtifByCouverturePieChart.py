from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)


class ArtifByCouverturePieChart(ProjectChart):
    _sol = "couverture"
    name = "Artificialisation usage and couverture pie chart"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {"text": f"Surfaces artificialisées par type de couverture en {self.project.last_year_ocsge}"},
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

    def __init__(self, project, get_data=None):
        if get_data:
            self.get_data = get_data
        super().__init__(project)

    def get_data(self):
        """Should return data formated like this:
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        return self.project.get_base_sol_artif(sol=self._sol)

    def get_series(self):
        if not self.series:
            self.series = self.get_data()
        return self.series

    def add_series(self):
        surface_total = sum(_["surface"] for _ in self.get_series())
        self.chart["series"].append(
            {
                "name": "Sol artificiel",
                "data": [
                    {
                        "name": f"{item['code_prefix']} {item['label_short']}",
                        "y": item["surface"],
                        "color": item["map_color"],
                        "percent": f"{int(100 * item['surface'] / surface_total)}%",
                    }
                    for item in self.get_series()
                ],
            }
        )


class ArtifByCouverturePieChartExport(ArtifByCouverturePieChart):
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
                    f"Surfaces artificialisées par type de couverture en {self.project.last_year_ocsge}"
                    f"pour {self.project.territory_name}"
                )
            },
        }
