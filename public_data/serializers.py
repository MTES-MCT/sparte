from rest_framework import serializers as s
from rest_framework_gis import serializers

from public_data import models


class OcsgeSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "couverture",
            "usage",
            "millesime",
            "map_color",
            "year",
        )
        geo_field = "mpoly"
        model = models.Ocsge


class OcsgeDiffSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "year_old",
            "year_new",
            "is_new_artif",
            "is_new_natural",
        )
        geo_field = "mpoly"
        model = models.OcsgeDiff


class CouvertureSolSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "id",
            "parent",
            "code",
            "label",
        )
        model = models.CouvertureSol


class UsageSolSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "id",
            "parent",
            "code",
            "label",
        )
        model = models.UsageSol


class DepartementSerializer(s.ModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
            "region_id",
            "is_artif_ready",
            "ocsge_millesimes",
        )
        model = models.Departement


class ZoneConstruiteSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "id_source",
            "millesime",
            "year",
        )
        model = models.ZoneConstruite
        geo_field = "mpoly"


class ZoneUrbaSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "libelle",
            "libelong",
            "typezone",
            "urlfic",
            "datappro",
            "datvalid",
        )
        model = models.ZoneUrba
        geo_field = "mpoly"


class SearchLandSerializer(s.Serializer):
    needle = s.CharField(required=True)


class LandSerializer(s.Serializer):
    id = s.IntegerField()
    name = s.CharField()
    source_id = s.SerializerMethodField()
    public_key = s.CharField()
    area = s.FloatField()

    def get_source_id(self, obj) -> str:
        return obj.get_official_id()
