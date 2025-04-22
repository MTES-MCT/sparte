from typing import Any, Dict, List

from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import LandArtifStockIndex as ArtifStockIndexModel


class ArtifStock(DiagnosticChart):
    @cached_property
    def data(self) -> List[ArtifStockIndexModel]:
        return list(
            ArtifStockIndexModel.objects.filter(
                land_id=self.land.id,
                land_type=self.land.land_type,
            )
        )

    @cached_property
    def years(self) -> List[int]:
        return list([list(map(str, item.years)) for item in self.data])

    @property
    def series(self):
        return [
            {
                "name": "Stock",
                "data": [round(index_data.surface / 10000, DEFAULT_VALUE_DECIMALS) for index_data in self.data],
            }
        ]

    @property
    def param(self) -> Dict[str, Any]:
        return super().param | {
            "chart": {"type": "bar"},
            "title": {
                "text": "Stock d'artificialisation des sols (ha)",
                "align": "left",
            },
            "legend": {"enabled": False},
            "xAxis": {"categories": self.years, "title": {"text": None}, "gridLineWidth": 1, "lineWidth": 0},
            "yAxis": {
                "title": {
                    "text": "Surface artificialisée (ha)",
                },
            },
            "tooltip": {"valuePrefix": "", "valueSuffix": " ha"},
            "plotOptions": {"series": {"stacking": "normal", "dataLabels": {"enabled": True}}},
            "credits": {"enabled": False},
            "series": self.series,
        }
