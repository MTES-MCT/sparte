from project.charts.base_project_chart import ProjectChart
from project.charts.constants import CEREMA_CREDITS, LEGEND_NAVIGATION_EXPORT
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoProportionalComparisonMapper import (
    ConsoProportionalComparisonMapper,
)


class AnnualConsoProportionalComparisonChart(ProjectChart):
    """
    Graphique tree map de consommation d'espaces proportionnelle à la surface des territoires.
    """

    name = "conso comparison"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        return ConsoProportionalComparisonMapper.map(
            consommation_stats=PublicDataContainer.consommation_stats_service().get_by_lands(
                lands=self.project.comparison_lands_and_self_land(),
                start_date=int(self.project.analyse_start_date),
                end_date=int(self.project.analyse_end_date),
            ),
        )

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espaces NAF relative à la surface des territoires (en %)"},
            "subtitle": {"text": "La taille des zones est proportionnelle à la surface des territoires."},
            "tooltip": {
                "pointFormat": (
                    "Surface du territoire : <b>{point.value:.2f} ha</b><br />"
                    "Consommation d'espaces NAF relative à la surface du territoire : "
                    "<b>{point.colorValue:.2f} %</b>"
                ),
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "colorAxis": {
                "minColor": "#FFFFFF",
                "maxColor": "#6a6af4",
            },
            "legend": {
                "layout": "horizontal",
                "align": "center",
                "verticalAlign": "bottom",
            },
            "chart": {
                "height": "500",
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass


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
                    f"Consommation d'espaces NAF relative à la surface de {self.project.territory_name} "
                    "et des territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en %)"
                )
            },
        }
