from django.contrib.gis.db.models.functions import Area, Intersection, Transform
from django.contrib.gis.geos import (
    GeometryCollection,
    LineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
)
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
    elif isinstance(field, MultiPolygon):
        return field
    else:
        raise TypeError(f"Field should be Polygon or MultiPolygon. Found: {field.geom_type}")


def __buffer_geometry_and_make_it_valid(
    geom: LineString | Point | MultiPoint,
) -> Polygon | MultiPolygon | GeometryCollection:
    """
    NOTE: please delete me with the make_multipolygon_valid function below
    as soon as possible.
    """
    buffered = geom.buffer(0.0000000001).make_valid()

    if (
        not isinstance(buffered, Polygon)
        and not isinstance(buffered, MultiPolygon)
        and not isinstance(buffered, GeometryCollection)
    ):
        raise Exception(f"Unexpected geometry type while make geometry valid: {geom.geom_type}")

    return buffered


def make_multipolygon_valid(
    geom: MultiPolygon | Polygon | LineString | MultiPoint | Point | GeometryCollection,
) -> MultiPolygon:
    """
    This command will recursively make a geom into a valid multipolygon
    from a geometry of various type.

    Multiparts geometries (GeometryCollection, Multipoint etc ...) will be
    converted to polygons, adn assembled into a multipolygon.

    Already valid multipolygon will be returned as is.

    NOTE: The function will not erase all topological errors, the output
    should always checked manually before being used. Delete this function
    when the data is fixed upstream and loadable. I repeat, this function
    is a hack, it is not a future proof fix.
    """
    ouput_geom = None
    geom = geom.make_valid()

    if isinstance(geom, MultiPolygon):
        ouput_geom = geom
    elif isinstance(geom, Polygon):
        ouput_geom = MultiPolygon(geom)
    elif isinstance(geom, LineString) or isinstance(geom, MultiPoint) or isinstance(geom, Point):
        ouput_geom = make_multipolygon_valid(__buffer_geometry_and_make_it_valid(geom))
    elif isinstance(geom, GeometryCollection):
        ouput_geom = MultiPolygon()

        for geom_part in geom:
            ouput_geom.extend(make_multipolygon_valid(geom_part))
    else:
        raise Exception(f"Unexpected input geometry type while making a valid multipolygon : {geom.geom_type}")

    return ouput_geom
