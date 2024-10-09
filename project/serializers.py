from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from project.models import Project
from public_data.models import Commune, CommuneDiff

from .models import Emprise


class ProjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "created_date",
            "level_label",
            "analyse_start_date",
            "analyse_end_date",
            "territory_name",
            "ocsge_coverage_status",
            "has_zonage_urbanisme",
        ]


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
    surface_artif = serializers.FloatField()
    artif_evo = ArtifEvolutionSubSerializer(source="communediff_set", many=True, read_only=True)

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


class CitySpaceConsoMapSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_area = serializers.FloatField()

    class Meta:
        fields = (
            "id",
            "name",
            "insee",
            "area",
            "artif_area",
        )
        geo_field = "mpoly"
        model = Commune


class CityArtifMapSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_evo = ArtifEvolutionSubSerializer(source="communediff_set", many=True, read_only=True)

    class Meta:
        fields = (
            "id",
            "name",
            "insee",
            "area",
            "surface_artif",
            "artif_evo",
        )
        geo_field = "mpoly"
        model = Commune
