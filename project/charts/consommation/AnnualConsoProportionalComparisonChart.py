from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoProportionalComparisonMapper import (
    ConsoProportionalComparisonMapper,
)


class AnnualConsoProportionalComparisonChart(ProjectChart):
    name = "conso comparison"

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espace proportionnelle à la surface des territoires (‰ - pour mille)"},
            "yAxis": {"title": {"text": "Proportion (‰ - pour mille)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " ‰ (pour mille)",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = ConsoProportionalComparisonMapper.map(
            land_id_to_highlight=self.project.land.official_id,
            consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                lands=self.project.comparison_lands_and_self_land(),
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            ),
        )


class AnnualConsoProportionalComparisonChartExport(AnnualConsoProportionalComparisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Comparaison de la consommation proportionnelle d'espace de {self.project.territory_name} "
                    "et les territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (‰ - pour mille)"
                )
            },
        }
