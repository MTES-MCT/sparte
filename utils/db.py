from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.db.models import Sum, DecimalField, Manager
from django.db.models.functions import Cast, Coalesce


def cast_sum(field, filter=None, divider=10000):
    """Add all required data to a queryset to sum a field and return a Decimal"""
    return Cast(
        Coalesce(Sum(field, filter=filter, default=0), 0) / divider,
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


def fix_poly(field):
    if isinstance(field, Polygon):
        return MultiPolygon(field)
    elif isinstance(field, MultiPolygon):
        return field
    else:
        raise TypeError("Field should be Polygon or MultiPolygon")
