from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    IMPERMEABLE_OCSGE_CREDITS,
    LANG_MISSING_OCSGE_DIFF_IMPER,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifferenceService import (
    ImpermeabilisationDifferenceService,
)
from public_data.infra.impermeabilisation.difference.highchart.ImperNetteMapper import (
    ImperNetteMapper,
)


class ImperNetteProgression(ProjectChart):
    name = "Evolution de l'imperméabilisation"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Imperméabilisation sur la période"},
        "yAxis": {
            "title": {"text": "Surface (en ha)"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "lang": LANG_MISSING_OCSGE_DIFF_IMPER,
        "tooltip": {
            "pointFormat": "{series.name}: {point.y}",
            "valueSuffix": " Ha",
            "valueDecimals": DEFAULT_VALUE_DECIMALS,
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "column": {
                "dataLabels": {"enabled": True, "format": "{point.y:,.1f} ha"},
                "pointPadding": 0.2,
                "borderWidth": 0,
            }
        },
        "series": [],
    }

    def add_series(self):
        difference = ImpermeabilisationDifferenceService.get_by_geom(
            geom=self.project.combined_emprise,
            start_date=self.project.first_year_ocsge,
            end_date=self.project.last_year_ocsge,
        )
        series = ImperNetteMapper.map(difference)
        self.chart["series"] = series


class ImperNetteProgressionExport(ImperNetteProgression):
    @property
    def param(self):
        return super().param | {
            "chart": {
                **super().param["chart"],
                "spacingBottom": 50,
            },
            "credits": IMPERMEABLE_OCSGE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Imperméabilisation à {self.project.territory_name} de "
                    f"{self.project.first_year_ocsge} à {self.project.last_year_ocsge}"
                )
            },
        }
