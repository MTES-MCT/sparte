from django.db import models


class LandGeoJSON(models.Model):
    """Pre-computed GeoJSON FeatureCollections per parent territory + child type."""

    land_id = models.CharField(max_length=255)
    land_type = models.CharField(max_length=50)
    child_land_type = models.CharField(max_length=50)
    geojson = models.JSONField()

    class Meta:
        managed = False
        db_table = "public_data_land_geojson"

    @classmethod
    def for_parent(cls, land_id, land_type, child_land_type):
        """Return pre-computed GeoJSON FeatureCollection for a parent's children."""
        return cls.objects.filter(
            land_id=land_id,
            land_type=land_type,
            child_land_type=child_land_type,
        ).values_list(
            "geojson", flat=True
        ).first() or {"type": "FeatureCollection", "features": []}
