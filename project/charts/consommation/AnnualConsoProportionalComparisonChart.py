from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import CEREMA_CREDITS, LEGEND_NAVIGATION_EXPORT
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.highchart.ConsoProportionalComparisonMapper import (
    ConsoProportionalComparisonMapper,
)
from public_data.models.administration import LandModel
from public_data.models.demography import SimilarTerritories


class AnnualConsoProportionalComparisonChart(DiagnosticChart):
    """
    Graphique tree map de consommation d'espaces proportionnelle à la surface des territoires.
    """

    @property
    def name(self):
        return f"conso proportional comparison {self.params['start_date']}-{self.params['end_date']}"

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
        Get consumption stats for current land and similar territories.

        Returns consumption data for:
        1. The current territory (highlighted in the chart)
        2. Custom territories if comparison_lands param is provided
        3. Otherwise, up to 8 similar territories from for_app_similar_territories table

        Similar territories are automatically selected based on population similarity
        and geographic proximity.

        Uses @cached_property to avoid re-executing queries on multiple accesses.
        """
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

        # Récupérer les données de consommation pour tous les territoires
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
