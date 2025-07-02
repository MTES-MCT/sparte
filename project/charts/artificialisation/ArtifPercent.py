from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import LandArtifStockIndex


class ArtifPercent(DiagnosticChart):
    @cached_property
    def data(self):
        return LandArtifStockIndex.objects.get(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            millesime_index=self.params.get("index"),
        )

    @property
    def data_table(self):
        headers = []

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [],
                }
                for item in []
            ],
        }

    @property
    def series(self):
        return [
            {
                "name": "Sol artificiel",
                "data": [
                    {
                        "name": "Sol artificiel",
                        "y": self.data.percent,
                        "color": "#EDB2A1",
                    },
                    {
                        "name": "Sol non artificiel",
                        "y": 100 - self.data.percent,
                        "color": "#B9D8BA",
                    },
                ],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "title": {"text": ""},
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
