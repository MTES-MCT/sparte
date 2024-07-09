from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoComparisonMapper import (
    ConsoComparisonMapper,
)


class AnnualConsoComparisonChart(ProjectChart):
    name = "conso comparison"

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espace du territoire et des territoires similaires (en ha)"},
            "subtitle": {
                "text": (
                    "Proposition de territoires de même maille administrative, "
                    "il est possible de modifier cette selection dans la légende"
                ),
            },
            "yAxis": {"title": {"text": "Consommé (en ha)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "series": [],
        }

    def add_series(self):
        self.chart["series"] = ConsoComparisonMapper.map(
            land_id_to_highlight=self.project.land.official_id,
            consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                lands=self.project.comparison_lands_and_self_land(),
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            ),
        )


class AnnualConsoComparisonChartExport(AnnualConsoComparisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "subtitle": "",
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Comparaison de la consommation annuelle d'espace entre {self.project.territory_name} "
                    "et les territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
