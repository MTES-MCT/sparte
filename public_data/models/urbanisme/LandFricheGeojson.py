from django.db import models
from rest_framework.response import Response
from rest_framework.views import APIView

from public_data.models.administration import AdminRef

from .BaseLandFriche import BaseLandFricheSerializer


class LandFricheGeojson(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    land_name = models.CharField()
    geojson_feature_collection = models.JSONField()
    geojson_centroid_feature_collection = models.JSONField()

    class Meta:
        managed = False
        db_table = "public_data_landfrichegeojson"


class LandFricheGeojsonSerializer(BaseLandFricheSerializer):
    class Meta(BaseLandFricheSerializer.Meta):
        model = LandFricheGeojson


class LandFricheGeojsonViewset(APIView):
    def get(self, request, *args, **kwargs):
        land_id = request.query_params.get("land_id")
        land_type = request.query_params.get("land_type")

        queryset = LandFricheGeojson.objects.filter(land_id=land_id, land_type=land_type)

        features = []
        for obj in queryset:
            fc = obj.geojson_feature_collection
            if fc and "features" in fc:
                features.extend(fc["features"])

        return Response(
            {
                "type": "FeatureCollection",
                "features": features,
            }
        )


class LandFricheCentroidViewset(APIView):
    def get(self, request, *args, **kwargs):
        land_id = request.query_params.get("land_id")
        land_type = request.query_params.get("land_type")

        queryset = LandFricheGeojson.objects.filter(land_id=land_id, land_type=land_type)

        features = []
        for obj in queryset:
            centroid_fc = obj.geojson_centroid_feature_collection
            if centroid_fc and "features" in centroid_fc:
                features.extend(centroid_fc["features"])

        return Response(
            {
                "type": "FeatureCollection",
                "features": features,
            }
        )
