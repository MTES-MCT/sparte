from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from public_data.models import AdminRef
from public_data.models.impermeabilisation import (
    LandImperFluxUsageComposition,
    LandImperFluxUsageCompositionIndex,
)


class ImperFluxByUsage(DiagnosticChart):
    name = "Evolution de l'artificialisation"
    sol = "usage"
    model = LandImperFluxUsageCompositionIndex

    @property
    def data(self):
        if self.params.get("departement"):
            model_class = getattr(self, "model_by_departement", LandImperFluxUsageComposition)
            return model_class.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
                departement=self.params.get("departement"),
            )
        else:
            return self.model.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
            )

    @property
    def series(self):
        return [
            {
                "name": "Imperméabilisation",
                "data": list(self.data.values_list("flux_imper", flat=True)),
                "color": ARTIFICIALISATION_COLOR,
            },
            {
                "name": "Désimperméabilisation",
                "data": [item * -1 for item in self.data.values_list("flux_desimper", flat=True)],
                "color": DESARTIFICIALISATION_COLOR,
            },
            {
                "name": "Imperméabilisation nette",
                "data": list(self.data.values_list("flux_imper_net", flat=True)),
                "color": ARTIFICIALISATION_NETTE_COLOR,
            },
        ]

    @property
    def categories(self):
        categories = []
        for item in self.data:
            categories.append(
                f"{item.label_short} ({getattr(item, self.sol)}) <span style='color:{item.color}'></span>"
            )
        return categories

    @cached_property
    def title_end(self):
        if self.params.get("departement"):
            return f" ({self.params.get('departement')})"

        if self.land.is_interdepartemental:
            return f" entre le millésime n°{int(self.params.get('millesime_new_index')) - 1} et n°{self.params.get('millesime_new_index')}"  # noqa: E501
        else:
            return f" entre {self.data[0].years_old[0]} et {self.data[0].years_new[0]}"

    @property
    def title(self):
        return f"Flux d'imperméabilisation par {self.sol}{self.title_end}"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar", "height": "800px"},
            "title": {"text": self.title},
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {
                "minPadding": 0.2,
                "maxPadding": 0.2,
                "startOnTick": True,
                "endOnTick": True,
                "categories": self.categories,
                "crop": False,
                "overflow": "allow",
            },
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
                "plotLines": [
                    {
                        "value": 0,
                        "color": "black",
                        "width": 2,
                    }
                ],
            },
            "legend": {
                "align": "center",
                "verticalAlign": "top",
                "layout": "horizontal",
            },
            "plotOptions": {
                "bar": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.2f}", "allowOverlap": True},
                    "groupPadding": 0.2,
                    "borderWidth": 0,
                }
            },
            "series": self.series,
        }

    @property
    def year_or_index_after(self):
        if self.land.is_interdepartemental:
            return f"millésime {self.params.get('millesime_new_index')}"
        return f"{self.data[0].years_new[0]}"

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
            f"Type de {self.sol}",
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
                        f"{item.label_short} ({getattr(item, self.sol)})",
                        round(item.flux_imper, DEFAULT_VALUE_DECIMALS),
                        round(item.flux_desimper, DEFAULT_VALUE_DECIMALS),
                        round(item.flux_imper_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
                for item in self.data
            ],
        }


class ImperFluxByUsageExport(ImperFluxByUsage):
    @property
    def title_end(self):
        return f" sur le territoire de {self.land.name}"

    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {"text": f"{self.title}{self.title_end}"},
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
        }
