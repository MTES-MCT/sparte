from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import HIGHLIGHT_COLOR
from public_data.domain.containers import PublicDataContainer
from public_data.models import AdminRef
from public_data.models.administration import LandModel
from public_data.models.demography import SimilarTerritories


class PopulationConsoComparisonChart(DiagnosticChart):
    @property
    def name(self):
        return f"population conso comparison {self.params['start_date']}-{self.params['end_date']}"

    @cached_property
    def _similar_territories_data(self):
        """
        Cache for similar territories data to avoid N+1 queries.
        Fetches all SimilarTerritories objects in a single query.
        Returns a dict mapping similar_land_id -> SimilarTerritories object.
        """
        similar_territories = SimilarTerritories.objects.filter(
            land_id=self.land.land_id, land_type=self.land.land_type
        ).order_by("similarity_rank")[:8]

        return {st.similar_land_id: st for st in similar_territories}

    @cached_property
    def data(self):
        """
        Get comparison data for current land and similar territories.

        Returns comparison data for:
        1. The current territory (highlighted in the chart)
        2. Custom territories if comparison_lands param is provided
        3. Otherwise, up to 8 similar territories from for_app_similar_territories table

        Similar territories are automatically selected based on population similarity
        and geographic proximity.

        Uses @cached_property to avoid re-executing queries on multiple accesses.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        comparison_lands = [self.land]

        # Check if custom comparison lands are provided
        if "comparison_lands" in self.params and self.params["comparison_lands"]:
            # Parse comparison_lands param: "COMM_69123,EPCI_200046977"
            land_keys = self.params["comparison_lands"].split(",")
            for land_key in land_keys:
                try:
                    land_type, land_id = land_key.strip().split("_")
                    land = LandModel.objects.get(land_id=land_id, land_type=land_type)
                    comparison_lands.append(land)
                except (ValueError, LandModel.DoesNotExist):
                    # Skip invalid land keys
                    continue
        else:
            # Use similar territories from the table
            similar_land_ids = list(self._similar_territories_data.keys())

            # Récupérer tous les territoires similaires en une seule requête (optimisé)
            similar_lands = LandModel.objects.filter(land_id__in=similar_land_ids, land_type=self.land.land_type)

            # Créer la liste ordonnée : territoire actuel d'abord, puis territoires similaires
            # On utilise un dict pour maintenir l'ordre de similarity_rank
            similar_lands_dict = {land.land_id: land for land in similar_lands}

            for land_id in similar_land_ids:
                if land_id in similar_lands_dict:
                    comparison_lands.append(similar_lands_dict[land_id])

        # Get comparison stats for median calculation
        comparison = PublicDataContainer.consommation_comparison_service().get_by_land(
            land=self.land, start_date=start_date, end_date=end_date
        )

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
            "comparison": comparison,
            "lands": comparison_lands,
            "consommation_stats": consommation_stats,
            "population_stats": population_stats,
            "population_progression": population_progression,
        }

    @property
    def median_series(self):
        """Calculate and return median series."""
        comparison = self.data["comparison"]
        population_stats = self.data["population_stats"]

        max_pop_evo = max([p.evolution for p in population_stats])

        name = f"Ratio médian des {AdminRef.get_label(comparison.relevance_level).lower()} <br>à l'échelle de {comparison.land.name}"  # noqa: E501
        return [
            {
                "type": "line",
                "name": name,
                "data": [[0, 0], [max_pop_evo, comparison.median_ratio_pop_conso / 10000 * max_pop_evo]],
                "marker": {"enabled": False},
                "states": {"hover": {"lineWidth": 0}},
                "enableMouseTracking": False,
            }
        ]

    @property
    def bubble_series(self):
        """Calculate and return bubble series."""
        lands = self.data["lands"]
        # Support both Land (.id) and LandModel (.land_id)
        highlighted_land_id = getattr(self.land, "land_id", self.land.id)

        consommation_total = {c.land.id: round(c.total, 2) for c in self.data["consommation_stats"]}
        population_evolution_total = {p.land.id: p.evolution for p in self.data["population_stats"]}
        last_year_populations = {
            p.land.id: p.last_year_population.population for p in self.data["population_progression"]
        }

        return [
            {
                "name": land.name,
                "data": [
                    {
                        "x": population_evolution_total.get(land.id, 0),
                        "y": consommation_total.get(land.id, 0),
                        "z": last_year_populations.get(land.id, 0),
                    }
                ],
                "color": HIGHLIGHT_COLOR if land.id == highlighted_land_id else None,
                "marker": {
                    "lineWidth": 3 if land.id == highlighted_land_id else 1,
                },
                # La couleur du territoire diagnostiqué est précisée, les autres sont aléatoires (valeur None)
            }
            for land in lands
        ]

    @property
    def series(self):
        """Combine bubble and median series."""
        return self.bubble_series + self.median_series

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
                    "Consommation d'espaces NAF au regard de l'évolution de la population "
                    "du territoire et des territoires similaires"
                )
            },
            "xAxis": {
                "gridLineWidth": 1,
                "title": {"text": "Évolution démographique (hab)"},
                "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
            },
            "yAxis": {
                "title": {"text": "Consommation d'espaces NAF (ha)"},
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

        consommation_total = {c.land.id: c.total for c in self.data["consommation_stats"]}
        population_evolution_total = {p.land.id: p.evolution for p in self.data["population_stats"]}
        last_year_populations = {
            p.land.id: p.last_year_population.population for p in self.data["population_progression"]
        }

        for land in lands:
            rows.append(
                {
                    "name": land.name,
                    "data": [
                        land.name,
                        consommation_total.get(land.id, 0),
                        population_evolution_total.get(land.id, 0),
                        last_year_populations.get(land.id, 0),
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
        }
