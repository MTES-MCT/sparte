from django.contrib.gis.db.models.functions import Area, Intersection, Transform
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.db.models import DecimalField, Manager, QuerySet, Sum
from django.db.models.functions import Cast, Coalesce

Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))


def cast_sum_area(field, filter=None, divider=10000):
    """
    Sum all area fields and cast the total to DecimalField.
    The area field is in m², so by default we divide by 10000 to get hectares.
    """

    return Cast(
        Coalesce(Sum(field, filter=filter, default=Zero), 0) / divider,
        DecimalField(max_digits=15, decimal_places=2),
    )


class IntersectMixin:
    """Add intersection capability to a models Manager"""

    def intersect(self, geom) -> QuerySet:
        """Filter queryset on intersection between class mpoly field and geom args
        add intersection and intersection_area fields"""
        queryset = self.filter(mpoly__intersects=geom)  # type: ignore
        queryset = queryset.annotate(
            intersection=Intersection("mpoly", geom),
            intersection_area=Coalesce(
                Area(Transform("intersection", 2154)),
                Zero,
            ),
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
