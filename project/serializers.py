from rest_framework_gis import serializers

from .models import Emprise


class EmpriseSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise
