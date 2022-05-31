from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.db.models import Sum, DecimalField, Manager
from django.db.models.functions import Cast


def cast_sum(field, filter=None, divider=10000):
    """Add all required data to a queryset to sum a field and return a Decimal"""
    return Cast(
        Sum(field, filter=filter, default=0) / divider,
        DecimalField(max_digits=15, decimal_places=2),
    )


class IntersectMixin:
    """Add intersection capability to a models Manager"""

    def intersect(self, geom):
        """Filter queryset on intersection between class mpoly field and geom args
        add intersection and intersection_area fields"""
        queryset = self.filter(mpoly__intersects=geom)
        queryset = queryset.annotate(
            intersection=Intersection("mpoly", geom),
            intersection_area=Area(Transform("intersection", 2154)),
        )
        return queryset


class IntersectManager(IntersectMixin, Manager):
    pass
