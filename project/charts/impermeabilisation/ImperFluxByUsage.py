from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from public_data.models import AdminRef
from public_data.models.impermeabilisation import LandImperFluxUsageCompositionIndex


class ImperFluxByUsage(DiagnosticChart):
    name = "Evolution de l'artificialisation"
    sol = "usage"
    model = LandImperFluxUsageCompositionIndex

    @property
    def data(self):
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
                "color": "#ff0000",
            },
            {
                "name": "Désimperméabilisation",
                "data": [item * -1 for item in self.data.values_list("flux_desimper", flat=True)],
                "color": "#00ff00",
            },
            {
                "name": "Imperméabilisation nette",
                "data": list(self.data.values_list("flux_imper_net", flat=True)),
                "color": "#0000ff",
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

    @property
    def title(self):
        if self.land.is_interdepartemental:
            return (
                f"Flux d'imperméabilisation par {self.sol} "
                f"entre le millésime n°{int(self.params.get('millesime_new_index')) - 1} "
                f"et n°{self.params.get('millesime_new_index')}"
            )
        return (
            f"Flux d'imperméabilisation par {self.sol} entre {self.data[0].years_old[0]} "
            f"et {self.data[0].years_new[0]}"
        )

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar", "height": "800px", "marginLeft": 300},
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
    def data_table(self):
        headers = [
            AdminRef.get_label(self.land.land_type),
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [],
                }
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
