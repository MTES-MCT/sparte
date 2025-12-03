from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import CEREMA_CREDITS, LEGEND_NAVIGATION_EXPORT
from project.charts.mixins.ComparisonChartMixin import ComparisonChartMixin
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoProportionalComparisonMapper import (
    ConsoProportionalComparisonMapper,
)


class AnnualConsoProportionalComparisonChart(ComparisonChartMixin, DiagnosticChart):
    """
    Graphique tree map de consommation d'espaces proportionnelle à la surface des territoires.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"conso proportional comparison {self.params['start_date']}-{self.params['end_date']}"

    @cached_property
    def data(self):
        """
        Get consumption stats for current land and nearest territories.

        Uses ComparisonChartMixin to get comparison lands (either custom or nearest territories).

        Returns consumption data for:
        1. The current territory (highlighted in the chart)
        2. Custom territories if comparison_lands param is provided
        3. Otherwise, up to 8 nearest territories from for_app_nearest_territories table

        Uses @cached_property to avoid re-executing queries on multiple accesses.
        """
        comparison_lands = self._get_comparison_lands()

        return PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=comparison_lands,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )

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
            "title": {
                "text": (
                    f"Consommation d'espaces NAF relative à la surface de {self.land.name} "
                    "et des territoires de comparaison "
                    f"({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "subtitle": {"text": "La taille des zones est proportionnelle à la surface des territoires."},
            "tooltip": {
                "pointFormat": (
                    "Surface du territoire : <b>{point.value:.2f} ha</b><br />"
                    "Consommation d'espaces relative à la surface du territoire : "
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
        """Generate data table showing proportional consumption by territory."""
        headers = ["Territoire", "Surface (ha)", "Consommation totale (ha)", "Proportion (%)"]
        rows = []

        for land_conso in self.data:
            surface = land_conso.land.surface
            proportion = land_conso.total_percent_of_area

            rows.append(
                {
                    "name": land_conso.land.name,
                    "data": [
                        land_conso.land.name,
                        surface,
                        land_conso.total,
                        proportion,
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
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
                    "et des territoires de comparaison "
                    f"entre {self.params['start_date']} et {self.params['end_date']} (en %)"
                )
            },
        }
