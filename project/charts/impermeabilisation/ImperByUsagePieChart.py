from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from public_data.models import (
    LandImperStockUsageComposition,
    LandImperStockUsageCompositionIndex,
)

from .ImperByCouverturePieChart import ImperByCouverturePieChart


class ImperByUsagePieChart(ImperByCouverturePieChart):
    name = "Impermeabilisation usage and usage pie chart"
    by_departement_klass = LandImperStockUsageComposition
    by_index_klass = LandImperStockUsageCompositionIndex

    @property
    def series(self):
        return [
            {
                "name": "Surface imperméable",
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
    def data_table(self):
        headers = [
            "Code",
            "Usage",
            "Surface (ha)",
            "Pourcentage de la surface imperméable (%)",
            "Pourcentage du territoire (%)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        item.usage,
                        item.label,
                        round(item.surface, 2),
                        round(item.percent_of_imper, 2),
                        round(item.percent_of_land, 2),
                    ],
                }
                for item in self.data
            ],
        }

    @property
    def param(self):
        return super().param | {
            "title": {"text": f"Surfaces imperméables par usage {self.title_end}"},
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


class ImperUsagePieChartExport(ImperByUsagePieChart):
    @property
    def title_end(self):
        return f"sur le territoire de {self.land.name} {super().title_end}"

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
        }
