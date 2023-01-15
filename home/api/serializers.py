from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from public_data.models import Region


class RegionSerializer(GeoFeatureModelSerializer):
    map_color = serializers.CharField()
    total = serializers.IntegerField()

    class Meta:
        fields = ("id", "name", "map_color", "total")
        geo_field = "mpoly"
        model = Region
