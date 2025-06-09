from django.db import models

from .BaseLandFriche import BaseLandFricheSerializer, BaseLandFricheViewset


class LandFricheGeojson(models.Model):
    land_id = models.CharField()
    land_type = models.CharField()
    land_name = models.CharField()
    geojson_feature_collection = models.JSONField()

    class Meta:
        managed = False
        db_table = "public_data_landfrichegeojson"


class LandFricheGeojsonSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheGeojson


class LandFricheGeojsonViewset(BaseLandFricheViewset):
    serializer_class = LandFricheGeojsonSerializer
