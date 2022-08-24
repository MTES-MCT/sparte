from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from public_data.models import Commune, CommuneDiff

from .models import Emprise


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class ArtifEvolutionSubSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "year_old",
            "year_new",
            "new_artif",
            "new_natural",
            "net_artif",
        )
        model = CommuneDiff


class ProjectCommuneSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_area = serializers.FloatField()
    conso_1121_art = serializers.FloatField()
    conso_1121_hab = serializers.FloatField()
    conso_1121_act = serializers.FloatField()
    artif_evo = ArtifEvolutionSubSerializer(
        source="communediff_set", many=True, read_only=True
    )

    class Meta:
        fields = (
            "id",
            "name",
            "insee",
            "area",
            "map_color",
            "artif_area",
            "conso_1121_art",
            "conso_1121_hab",
            "conso_1121_act",
            "surface_artif",
            "artif_evo",
        )
        geo_field = "mpoly"
        model = Commune
