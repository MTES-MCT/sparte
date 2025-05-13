from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from public_data.models import (
    LandArtifStockCouvertureComposition,
    LandArtifStockCouvertureCompositionIndex,
)


class ArtifByCouverturePieChart(DiagnosticChart):
    name = "Artificialisation usage and couverture pie chart"
    by_departement_klass = LandArtifStockCouvertureComposition
    by_index_klass = LandArtifStockCouvertureCompositionIndex

    @cached_property
    def data(self):
        if self.params.get("departement"):
            composition = self.by_departement_klass.objects.filter(
                land_id=self.land.land_id,
                land_type=self.land.land_type,
                millesime_index=self.params.get("index"),
                departement=self.params.get("departement"),
            )
        else:
            composition = self.by_index_klass.objects.filter(
                land_id=self.land.land_id,
                land_type=self.land.land_type,
                millesime_index=self.params.get("index"),
            )
        return list(composition.all())

    @property
    def data_table(self):
        headers = [
            "Code",
            "Couverture",
            "Surface (ha)",
            "Pourcentage du sol artificiel (%)",
            "Pourcentage du territoire (%)",
        ]

        return [
            headers,
            [
                [
                    item.couverture,
                    item.label,
                    item.surface,
                    item.percent_of_artif,
                    item.percent_of_land,
                ]
                for item in self.data
            ],
        ]

    @cached_property
    def is_interdepartemental(self):
        return len(self.data[0].departements) > 1

    @cached_property
    def title_end(self):
        if self.params.get("departement"):
            return f" en {self.data[0].year} ({self.data[0].departement})"

        if self.is_interdepartemental:
            return f" au millésime n° {self.data[0].millesime_index}"
        else:
            return f" en {self.data[0].years[0]}"

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
                        "code": item.couverture,
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
            "title": {"text": f"Surfaces artificialisées par couverture {self.title_end}"},
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


class ArtifByCouverturePieChartExport(ArtifByCouverturePieChart):
    @cached_property
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
