from typing import Literal

from django.db.models import Sum
from django.utils.functional import cached_property

from .CommunePop import CommunePop


class LandMixin:
    """Interface to work seemlessly with all administration's level."""

    @cached_property
    def public_key(self):
        return f"{self.land_type}_{self.official_id}"

    @cached_property
    def area(self) -> float:
        """Return surface of the land in Ha"""
        return float(self.mpoly.transform(self.srid_source, clone=True).area / 10000)

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        raise NotImplementedError("need to be overridden")

    def get_official_id(self) -> str:
        return self.source_id if self.source_id is not None else ""

    def get_cities(self):
        raise NotImplementedError("need to be overridden")

    @property
    def official_id(self) -> str:
        raise NotImplementedError("need to be overridden")

    def get_pop_change_per_year(
        self,
        start: str = "2010",
        end: str = "2020",
        criteria: Literal["pop", "household"] = "pop",
    ):
        cities = (
            CommunePop.objects.filter(city__in=self.get_cities())
            .filter(year__gte=start, year__lte=end)
            .values("year")
            .annotate(pop_progression=Sum("pop_change"))
            .annotate(household_progression=Sum("household_change"))
            .order_by("year")
        )
        if criteria == "pop":
            data = {city["year"]: city["pop_progression"] for city in cities}
        else:
            data = {city["year"]: city["household_progression"] for city in cities}
        return {str(year): data.get(year, None) for year in range(int(start), int(end) + 1)}
