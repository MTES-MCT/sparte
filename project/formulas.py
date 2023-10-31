from django.contrib.gis.geos import MultiPolygon

from public_data.models import ZoneUrba


def test(geom: MultiPolygon):
    """Croise les zones du GPU avec les données de l'OCS GE et renvoit le taux de remplissage agrégé par type de zone."""
    zones = ZoneUrba.objects.intersect(geom)  # noqa: F841
