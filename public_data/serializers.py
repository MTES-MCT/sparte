from rest_framework import serializers as s
from rest_framework_gis import serializers

from public_data import models


class CommuneSerializer(serializers.GeoFeatureModelSerializer):
    """Marker GeoJSON serializer."""

    class Meta:
        """Marker serializer meta class."""

        fields = (
            "id",
            "name",
            "insee",
            "area",
            "map_color",
        )
        geo_field = "mpoly"
        model = models.Commune


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


class RegionSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "name",
        )
        model = models.Region
        geo_field = "mpoly"


class DepartementSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
            "region_id",
        )
        model = models.Departement
        geo_field = "mpoly"


class ScotSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "name",
            "region_id",
            "departement_id",
        )
        model = models.Scot
        geo_field = "mpoly"


class EpciSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
        )
        model = models.Epci
        geo_field = "mpoly"


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

    def get_source_id(self, obj) -> str:
        return obj.get_official_id()
