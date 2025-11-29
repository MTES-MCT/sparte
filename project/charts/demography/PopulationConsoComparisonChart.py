import logging
from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import HIGHLIGHT_COLOR
from project.charts.mixins.ComparisonChartMixin import ComparisonChartMixin
from public_data.domain.containers import PublicDataContainer

logger = logging.getLogger(__name__)


class PopulationConsoComparisonChart(ComparisonChartMixin, DiagnosticChart):
    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"population conso comparison {self.params['start_date']}-{self.params['end_date']}"

    @cached_property
    def data(self):
        """
        Get comparison data for current land and nearest territories.

        Uses ComparisonChartMixin to get comparison lands (either custom or nearest territories).

        Returns comparison data for:
        1. The current territory (highlighted in the chart)
        2. Custom territories if comparison_lands param is provided
        3. Otherwise, up to 8 nearest territories from for_app_nearest_territories table

        Uses @cached_property to avoid re-executing queries on multiple accesses.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        comparison_lands = self._get_comparison_lands()

        # Get stats for all lands
        consommation_stats = PublicDataContainer.consommation_stats_service().get_by_lands(
            comparison_lands, start_date, end_date
        )
        population_stats = PublicDataContainer.population_stats_service().get_by_lands(
            comparison_lands, start_date, end_date
        )
        population_progression = PublicDataContainer.population_progression_service().get_by_lands(
            comparison_lands, start_date, end_date
        )

        return {
            "lands": comparison_lands,
            "consommation_stats": consommation_stats,
            "population_stats": population_stats,
            "population_progression": population_progression,
        }

    @property
    def bubble_series(self):
        """Calculate and return bubble series."""
        lands = self.data["lands"]
        highlighted_land_id = self.land.land_id

        consommation_total = {c.land.land_id: round(c.total, 2) for c in self.data["consommation_stats"]}
        population_evolution_total = {p.land.land_id: p.evolution for p in self.data["population_stats"]}
        last_year_populations = {
            p.land.land_id: p.last_year_population.population for p in self.data["population_progression"]
        }

        return [
            {
                "name": land.name,
                "data": [
                    {
                        "x": population_evolution_total[land.land_id],
                        "y": consommation_total[land.land_id],
                        "z": last_year_populations[land.land_id],
                    }
                ],
                "color": HIGHLIGHT_COLOR if land.land_id == highlighted_land_id else None,
                "marker": {
                    "lineWidth": 3 if land.land_id == highlighted_land_id else 1,
                },
                # La couleur du territoire diagnostiqué est précisée, les autres sont aléatoires (valeur None)
            }
            for land in lands
        ]

    @property
    def series(self):
        """Return bubble series."""
        return self.bubble_series

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bubble"},
            "legend": {
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value:.0f} hab"},
                    "color": "transparent",
                    "connectorDistance": 40,
                },
            },
            "credits": {"enabled": False},
            "title": {
                "text": (
                    f"Consommation d'espaces au regard de l'évolution de la population de {self.land.name} "
                    f"et des territoires de comparaison ({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "xAxis": {
                "gridLineWidth": 1,
                "title": {"text": "Évolution démographique (hab)"},
                "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
            },
            "yAxis": {
                "title": {"text": "Consommation d'espaces (ha)"},
                "maxPadding": 0.2,
                "min": 0,
            },
            "tooltip": {
                "pointFormat": (
                    "Consommation : <span class='fr-text--bold'>{point.y} ha</span><br />"
                    "Évolution démographique : <span class='fr-text--bold'>{point.x} hab</span><br />"
                    "Population totale (%s) : <span class='fr-text--bold'>{point.z} hab</span>"
                    % self.params["end_date"]
                ),
            },
            "series": self.series,
        }

    @property
    def data_table(self):
        """Generate data table showing consumption and population by territory."""
        headers = [
            "Territoire",
            "Consommation totale (ha)",
            "Évolution démographique (hab)",
            f"Population {self.params['end_date']} (hab)",
        ]
        rows = []

        lands = self.data["lands"]

        consommation_total = {c.land.land_id: c.total for c in self.data["consommation_stats"]}
        population_evolution_total = {p.land.land_id: p.evolution for p in self.data["population_stats"]}
        last_year_populations = {
            p.land.land_id: p.last_year_population.population for p in self.data["population_progression"]
        }

        for land in lands:
            rows.append(
                {
                    "name": land.name,
                    "data": [
                        land.name,
                        consommation_total[land.land_id],
                        population_evolution_total[land.land_id],
                        last_year_populations[land.land_id],
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
        }
