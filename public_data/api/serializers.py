from rest_framework import serializers as s
from rest_framework_gis import serializers

from public_data import models


def get_label(code="", label=""):
    if code is None:
        code = "-"
    if label is None:
        label = "inconnu"
    return f"{code} {label[:30]}"


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
    couverture = s.SerializerMethodField()
    usage = s.SerializerMethodField()

    def get_couverture(self, obj):
        return get_label(code=obj.couverture, label=obj.couverture_label)

    def get_usage(self, obj):
        return get_label(code=obj.usage, label=obj.usage_label)

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
            "cs_old_label",
            "cs_new_label",
            "us_old_label",
            "us_new_label",
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
