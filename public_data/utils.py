from django.contrib.gis.geos import Polygon, MultiPolygon


def fix_poly(field):
    if isinstance(field, Polygon):
        return MultiPolygon(field)
    elif isinstance(field, MultiPolygon):
        return field
    else:
        raise TypeError("Field should be Polygon or MultiPolygon")
