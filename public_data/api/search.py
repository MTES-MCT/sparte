from rest_framework import serializers
from rest_framework.decorators import APIView
from rest_framework.response import Response

from public_data.models import AdminRef, Commune, Departement, Epci, Land, Region, Scot


class SearchLandSerializer(serializers.Serializer):
    query = serializers.CharField(required=True)
    search_for = serializers.CharField(required=False, default="*", allow_blank=False)
    departement = serializers.PrimaryKeyRelatedField(
        queryset=Departement.objects.all(), required=False, allow_null=True
    )
    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all(), required=False, allow_null=True)
    epci = serializers.PrimaryKeyRelatedField(queryset=Epci.objects.all(), required=False, allow_null=True)


class LandSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    source_id = serializers.SerializerMethodField()

    def get_source_id(self, obj) -> str:
        if isinstance(obj, Commune):
            return obj.insee
        elif isinstance(obj, Departement):
            return obj.source_id
        elif isinstance(obj, Region):
            return obj.source_id
        elif isinstance(obj, Epci):
            return obj.source_id
        elif isinstance(obj, Scot):
            return obj.siren

        raise Exception("Unknown type")


class SearchLandApiView(APIView):
    serializer_class = SearchLandSerializer

    def post(self, request, format=None) -> Response:
        serializer = SearchLandSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(data=serializer.errors, status=400)

        results = Land.search(
            needle=serializer.validated_data.get("query"),
            search_for=serializer.validated_data.get("search_for"),
            departement=serializer.validated_data.get("departement"),
            region=serializer.validated_data.get("region"),
            epci=serializer.validated_data.get("epci"),
        )

        output = {}

        for land_type, lands in results.items():
            output[AdminRef.get_label(land_type)] = LandSerializer(lands, many=True).data

        return Response(data=output)
