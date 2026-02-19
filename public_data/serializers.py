from rest_framework import serializers as s

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


class SearchLandSerializer(s.Serializer):
    needle = s.CharField(required=True)
