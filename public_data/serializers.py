from rest_framework_gis import serializers
from rest_framework import serializers as s

from .models import (
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    CouvertureSol,
    Departement,
    EnveloppeUrbaine2018,
    Epci,
    Ocsge,
    # RefPlan,
    Region,
    Renaturee2018to2015,
    Sybarval,
    Voirie2018,
    ZonesBaties2018,
    UsageSol,
)


def get_label(code="", label=""):
    if code is None:
        code = "-"
    if label is None:
        label = "inconnu"
    return f"{code} {label[:30]}"


class Artificialisee2015to2018Serializer(serializers.GeoFeatureModelSerializer):
    usage_2015 = s.SerializerMethodField()
    usage_2018 = s.SerializerMethodField()
    couverture_2015 = s.SerializerMethodField()
    couverture_2018 = s.SerializerMethodField()

    def get_usage_2015(self, obj):
        return get_label(code=obj.us_2015, label=obj.us_2015_label)

    def get_usage_2018(self, obj):
        return get_label(code=obj.us_2018, label=obj.us_2018_label)

    def get_couverture_2015(self, obj):
        return get_label(code=obj.cs_2015, label=obj.cs_2015_label)

    def get_couverture_2018(self, obj):
        return get_label(code=obj.cs_2018, label=obj.cs_2018_label)

    class Meta:
        fields = (
            "id",
            "surface",
            "usage_2015",
            "usage_2018",
            "couverture_2015",
            "couverture_2018",
        )
        geo_field = "mpoly"
        model = Artificialisee2015to2018


class Artificielle2018Serializer(serializers.GeoFeatureModelSerializer):
    # couverture = s.SerializerMethodField()

    def get_couverture(self, obj):
        return get_label(code=obj.couverture, label=obj.couverture_label)

    class Meta:
        fields = ("id",)
        geo_field = "mpoly"
        model = Artificielle2018


class CommunesSybarvalSerializer(serializers.GeoFeatureModelSerializer):
    """Marker GeoJSON serializer."""

    class Meta:
        """Marker serializer meta class."""

        fields = (
            "nom",
            "code_insee",
            "arrondisst",
            "depart",
            "region",
            "_nom_epci",
            "_nom_scot",
            "surface",
            "d_brute_20",
        )
        geo_field = "mpoly"
        model = CommunesSybarval


class EnveloppeUrbaine2018Serializer(serializers.GeoFeatureModelSerializer):
    couverture = s.SerializerMethodField()

    def get_couverture(self, obj):
        return get_label(code=obj.couverture, label=obj.couverture_label)

    class Meta:
        fields = ("id",)
        geo_field = "mpoly"
        model = EnveloppeUrbaine2018


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
        model = Ocsge


class Renaturee2018to2015Serializer(serializers.GeoFeatureModelSerializer):
    usage_2015 = s.SerializerMethodField()
    usage_2018 = s.SerializerMethodField()
    couverture_2015 = s.SerializerMethodField()
    couverture_2018 = s.SerializerMethodField()

    def get_usage_2015(self, obj):
        return get_label(code=obj.us_2015, label=obj.us_2015_label)

    def get_usage_2018(self, obj):
        return get_label(code=obj.us_2018, label=obj.us_2018_label)

    def get_couverture_2015(self, obj):
        return get_label(code=obj.cs_2015, label=obj.cs_2015_label)

    def get_couverture_2018(self, obj):
        return get_label(code=obj.cs_2018, label=obj.cs_2018_label)

    class Meta:
        fields = (
            "id",
            "surface",
            "usage_2015",
            "usage_2018",
            "couverture_2015",
            "couverture_2018",
        )
        geo_field = "mpoly"
        model = Renaturee2018to2015


class SybarvalSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "surface",
        )
        geo_field = "mpoly"
        model = Sybarval


class Voirie2018Serializer(serializers.GeoFeatureModelSerializer):
    couverture = s.SerializerMethodField()
    usage = s.SerializerMethodField()

    def get_couverture(self, obj):
        return get_label(code=obj.couverture, label=obj.couverture_label)

    def get_usage(self, obj):
        return get_label(code=obj.usage, label=obj.usage_label)

    class Meta:
        fields = (
            "id",
            "surface",
            "couverture",
            "usage",
        )
        geo_field = "mpoly"
        model = Voirie2018


class ZonesBaties2018Serializer(serializers.GeoFeatureModelSerializer):
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
            "surface",
        )
        geo_field = "mpoly"
        model = ZonesBaties2018


class CouvertureSolSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "id",
            "parent",
            "code",
            "label",
            "is_artificial",
        )
        model = CouvertureSol


class UsageSolSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "id",
            "parent",
            "code",
            "label",
        )
        model = UsageSol


class RegionSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
        )
        model = Region
        geo_field = "mpoly"


class DepartementSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
            "region_id",
        )
        model = Departement
        geo_field = "mpoly"


class EpciSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "source_id",
            "name",
        )
        model = Epci
        geo_field = "mpoly"
