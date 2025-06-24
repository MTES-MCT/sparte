from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import BaseLandFriche


class BaseFricheChart(DiagnosticChart):
    @property
    def model(self) -> BaseLandFriche:
        raise NotImplementedError("Subclasses must define a model property")

    @property
    def friche_field(self) -> str:
        raise NotImplementedError("Subclasses must define a friche_field property")

    @property
    def title(self) -> str:
        raise NotImplementedError("Subclasses must define a title property")

    @property
    def series_name(self) -> str:
        raise NotImplementedError("Subclasses must define a series_name property")

    @property
    def data(self):
        return self.model.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).order_by("-friche_sans_projet_surface")

    @property
    def data_table(self):
        headers = [
            self.series_name,
            "Nombre de friches sans projet",
            "Surface totale des friches sans projet (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": getattr(item, self.friche_field),
                    "data": [
                        getattr(item, self.friche_field),
                        item.friche_sans_projet_count,
                        item.friche_sans_projet_surface,
                    ],
                }
                for item in self.data
            ],
        }

    @property
    def series(self):
        return [
            {
                "name": self.series_name,
                "data": [
                    {
                        "name": getattr(item, self.friche_field),
                        "surface": item.friche_sans_projet_surface,
                        "count": item.friche_sans_projet_count,
                        "y": item.friche_sans_projet_surface,
                    }
                    for item in self.data
                    if item.friche_sans_projet_surface > 0
                ],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "title": {"text": self.title},
            "series": self.series,
            "chart": {"type": "pie"},
            "tooltip": {
                "valueSuffix": " ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.percentage:.1f}% ({point.surface:,.1f} ha) - {point.count} friches sans projet",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "plotOptions": {
                "pie": {
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
