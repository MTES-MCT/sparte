from rest_framework import serializers as s


class SearchLandSerializer(s.Serializer):
    needle = s.CharField(required=True)
