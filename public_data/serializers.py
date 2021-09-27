from rest_framework_gis import serializers

from .models import (
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    CouvertureSol,
    EnveloppeUrbaine2018,
    Ocsge2015,
    Ocsge2018,
    Renaturee2018to2015,
    Sybarval,
    Voirie2018,
    ZonesBaties2018,
    UsageSol,
)


class Artificialisee2015to2018Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "surface",
            "cs_2018",
            "us_2018",
            "cs_2015",
            "us_2015",
        )
        geo_field = "mpoly"
        model = Artificialisee2015to2018


class Artificielle2018Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "surface",
            "couverture",
        )
        geo_field = "mpoly"
        model = Artificielle2018


class CommunesSybarvalSerializer(serializers.GeoFeatureModelSerializer):
    """Marker GeoJSON serializer."""

    class Meta:
        """Marker serializer meta class."""

        fields = (
            "id",
            "id_source",
            "prec_plani",
            "nom",
            "code_insee",
            "statut",
            "arrondisst",
            "depart",
            "region",
            "pop_2014",
            "pop_2015",
            "_commune",
            "_n_arrdt",
            "_n_canton",
            "_nom_epci",
            "_siren_epc",
            "_nom_scot",
            "surface",
            "a_brute_20",
            "a_b_2015_2",
            "a_b_2018_2",
            "z_baties_2",
            "voirie_201",
            "tache_2018",
            "d_brute_20",
            "d_batie_20",
            "d_voirie_2",
        )
        geo_field = "mpoly"
        model = CommunesSybarval


class EnveloppeUrbaine2018Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "couverture",
            "surface",
            "a_brute_20",
            "z_batie_20",
            "d_brute_20",
            "d_batie_20",
        )
        geo_field = "mpoly"
        model = EnveloppeUrbaine2018


class Ocsge2015Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "couverture",
            "usage",
            "millesime",
            "couverture_label",
            "usage_label",
            "map_color",
        )
        geo_field = "mpoly"
        model = Ocsge2015


class Ocsge2018Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "couverture",
            "usage",
            "millesime",
            "couverture_label",
            "usage_label",
            "map_color",
        )
        geo_field = "mpoly"
        model = Ocsge2018


class Renaturee2018to2015Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "surface",
            "cs_2018",
            "us_2018",
            "cs_2015",
            "us_2015",
        )
        geo_field = "mpoly"
        model = Renaturee2018to2015


class SybarvalSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "surface",
            "a_brute_20",
            "a_b_2015_2",
            "a_b_2018_2",
            "z_baties_2",
            "voirie_201",
            "tache_2018",
            "d_brute_20",
            "d_batie_20",
            "d_voirie_2",
        )
        geo_field = "mpoly"
        model = Sybarval


class Voirie2018Serializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "couverture",
            "usage",
            "surface",
        )
        geo_field = "mpoly"
        model = Voirie2018


class ZonesBaties2018Serializer(serializers.GeoFeatureModelSerializer):
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
