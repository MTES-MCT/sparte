from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import CEREMA_CREDITS, LEGEND_NAVIGATION_EXPORT
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoProportionalComparisonMapper import (
    ConsoProportionalComparisonMapper,
)


class AnnualConsoProportionalComparisonChart(DiagnosticChart):
    """
    Graphique tree map de consommation d'espaces proportionnelle à la surface des territoires.
    """

    name = "conso comparison"

    @property
    def data(self):
        """Get consumption stats for multiple lands (self and comparison)."""
        comparison_lands = self.params.get("comparison_lands", [])
        consommation_stats = PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=comparison_lands,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )
        return consommation_stats

    @property
    def series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        return ConsoProportionalComparisonMapper.map(
            consommation_stats=self.data,
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
            "series": self.series,
        }

    @property
    def data_table(self):
        return {
            "headers": [],
            "rows": [],
        }


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
                    f"Consommation d'espaces NAF relative à la surface de {self.land.name} "
                    "et des territoires similaires "
                    f"entre {self.params['start_date']} et {self.params['end_date']} (en %)"
                )
            },
        }
