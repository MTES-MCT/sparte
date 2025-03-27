from rest_framework import serializers
from rest_framework.serializers import SerializerMethodField
from rest_framework_gis import serializers as gis_serializers
from rest_framework_gis.serializers import GeometrySerializerMethodField

from project.models import Project
from public_data.models import Commune

from .models import Emprise


class ProjectDetailSerializer(gis_serializers.GeoModelSerializer):
    emprise = GeometrySerializerMethodField()
    bounds = SerializerMethodField()
    max_bounds = SerializerMethodField()
    centroid = SerializerMethodField()
    departements = SerializerMethodField()

    def get_departements(self, obj):
        return obj.land.get_departements()

    def get_bounds(self, obj):
        return obj.combined_emprise.extent

    def get_max_bounds(self, obj):
        return obj.combined_emprise.buffer(0.2).extent

    def get_centroid(self, obj):
        centroid = obj.combined_emprise.centroid
        return {
            "latitude": centroid.y,
            "longitude": centroid.x,
        }

    def get_emprise(self, obj):
        return obj.combined_emprise.simplify(0.001)

    class Meta:
        model = Project
        geo_field = "combined_emprise"
        fields = [
            "id",
            "created_date",
            "level_label",
            "analyse_start_date",
            "analyse_end_date",
            "territory_name",
            "has_zonage_urbanisme",
            "consommation_correction_status",
            "autorisation_logement_available",
            "logements_vacants_available",
            "land_id",
            "land_type",
            "departements",
            "bounds",
            "max_bounds",
            "centroid",
            "emprise",
        ]


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class ProjectCommuneSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_area = serializers.FloatField()
    conso_1121_art = serializers.FloatField()
    conso_1121_hab = serializers.FloatField()
    conso_1121_act = serializers.FloatField()
    surface_artif = serializers.FloatField()

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
        )
        geo_field = "mpoly"
        model = Commune
