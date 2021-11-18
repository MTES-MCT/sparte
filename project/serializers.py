from rest_framework_gis import serializers

from .models import Emprise, PlanEmprise


class EmpriseSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class PlanEmpriseSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "plan",
        )
        geo_field = "mpoly"
        model = PlanEmprise
