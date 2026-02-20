import json

from django.db import connection
from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from public_data import serializers
from public_data.models.administration import LandModel, LandModelSearchSerializer
from public_data.throttles import SearchLandApiThrottle


class grid_view(APIView):
    def get(self, request, format=None):
        """Return a grid of squares of 1000 size and inside a given bbox."""

        params = [int(request.query_params.get("gride_size", "1000")) * 0.008983]
        bbox = request.query_params.get("in_bbox").split(",")
        params += list(map(float, bbox))

        query = (
            "SELECT st_AsGeoJSON(squares.geom, 6, 0) as mpoly "
            "FROM ST_SquareGrid(%s, ST_MakeEnvelope(%s, %s, %s, %s, 4326)) AS squares"
        )

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            geojson = {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": [
                    {
                        "type": "Feature",
                        "geometry": json.loads(row[0]),
                    }
                    for row in cursor.fetchall()
                ],
            }

        return Response(geojson)


class SearchLandApiView(GenericViewSet):
    serializer_class = serializers.SearchLandSerializer
    throttle_classes = [SearchLandApiThrottle]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        needle = serializer.validated_data["needle"]

        results = LandModel.search(needle, search_for="*")
        output = LandModelSearchSerializer(results, many=True).data

        return Response(data=output)


class RapportCompletView(TemplateView):
    template_name = "public_data/rapport_complet.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "land_type": self.kwargs.get("land_type"),
                "land_id": self.kwargs.get("land_id"),
            }
        )
        return super().get_context_data(**kwargs)


class RapportDraftView(TemplateView):
    template_name = "public_data/rapport_draft.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "draft_id": self.kwargs.get("draft_id"),
            }
        )
        return super().get_context_data(**kwargs)


class PdfHeaderView(TemplateView):
    template_name = "public_data/pdf_header.html"


class PdfFooterView(TemplateView):
    template_name = "public_data/pdf_footer.html"
