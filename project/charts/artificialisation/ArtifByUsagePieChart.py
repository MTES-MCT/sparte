from project.charts.base_charts.pie_chart import base_config_pie_chart
from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from public_data.models import (
    LandArtifStockUsageComposition,
    LandArtifStockUsageCompositionIndex,
)

from .ArtifByCouverturePieChart import ArtifByCouverturePieChart


class ArtifByUsagePieChart(ArtifByCouverturePieChart):
    name = "Artificialisation usage and usage pie chart"
    by_departement_klass = LandArtifStockUsageComposition
    by_index_klass = LandArtifStockUsageCompositionIndex

    @property
    def series(self):
        return [
            {
                "name": "Sol artificiel",
                "data": [
                    {
                        "name": item.label_short,
                        "y": item.surface / 10000,
                        "color": item.color,
                        "code": item.usage,
                        "long_name": item.label,
                    }
                    for item in self.data
                ],
            }
        ]

    @property
    def param(self):
        return (
            super().param
            | base_config_pie_chart
            | {
                "title": {"text": f"Surfaces artificialisées par usage en {self.title_end}"},
                "series": self.series,
            }
        )


class ArtifUsagePieChartExport(ArtifByUsagePieChart):
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
            "title": {"text": super().param["title"]["text"] + f"pour {self.land.name}"},
        }
