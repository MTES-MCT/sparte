"""
Mixin for charts that support territory comparison.

This mixin provides common functionality for charts that compare
the current territory with similar territories or custom territories.
"""

from functools import cached_property

from public_data.models.administration import LandModel
from public_data.models.demography import SimilarTerritories


class ComparisonChartMixin:
    """
    Mixin for charts that support territory comparison.

    Provides:
    - Cached similar territories data to avoid N+1 queries
    - Parsing of comparison_lands parameter
    - Fallback to similar territories from database
    """

    @cached_property
    def _similar_territories_data(self):
        """
        Cache for similar territories data to avoid N+1 queries.

        Fetches all SimilarTerritories objects in a single query.
        Returns a dict mapping similar_land_id -> SimilarTerritories object.

        Returns:
            dict: Mapping of similar_land_id to SimilarTerritories instances
        """
        similar_territories = SimilarTerritories.objects.filter(
            land_id=self.land.land_id, land_type=self.land.land_type
        ).order_by("similarity_rank")[:8]

        return {st.similar_land_id: st for st in similar_territories}

    def _get_comparison_lands(self):
        """
        Get list of lands to compare, including the current land.

        If comparison_lands parameter is provided, uses custom territories.
        Otherwise, falls back to similar territories from the database.

        Returns:
            list[LandModel]: List of lands starting with current land,
                           followed by comparison/similar lands
        """
        comparison_lands = [self.land]

        # Check if custom comparison lands are provided
        if "comparison_lands" in self.params and self.params["comparison_lands"]:
            custom_lands = self._parse_comparison_lands_param()
            comparison_lands.extend(custom_lands)
        else:
            similar_lands = self._get_similar_territories_lands()
            comparison_lands.extend(similar_lands)

        return comparison_lands

    def _parse_comparison_lands_param(self):
        """
        Parse comparison_lands parameter into LandModel instances.

        Expected format: "COMM_69123,EPCI_200046977,DEPART_69"

        Returns:
            list[LandModel]: List of valid LandModel instances
        """
        custom_lands = []
        land_keys = self.params["comparison_lands"].split(",")

        for land_key in land_keys:
            try:
                land_type, land_id = land_key.strip().split("_")
                land = LandModel.objects.get(land_id=land_id, land_type=land_type)
                custom_lands.append(land)
            except (ValueError, LandModel.DoesNotExist):
                # Skip invalid land keys (malformed or non-existent)
                continue

        return custom_lands

    def _get_similar_territories_lands(self):
        """
        Get LandModel instances for similar territories from database.

        Uses cached similar territories data to maintain similarity_rank order.

        Returns:
            list[LandModel]: Ordered list of similar territory LandModel instances
        """
        similar_land_ids = list(self._similar_territories_data.keys())

        # Fetch all similar lands in a single optimized query
        similar_lands = LandModel.objects.filter(land_id__in=similar_land_ids, land_type=self.land.land_type)

        # Create ordered list maintaining similarity_rank order
        # Use dict to map land_id to LandModel for efficient lookup
        similar_lands_dict = {land.land_id: land for land in similar_lands}

        ordered_lands = []
        for land_id in similar_land_ids:
            if land_id in similar_lands_dict:
                ordered_lands.append(similar_lands_dict[land_id])

        return ordered_lands
