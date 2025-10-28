"""
Mixin for charts that support territory comparison.

This mixin provides common functionality for charts that compare
the current territory with nearest (neighboring) territories or custom territories.
"""

from functools import cached_property

from public_data.models.administration import LandModel
from public_data.models.demography import NearestTerritories


class ComparisonChartMixin:
    """
    Mixin for charts that support territory comparison.

    Provides:
    - Cached nearest territories data to avoid N+1 queries
    - Parsing of comparison_lands parameter
    - Fallback to nearest territories from database
    """

    @cached_property
    def _nearest_territories_data(self):
        """
        Cache for nearest territories data to avoid N+1 queries.

        Fetches all NearestTerritories objects in a single query.
        Returns a dict mapping nearest_land_id -> NearestTerritories object.

        Returns:
            dict: Mapping of nearest_land_id to NearestTerritories instances
        """
        nearest_territories = NearestTerritories.objects.filter(
            land_id=self.land.land_id, land_type=self.land.land_type
        ).order_by("distance_rank")[:8]

        return {nt.nearest_land_id: nt for nt in nearest_territories}

    def _get_comparison_lands(self):
        """
        Get list of lands to compare, including the current land.

        If comparison_lands parameter is provided, uses custom territories.
        Otherwise, falls back to nearest territories from the database.

        Returns:
            list[LandModel]: List of lands starting with current land,
                           followed by comparison/nearest lands
        """
        comparison_lands = [self.land]

        # Check if custom comparison lands are provided
        if "comparison_lands" in self.params and self.params["comparison_lands"]:
            custom_lands = self._parse_comparison_lands_param()
            comparison_lands.extend(custom_lands)
        else:
            nearest_lands = self._get_nearest_territories_lands()
            comparison_lands.extend(nearest_lands)

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

    def _get_nearest_territories_lands(self):
        """
        Get LandModel instances for nearest territories from database.

        Uses cached nearest territories data to maintain distance_rank order.

        Returns:
            list[LandModel]: Ordered list of nearest territory LandModel instances
        """
        nearest_land_ids = list(self._nearest_territories_data.keys())

        # Fetch all nearest lands in a single optimized query
        nearest_lands = LandModel.objects.filter(land_id__in=nearest_land_ids, land_type=self.land.land_type)

        # Create ordered list maintaining distance_rank order
        # Use dict to map land_id to LandModel for efficient lookup
        nearest_lands_dict = {land.land_id: land for land in nearest_lands}

        ordered_lands = []
        for land_id in nearest_land_ids:
            if land_id in nearest_lands_dict:
                ordered_lands.append(nearest_lands_dict[land_id])

        return ordered_lands
