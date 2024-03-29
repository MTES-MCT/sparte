from logging import getLogger

from django.contrib.gis.db.models import Func, MultiPolygonField
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.contrib.gis.geos import GeometryCollection, MultiPolygon, Polygon
from django.db.models import DecimalField, Manager, QuerySet, Sum
from django.db.models.functions import Cast, Coalesce

from public_data.models.enums import SRID

logger = getLogger(__name__)

Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=SRID.LAMBERT_93))


class DynamicSRIDTransform(Func):
    """
    The built-in Transform function cannot dynamically get the srid
    of a field to perform the transformation. This function allows
    to do so.

    NOTE: outputs MultiPolygon by default. Override output_field to
    change this.

    Examples:
    >>> DynamicSRIDTransform('mpoly', 'srid_source')
    >>> DynamicSRIDTransform('mpoly', 2154)
    >>> DynamicSRIDTransform('mpoly', 'srid_source', output_field=PolygonField())
    """

    function = "ST_Transform"
    arity = 2
    output_field = MultiPolygonField()

    def __init__(self, expression, srid_source, **extra):
        super().__init__(expression, srid_source, **extra)


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
        return self.filter(mpoly__intersects=geom).annotate(
            intersection=Intersection(MakeValid("mpoly"), geom),
            intersection_area=Coalesce(
                Area(DynamicSRIDTransform("intersection", "srid_source")),
                Zero,
            ),
        )


class IntersectManager(IntersectMixin, Manager):
    pass


def fix_poly(field) -> MultiPolygon:
    if isinstance(field, Polygon):
        return MultiPolygon(field)

    if isinstance(field, MultiPolygon):
        return field

    if isinstance(field, GeometryCollection):
        multipolygon = MultiPolygon()

        for geom_part in field:
            if isinstance(geom_part, Polygon):
                multipolygon.append(geom_part)
            elif isinstance(geom_part, MultiPolygon):
                multipolygon.extend(geom_part)
            else:
                logger.info(
                    msg=(
                        f"GeometryCollection contains unexpected type: {geom_part.geom_type}.",
                        "This is probably the result of MakeValid.",
                        "Ignored",
                    )
                )

        return multipolygon

    raise TypeError(f"Field should be Polygon, MultiPolygon or GeometryCollection. Found: {field.geom_type}")
