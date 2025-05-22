from rest_framework import serializers as s
from rest_framework_gis import serializers

from public_data import models


class DepartementSerializer(s.ModelSerializer):
    class Meta:
        fields = (
            "source_id",
            "name",
            "region_id",
            "is_artif_ready",
            "ocsge_millesimes",
        )
        model = models.Departement


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
    name = s.CharField()
    source_id = s.SerializerMethodField()
    public_key = s.CharField()
    area = s.FloatField()
    land_type = s.CharField()
    land_type_label = s.CharField()

    def get_source_id(self, obj) -> str:
        return obj.get_official_id()
