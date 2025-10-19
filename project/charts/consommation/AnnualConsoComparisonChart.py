from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CEREMA_CREDITS,
    HIGHLIGHT_COLOR,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.containers import PublicDataContainer
from public_data.models.administration import LandModel
from public_data.models.demography import SimilarTerritories


class AnnualConsoComparisonChart(DiagnosticChart):
    """
    Graphique de consommation annuelle d'espaces des territoires similaires.
    """

    @property
    def name(self):
        return f"conso comparison {self.params['start_date']}-{self.params['end_date']}"

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
        Get consumption progression data for current land and similar territories.

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
        return PublicDataContainer.consommation_progression_service().get_by_lands(
            lands=comparison_lands,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )

    @property
    def series(self):
        """
        Génère les séries principales et les séries de drilldown.
        """
        main_series = []
        drilldown_series = []
        highlighted_land_id = self.land.land_id

        for land_conso in self.data:
            total_conso = sum(annual_conso.total for annual_conso in land_conso.consommation)

            main_series.append(
                {
                    "name": "Tous les territoires",
                    "data": [{"name": land_conso.land.name, "y": total_conso, "drilldown": land_conso.land.land_id}],
                    "color": HIGHLIGHT_COLOR if land_conso.land.land_id == highlighted_land_id else None,
                    "grouping": False,
                    "tooltip": {
                        "headerFormat": "<b>{point.key}</b><br/>",
                        "pointFormat": (
                            "Consommation d'espaces NAF entre "
                            f"{self.params['start_date']} et {self.params['end_date']} : "
                            "<b>{point.y:.2f} ha</b>"
                        ),
                    },
                }
            )

            drilldown_series.append(
                {
                    "id": land_conso.land.land_id,
                    "name": land_conso.land.name,
                    "data": [
                        {
                            "name": annual_conso.year,
                            "y": annual_conso.total,
                        }
                        for annual_conso in land_conso.consommation
                    ],
                    "custom": {"parentName": land_conso.land.name},
                    "tooltip": {
                        "headerFormat": "<b>{point.series.options.custom.parentName}</b><br/>",
                        "pointFormat": "Consommation d'espaces NAF en {point.name} : <b>{point.y:.2f} ha</b><br/>",
                    },
                }
            )
        return main_series, drilldown_series

    @property
    def param(self):
        main_series, drilldown_series = self.series

        return super().param | {
            "chart": {"type": "column", "height": 500},
            "title": {"text": "Consommation d'espaces NAF du territoire et des territoires similaires (ha)"},
            "subtitle": {"text": "Cliquez sur un territoire pour voir le détail de sa consommation d'espaces NAF."},
            "yAxis": {"title": {"text": "Consommation d'espaces NAF (ha)"}},
            "xAxis": {
                "type": "category",
                "labels": {
                    "rotation": -45,
                    "align": "right",
                },
            },
            "legend": {
                "enabled": False,
            },
            "series": main_series,
            "drilldown": {
                "series": drilldown_series,
                "breadcrumbs": {
                    "showFullPath": True,
                    "format": "{level.name}",
                    "buttonTheme": {"style": {"color": "#4318FF", "textDecoration": "none"}},
                },
            },
        }

    @property
    def data_table(self):
        """Generate data table showing consumption by territory."""
        headers = ["Territoire", "Consommation totale (ha)"]
        rows = []

        for land_conso in self.data:
            total_conso = sum(annual_conso.total for annual_conso in land_conso.consommation)

            rows.append(
                {
                    "name": land_conso.land.name,
                    "data": [
                        land_conso.land.name,
                        total_conso,
                    ],
                }
            )

        return {
            "headers": headers,
            "rows": rows,
        }


class AnnualConsoComparisonChartExport(AnnualConsoComparisonChart):
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
                    f"Comparaison de la consommation d'espaces NAF entre {self.land.name} "
                    "et les territoires similaires "
                    f"entre {self.params['start_date']} et {self.params['end_date']} (en ha)"
                )
            },
            "subtitle": {"text": ""},
        }
