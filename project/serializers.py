from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from public_data.models import Commune

from .models import Emprise, PlanEmprise


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class PlanEmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "plan",
        )
        geo_field = "mpoly"
        model = PlanEmprise


class ProjectCommuneSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_area = serializers.FloatField()

    class Meta:
        fields = (
            "id",
            "name",
            "insee",
            "area",
            "map_color",
            "artif_area",
        )
        geo_field = "mpoly"
        model = Commune
