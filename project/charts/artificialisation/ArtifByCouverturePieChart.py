from django.utils.functional import cached_property

from project.charts.base_charts.pie_chart import base_config_pie_chart
from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
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
                land_id=self.land.id,
                land_type=self.land.land_type,
                millesime_index=self.params.get("index"),
                departement=self.params.get("departement"),
            )
        else:
            composition = self.by_index_klass.objects.filter(
                land_id=self.land.id, land_type=self.land.land_type, millesime_index=self.params.get("index")
            )
        return list(composition.all())

    @cached_property
    def title_end(self):
        if self.params.get("departement"):
            return f" {self.data[0].year} ({self.data[0].departement})"
        else:
            return f" {', '.join(map(str, self.data[0].years))}"

    @property
    def series(self):
        return [
            {
                "name": "Sol artificiel",
                "data": [
                    {
                        "name": item.couverture,
                        "y": item.surface / 10000,
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
                "title": {"text": f"Surfaces artificialisées par couverture en {self.title_end}"},
                "series": self.series,
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
            "title": {"text": super().param["title"]["text"] + f"pour {self.land.name}"},
        }
