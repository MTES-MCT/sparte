from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import AdminRef
from public_data.models.impermeabilisation import LandImperFlux, LandImperFluxIndex


class ImperNetFluxChart(DiagnosticChart):
    name = "Evolution de l'artificialisation"

    @property
    def data(self) -> LandImperFluxIndex | LandImperFlux | None:
        if self.params.get("departement"):
            return LandImperFlux.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
                departement=self.params.get("departement"),
            ).first()
        else:
            return LandImperFluxIndex.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
            ).first()

    @property
    def series(self):
        return [
            {
                "data": [
                    {
                        "name": "Imperméabilisation",
                        "y": self.data.flux_imper,
                        "color": "#ff0000",
                    },
                    {
                        "name": "Désimperméabilisation",
                        "y": self.data.flux_desimper * -1,
                        "color": "#00ff00",
                    },
                    {
                        "name": "Imperméabilisation nette",
                        "y": self.data.flux_imper_net,
                        "color": "#0000ff",
                    },
                ],
            }
        ]

    @cached_property
    def title_end(self):
        if self.params.get("departement"):
            return f" ({self.params.get('departement')})"

        if self.land.is_interdepartemental:
            return f" entre le millésime {self.params.get('millesime_old_index')} et le millésime {self.params.get('millesime_new_index')}"  # noqa: E501
        else:
            return f" entre {self.data.years_old[0]} et {self.data.years_new[-1]}"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Evolution de l'imperméabilisation nette{self.title_end}"},
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
            },
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {"type": "category"},
            "legend": {"enabled": False},
            "plotOptions": {
                "column": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                    "pointPadding": 0.2,
                    "borderWidth": 0,
                }
            },
            "series": self.series,
        }

    @property
    def year_or_index_after(self):
        if self.land.is_interdepartemental:
            return f"millésime {self.params.get('millesime_new_index')}"
        return f"{self.data.years_new[-1]}"

    @property
    def data_table(self):
        if self.params.get("departement"):
            territory_header = "Département"
            territory_name = self.params.get("departement")
        else:
            territory_header = AdminRef.get_label(self.land.land_type)
            territory_name = self.land.name

        headers = [
            territory_header,
            f"Imperméabilisation (ha) - {self.year_or_index_after}",
            f"Désimperméabilisation (ha) - {self.year_or_index_after}",
            f"Imperméabilisation nette (ha) - {self.year_or_index_after}",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        territory_name,
                        round(self.data.flux_imper, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_desimper, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_imper_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
            ],
        }
