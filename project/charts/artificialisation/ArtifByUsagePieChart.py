from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
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
                        "y": item.surface,
                        "color": item.color,
                        "code": item.usage,
                        "long_name": item.label,
                        "surface": item.surface,
                    }
                    for item in self.data
                ],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "title": {"text": f"Surfaces artificialisées par usage {self.title_end}"},
            "series": self.series,
            "chart": {"type": "pie"},
            "tooltip": {
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.code} - {point.long_name} - {point.percentage:.1f}% ({point.surface:,.1f} ha)",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "plotOptions": {
                "pie": {
                    "innerSize": "60%",
                    "dataLabels": {
                        "enabled": True,
                        "overflow": "justify",
                        "format": "{point.name} - {point.percentage:.2f}%",
                        "style": {
                            "textOverflow": "clip",
                            "width": "100px",
                        },
                    },
                }
            },
        }


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
